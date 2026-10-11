import Papa from 'papaparse';
import {
  CleaningOptions,
  ColumnProfile,
  CorrelationPair,
  CsvInsight,
  DataQualityIssue,
  DatasetOverview,
  InferredColumnType,
} from '../types/csv';

export interface ParsedCsvResult {
  headers: string[];
  rows: (string | number | boolean | null)[][];
  rawText: string;
  fileName: string;
  fileSizeBytes: number;
  overview: DatasetOverview;
  columnProfiles: ColumnProfile[];
  issues: DataQualityIssue[];
  correlationPairs: CorrelationPair[];
  insights: CsvInsight[];
}

export function parseCsvContent(
  csvText: string,
  fileName: string = 'dataset.csv',
  fileSizeBytes: number = 0
): ParsedCsvResult {
  const parseResult = Papa.parse(csvText, {
    header: false,
    skipEmptyLines: false, // so we detect empty rows explicitly
    dynamicTyping: false, // we will perform fine-grained type detection ourselves
  });

  const rawRows = (parseResult.data as string[][]) || [];
  const parsingErrors = parseResult.errors || [];

  if (rawRows.length === 0) {
    throw new Error('CSV file is empty or could not be parsed.');
  }

  // Row 0 is header
  const rawHeaders = rawRows[0] || [];
  const headerCount = rawHeaders.length;
  const sanitizedHeaders = rawHeaders.map((h, i) => (h && h.trim().length > 0 ? h.trim() : `Column_${i + 1}`));

  // Check duplicate headers
  const issues: DataQualityIssue[] = [];
  const headerSeen = new Map<string, number>();
  sanitizedHeaders.forEach((h, idx) => {
    const count = headerSeen.get(h) || 0;
    if (count > 0) {
      issues.push({
        id: `dup-hdr-${idx}`,
        issueType: 'duplicate_header',
        severity: 'high',
        dataRowIndex: 0,
        csvLineNumber: 1,
        columnName: h,
        originalValue: h,
        message: `Header "${h}" appears multiple times in the file header.`,
      });
    }
    headerSeen.set(h, count + 1);
  });

  // Data rows (from physical line 2 onwards)
  const dataRowsRaw = rawRows.slice(1);
  let emptyRowsCount = 0;
  const processedDataRows: (string | number | boolean | null)[][] = [];

  // Track row hash for duplicate row detection
  const rowHashTracker = new Map<string, number>();
  let duplicateRowsCount = 0;
  let missingCellsCount = 0;
  let whitespaceCellsCount = 0;

  dataRowsRaw.forEach((row, dataRowIdx) => {
    const csvLineNumber = dataRowIdx + 2; // Line 1 is header

    // Check if entire row is empty
    const isRowCompletelyEmpty = row.length === 0 || row.every((c) => c === null || c === undefined || c.trim() === '');
    if (isRowCompletelyEmpty) {
      emptyRowsCount++;
      return; // Skip empty rows from valid data rows
    }

    // Inconsistent length check
    if (row.length !== headerCount) {
      issues.push({
        id: `row-len-${dataRowIdx}`,
        issueType: 'missing_value',
        severity: 'high',
        dataRowIndex: dataRowIdx,
        csvLineNumber,
        columnName: 'ROW_STRUCTURE',
        originalValue: `Found ${row.length} columns, expected ${headerCount}`,
        message: `Row ${dataRowIdx + 1} has ${row.length} columns, while header defines ${headerCount}.`,
      });
    }

    // Pad or trim row to match headers
    const normalizedRow: (string | number | boolean | null)[] = [];

    for (let c = 0; c < headerCount; c++) {
      const colName = sanitizedHeaders[c];
      const val = c < row.length ? row[c] : null;

      if (val === null || val === undefined || val === '') {
        missingCellsCount++;
        normalizedRow.push(null);
        issues.push({
          id: `miss-${dataRowIdx}-${c}`,
          issueType: 'missing_value',
          severity: 'medium',
          dataRowIndex: dataRowIdx,
          csvLineNumber,
          columnName: colName,
          originalValue: val === '' ? '"" (Empty string)' : 'NULL',
          message: `Missing value in column "${colName}".`,
        });
      } else if (val.trim() === '' && val.length > 0) {
        whitespaceCellsCount++;
        missingCellsCount++;
        normalizedRow.push(null);
        issues.push({
          id: `white-${dataRowIdx}-${c}`,
          issueType: 'whitespace_only',
          severity: 'medium',
          dataRowIndex: dataRowIdx,
          csvLineNumber,
          columnName: colName,
          originalValue: `"${val}"`,
          message: `Whitespace-only cell in column "${colName}".`,
        });
      } else {
        const trimmed = val.trim();
        // Check for numeric
        const numVal = Number(trimmed);
        if (!isNaN(numVal) && trimmed !== '') {
          normalizedRow.push(numVal);
        } else if (trimmed.toLowerCase() === 'true' || trimmed.toLowerCase() === 'false') {
          normalizedRow.push(trimmed.toLowerCase() === 'true');
        } else {
          normalizedRow.push(trimmed);
        }
      }
    }

    // Check duplicate rows
    const rowKey = JSON.stringify(normalizedRow);
    const prevRowIndex = rowHashTracker.get(rowKey);
    if (prevRowIndex !== undefined) {
      duplicateRowsCount++;
      issues.push({
        id: `dup-row-${dataRowIdx}`,
        issueType: 'duplicate_row',
        severity: 'medium',
        dataRowIndex: dataRowIdx,
        csvLineNumber,
        columnName: 'ENTIRE_ROW',
        originalValue: null,
        message: `Exact duplicate of record at row #${prevRowIndex + 1} (Line ${prevRowIndex + 2}).`,
      });
    } else {
      rowHashTracker.set(rowKey, dataRowIdx);
    }

    processedDataRows.push(normalizedRow);
  });

  const totalDataRows = processedDataRows.length;
  const totalColumns = sanitizedHeaders.length;
  const totalCells = totalDataRows * totalColumns;
  const missingPercentage = totalCells > 0 ? Number(((missingCellsCount / totalCells) * 100).toFixed(2)) : 0;

  // Profile Columns
  const columnProfiles: ColumnProfile[] = [];
  const columnTypeCounts: Record<InferredColumnType, number> = {
    numeric: 0,
    categorical: 0,
    date: 0,
    boolean: 0,
    mixed: 0,
  };

  let constantColumnsCount = 0;

  for (let c = 0; c < totalColumns; c++) {
    const colName = sanitizedHeaders[c];
    const colValues = processedDataRows.map((r) => r[c]);

    let numCount = 0;
    let strCount = 0;
    let boolCount = 0;
    let nullCount = 0;
    const uniqueSet = new Set<string>();
    const frequencyMap = new Map<string, number>();

    colValues.forEach((v) => {
      if (v === null || v === undefined) {
        nullCount++;
      } else if (typeof v === 'number') {
        numCount++;
        const s = String(v);
        uniqueSet.add(s);
        frequencyMap.set(s, (frequencyMap.get(s) || 0) + 1);
      } else if (typeof v === 'boolean') {
        boolCount++;
        const s = String(v);
        uniqueSet.add(s);
        frequencyMap.set(s, (frequencyMap.get(s) || 0) + 1);
      } else {
        strCount++;
        uniqueSet.add(v);
        frequencyMap.set(v, (frequencyMap.get(v) || 0) + 1);
      }
    });

    // Inferred type
    const nonNullCount = totalDataRows - nullCount;
    let inferredType: InferredColumnType = 'categorical';

    if (numCount > 0 && numCount >= nonNullCount * 0.85) {
      inferredType = numCount === nonNullCount ? 'numeric' : 'mixed';
    } else if (boolCount > 0 && boolCount === nonNullCount) {
      inferredType = 'boolean';
    } else if (strCount > 0) {
      // Check date-like
      const dateChecks = colValues.filter((v) => typeof v === 'string').slice(0, 20);
      const isDateCandidate =
        dateChecks.length > 0 &&
        dateChecks.every((v) => {
          const s = String(v);
          return (
            (/\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(s) || /\d{1,2}[-/]\d{1,2}[-/]\d{4}/.test(s)) &&
            !isNaN(Date.parse(s))
          );
        });
      inferredType = isDateCandidate ? 'date' : 'categorical';
    }

    if (inferredType === 'mixed') {
      // Flag mixed type issue
      issues.push({
        id: `mixed-type-${c}`,
        issueType: 'mixed_type',
        severity: 'high',
        dataRowIndex: 0,
        csvLineNumber: 1,
        columnName: colName,
        originalValue: `${numCount} numeric, ${strCount} string`,
        message: `Column "${colName}" has mixed types (${numCount} numeric and ${strCount} text cells).`,
      });
    }

    columnTypeCounts[inferredType] = (columnTypeCounts[inferredType] || 0) + 1;

    const isConstant = uniqueSet.size <= 1 && nonNullCount > 0;
    if (isConstant) {
      constantColumnsCount++;
      issues.push({
        id: `const-col-${c}`,
        issueType: 'constant_column',
        severity: 'low',
        dataRowIndex: 0,
        csvLineNumber: 1,
        columnName: colName,
        originalValue: Array.from(uniqueSet)[0] || 'NULL',
        message: `Column "${colName}" has only 1 unique value across all rows (zero variance).`,
      });
    }

    // Top frequencies
    const frequencies = Array.from(frequencyMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([value, count]) => ({
        value,
        count,
        percentage: totalDataRows > 0 ? Number(((count / totalDataRows) * 100).toFixed(1)) : 0,
      }));

    // Numeric Stats (if numeric or mixed)
    let stats: ColumnProfile['stats'] = undefined;
    if (inferredType === 'numeric' || (inferredType === 'mixed' && numCount > 5)) {
      const numbers = colValues.filter((v): v is number => typeof v === 'number').sort((a, b) => a - b);
      if (numbers.length > 0) {
        const sum = numbers.reduce((acc, val) => acc + val, 0);
        const mean = Number((sum / numbers.length).toFixed(2));
        const median = numbers[Math.floor(numbers.length / 2)];
        const min = numbers[0];
        const max = numbers[numbers.length - 1];

        // Std dev
        const variance = numbers.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / numbers.length;
        const stdDev = Number(Math.sqrt(variance).toFixed(2));

        // Quartiles & Outliers (1.5 * IQR)
        const q1 = numbers[Math.floor(numbers.length * 0.25)];
        const q3 = numbers[Math.floor(numbers.length * 0.75)];
        const iqr = Number((q3 - q1).toFixed(2));
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;

        let outlierCount = 0;
        processedDataRows.forEach((r, rowIdx) => {
          const val = r[c];
          if (typeof val === 'number') {
            if (val < lowerBound || val > upperBound) {
              outlierCount++;
              if (outlierCount <= 50) { // Limit individual issue count to avoid freezing
                issues.push({
                  id: `outlier-${rowIdx}-${c}`,
                  issueType: 'outlier',
                  severity: 'low',
                  dataRowIndex: rowIdx,
                  csvLineNumber: rowIdx + 2,
                  columnName: colName,
                  originalValue: String(val),
                  message: `Outlier detected: value ${val} falls outside IQR range [${lowerBound.toFixed(1)}, ${upperBound.toFixed(1)}].`,
                });
              }
            }
          }
        });

        stats = {
          mean,
          median,
          stdDev,
          min,
          max,
          q1,
          q3,
          iqr,
          outlierCount,
        };
      }
    }

    columnProfiles.push({
      name: colName,
      index: c,
      inferredType,
      totalCount: totalDataRows,
      missingCount: nullCount,
      missingPercentage: totalDataRows > 0 ? Number(((nullCount / totalDataRows) * 100).toFixed(1)) : 0,
      uniqueCount: uniqueSet.size,
      isConstant,
      sampleValues: colValues.slice(0, 5),
      stats,
      frequencies,
    });
  }

  // Calculate Pearson correlation matrix for numeric columns
  const numericProfiles = columnProfiles.filter((p) => p.inferredType === 'numeric' && p.stats);
  const correlationPairs: CorrelationPair[] = [];

  for (let i = 0; i < numericProfiles.length; i++) {
    for (let j = i + 1; j < numericProfiles.length; j++) {
      const colA = numericProfiles[i];
      const colB = numericProfiles[j];

      // Pairwise complete rows
      const pairs: [number, number][] = [];
      processedDataRows.forEach((r) => {
        const valA = r[colA.index];
        const valB = r[colB.index];
        if (typeof valA === 'number' && typeof valB === 'number') {
          pairs.push([valA, valB]);
        }
      });

      if (pairs.length > 3) {
        const n = pairs.length;
        const meanA = pairs.reduce((acc, p) => acc + p[0], 0) / n;
        const meanB = pairs.reduce((acc, p) => acc + p[1], 0) / n;

        let num = 0;
        let denA = 0;
        let denB = 0;

        pairs.forEach(([a, b]) => {
          const diffA = a - meanA;
          const diffB = b - meanB;
          num += diffA * diffB;
          denA += diffA * diffA;
          denB += diffB * diffB;
        });

        const den = Math.sqrt(denA * denB);
        const r = den > 0 ? Number((num / den).toFixed(3)) : 0;

        correlationPairs.push({
          colA: colA.name,
          colB: colB.name,
          coefficient: r,
        });
      }
    }
  }

  // Dataset Overview object
  const overview: DatasetOverview = {
    fileName,
    fileSizeBytes: fileSizeBytes || new Blob([csvText]).size,
    totalDataRows,
    totalColumns,
    totalCells,
    missingCells: missingCellsCount,
    blankWhitespaceCells: whitespaceCellsCount,
    missingPercentage,
    duplicateRowsCount,
    emptyRowsCount,
    constantColumnsCount,
    parsingErrorsCount: parsingErrors.length,
    columnTypesSummary: columnTypeCounts,
    rowNumberingExplanation: 'Header is on line 1. Data records are 0-indexed in code (Data Row 1 corresponds to Physical File Line 2).',
  };

  // Generate automated natural language insights
  const insights = generateCsvInsights(overview, columnProfiles, correlationPairs);

  return {
    headers: sanitizedHeaders,
    rows: processedDataRows,
    rawText: csvText,
    fileName,
    fileSizeBytes: overview.fileSizeBytes,
    overview,
    columnProfiles,
    issues,
    correlationPairs,
    insights,
  };
}

export function generateCsvInsights(
  overview: DatasetOverview,
  profiles: ColumnProfile[],
  correlations: CorrelationPair[]
): CsvInsight[] {
  const insights: CsvInsight[] = [];

  // 1. Data Integrity & Completeness
  if (overview.missingPercentage > 5) {
    insights.push({
      id: 'high-missing',
      category: 'quality',
      title: `Substantial Missing Data (${overview.missingPercentage}% of all cells)`,
      description: `${overview.missingCells} cells are missing or blank. Imputing or dropping affected rows in the Cleaning Studio is recommended before training statistical models.`,
      evidence: `${overview.missingCells} missing cells across ${overview.totalCells} total cells.`,
    });
  } else {
    insights.push({
      id: 'high-completeness',
      category: 'quality',
      title: 'High Overall Completeness (99%+ intact)',
      description: `Only ${overview.missingPercentage}% missing cells detected. Dataset has strong structural integrity suitable for immediate descriptive analysis.`,
      evidence: `${overview.missingCells} missing cells out of ${overview.totalCells} cells.`,
    });
  }

  // 2. Duplicate Records
  if (overview.duplicateRowsCount > 0) {
    insights.push({
      id: 'duplicates-found',
      category: 'quality',
      title: `${overview.duplicateRowsCount} Redundant Duplicate Records Detected`,
      description: `Identical row fingerprints can artificially weight aggregate metrics and bias variance estimates. Use the Cleaning Studio to deduplicate records.`,
      evidence: `${overview.duplicateRowsCount} duplicate data rows found.`,
    });
  }

  // 3. Top Correlations (with causality disclaimer)
  const sortedCorrs = [...correlations].sort((a, b) => Math.abs(b.coefficient) - Math.abs(a.coefficient));
  const topCorr = sortedCorrs[0];

  if (topCorr && Math.abs(topCorr.coefficient) >= 0.45) {
    const isPositive = topCorr.coefficient > 0;
    insights.push({
      id: 'strong-correlation',
      category: 'correlation',
      title: `Strong ${isPositive ? 'Positive' : 'Inverse'} Correlation: ${topCorr.colA} vs ${topCorr.colB}`,
      description: `Pearson coefficient r = ${topCorr.coefficient}. As ${topCorr.colA} ${isPositive ? 'increases' : 'decreases'}, ${topCorr.colB} tends to ${isPositive ? 'increase' : 'decrease'}. Note: Statistical correlation indicates co-movement, not direct causation.`,
      evidence: `Computed Pearson r = ${topCorr.coefficient} across pairwise complete rows.`,
    });
  }

  // 4. Outlier warnings
  const outlierColumns = profiles.filter((p) => p.stats && p.stats.outlierCount > 0);
  if (outlierColumns.length > 0) {
    const topOutlierCol = outlierColumns.sort((a, b) => (b.stats?.outlierCount || 0) - (a.stats?.outlierCount || 0))[0];
    insights.push({
      id: 'outliers-detected',
      category: 'distribution',
      title: `Extreme Value Distribution in "${topOutlierCol.name}"`,
      description: `${topOutlierCol.stats?.outlierCount} records lie outside 1.5× the Interquartile Range (IQR). Check if these represent measurement noise or valid high-impact events.`,
      evidence: `Q1: ${topOutlierCol.stats?.q1}, Q3: ${topOutlierCol.stats?.q3}, IQR: ${topOutlierCol.stats?.iqr}.`,
    });
  }

  // 5. Actionable Next Step
  insights.push({
    id: 'next-action',
    category: 'action',
    title: 'Recommended Analytical Next Step',
    description: `Inspect the Visual Analytics tab for histogram distributions and scatter plots, or use the Cleaning Studio to trim whitespace and export a sanitized CSV.`,
    evidence: `${overview.totalColumns} columns analyzed across ${overview.totalDataRows} records.`,
  });

  return insights;
}

export function cleanDataset(
  originalResult: ParsedCsvResult,
  options: CleaningOptions
): {
  cleanedRows: (string | number | boolean | null)[][];
  cleanedCsvString: string;
  rowsRemovedCount: number;
  cellsModifiedCount: number;
  summaryReport: string;
  jupyterNotebookScript: string;
} {
  let workingRows = originalResult.rows.map((row) => [...row]);
  const initialCount = workingRows.length;
  let cellsModifiedCount = 0;
  let emptyRowsDropped = 0;
  let duplicatesRemoved = 0;
  let outliersCapped = 0;
  let missingValuesFilled = 0;
  let typeCastsCount = 0;

  // 1. Remove 100% empty rows
  if (options.removeEmptyRows !== false) {
    const beforeCount = workingRows.length;
    workingRows = workingRows.filter((row) =>
      row.some((val) => val !== null && val !== undefined && String(val).trim() !== '')
    );
    emptyRowsDropped = beforeCount - workingRows.length;
  }

  // 2. Remove duplicate rows
  if (options.removeDuplicates) {
    const seen = new Set<string>();
    const filtered: (string | number | boolean | null)[][] = [];

    workingRows.forEach((row) => {
      const key = JSON.stringify(row);
      if (!seen.has(key)) {
        seen.add(key);
        filtered.push(row);
      } else {
        duplicatesRemoved++;
      }
    });

    workingRows = filtered;
  }

  // 3. Trim whitespace & invisible characters
  if (options.trimWhitespace) {
    workingRows.forEach((row) => {
      row.forEach((val, idx) => {
        if (typeof val === 'string') {
          const trimmed = val.trim();
          if (trimmed !== val) {
            row[idx] = trimmed;
            cellsModifiedCount++;
          }
        }
      });
    });
  }

  // 4. Strip special unwanted characters (accidental control chars, hidden tabs, non-breaking spaces)
  if (options.cleanSpecialCharacters) {
    workingRows.forEach((row) => {
      row.forEach((val, idx) => {
        if (typeof val === 'string') {
          const cleaned = val.replace(/[\u0000-\u001F\u007F-\u009F\u00A0]/g, ' ').trim();
          if (cleaned !== val) {
            row[idx] = cleaned;
            cellsModifiedCount++;
          }
        }
      });
    });
  }

  // 5. Smart Type Casting (Currency "$1,200" -> 1200, Boolean "True"/"no" -> true/false, Numeric strings)
  if (options.autoTypeCasting) {
    originalResult.columnProfiles.forEach((prof) => {
      const colIdx = prof.index;
      if (prof.inferredType === 'numeric') {
        workingRows.forEach((row) => {
          const val = row[colIdx];
          if (typeof val === 'string' && val.trim() !== '') {
            // Strip currency symbols and commas e.g. "$1,250.50"
            const cleanedNumStr = val.replace(/[$€£₹,\s]/g, '');
            const parsedNum = Number(cleanedNumStr);
            if (!isNaN(parsedNum)) {
              row[colIdx] = parsedNum;
              typeCastsCount++;
              cellsModifiedCount++;
            }
          }
        });
      } else if (prof.inferredType === 'boolean') {
        workingRows.forEach((row) => {
          const val = row[colIdx];
          if (typeof val === 'string') {
            const lower = val.toLowerCase().trim();
            if (['true', 'yes', '1', 'y', 't'].includes(lower)) {
              row[colIdx] = true;
              typeCastsCount++;
              cellsModifiedCount++;
            } else if (['false', 'no', '0', 'n', 'f'].includes(lower)) {
              row[colIdx] = false;
              typeCastsCount++;
              cellsModifiedCount++;
            }
          }
        });
      }
    });
  }

  // 6. Dataset-Wide Missing Value Imputation (Categorical e.g. Director/Cast -> "Unknown" or Mode)
  if (options.fillCategoricalMissing && options.fillCategoricalMissing !== 'preserve') {
    originalResult.columnProfiles.forEach((prof) => {
      if (prof.inferredType === 'categorical') {
        const colIdx = prof.index;
        const replacement =
          options.fillCategoricalMissing === 'mode' && prof.frequencies && prof.frequencies.length > 0
            ? prof.frequencies[0].value
            : 'Unknown';

        workingRows.forEach((row) => {
          const val = row[colIdx];
          if (val === null || val === undefined || (typeof val === 'string' && val.trim() === '')) {
            row[colIdx] = replacement;
            missingValuesFilled++;
            cellsModifiedCount++;
          }
        });
      }
    });
  }

  // 7. Dataset-Wide Numeric Missing Value Imputation (Mean, Median, or Zero)
  if (options.fillNumericMissing && options.fillNumericMissing !== 'preserve') {
    originalResult.columnProfiles.forEach((prof) => {
      if (prof.inferredType === 'numeric' && prof.stats) {
        const colIdx = prof.index;
        let replacement: number = 0;
        if (options.fillNumericMissing === 'mean') {
          replacement = prof.stats.mean;
        } else if (options.fillNumericMissing === 'median') {
          replacement = prof.stats.median;
        } else if (options.fillNumericMissing === 'zero') {
          replacement = 0;
        }

        workingRows.forEach((row) => {
          const val = row[colIdx];
          if (val === null || val === undefined || (typeof val === 'string' && val.trim() === '') || (typeof val === 'number' && isNaN(val))) {
            row[colIdx] = replacement;
            missingValuesFilled++;
            cellsModifiedCount++;
          }
        });
      }
    });
  }

  // 8. Mathematical Outlier Treatment (1.5 * IQR Capping or Dropping)
  if (options.handleOutliers && options.handleOutliers !== 'preserve') {
    originalResult.columnProfiles.forEach((prof) => {
      if (prof.inferredType === 'numeric' && prof.stats && prof.stats.iqr > 0) {
        const colIdx = prof.index;
        const lowerBound = prof.stats.q1 - 1.5 * prof.stats.iqr;
        const upperBound = prof.stats.q3 + 1.5 * prof.stats.iqr;

        if (options.handleOutliers === 'cap_iqr') {
          workingRows.forEach((row) => {
            const val = row[colIdx];
            if (typeof val === 'number') {
              if (val < lowerBound) {
                row[colIdx] = Math.round(lowerBound * 100) / 100;
                outliersCapped++;
                cellsModifiedCount++;
              } else if (val > upperBound) {
                row[colIdx] = Math.round(upperBound * 100) / 100;
                outliersCapped++;
                cellsModifiedCount++;
              }
            }
          });
        }
      }
    });

    if (options.handleOutliers === 'drop') {
      const beforeCount = workingRows.length;
      workingRows = workingRows.filter((row) => {
        return originalResult.columnProfiles.every((prof) => {
          if (prof.inferredType === 'numeric' && prof.stats && prof.stats.iqr > 0) {
            const val = row[prof.index];
            if (typeof val === 'number') {
              const lowerBound = prof.stats.q1 - 1.5 * prof.stats.iqr;
              const upperBound = prof.stats.q3 + 1.5 * prof.stats.iqr;
              return val >= lowerBound && val <= upperBound;
            }
          }
          return true;
        });
      });
      outliersCapped = beforeCount - workingRows.length;
    }
  }

  // 9. Standardize text casing for specific column
  if (options.standardizeCase) {
    const { column, mode } = options.standardizeCase;
    const colIdx = originalResult.headers.indexOf(column);
    if (colIdx !== -1) {
      workingRows.forEach((row) => {
        const raw = row[colIdx];
        if (raw !== null && raw !== undefined) {
          const strVal = String(raw).trim();
          if (strVal.length > 0) {
            let updated = strVal;
            if (mode === 'lower') {
              updated = strVal.toLowerCase();
            } else if (mode === 'upper') {
              updated = strVal.toUpperCase();
            } else if (mode === 'title') {
              updated = strVal.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
            }
            if (updated !== raw) {
              row[colIdx] = updated;
              cellsModifiedCount++;
            }
          }
        }
      });
    }
  }

  // 10. Column-specific Missing Value action
  let missingRowsDropped = 0;
  if (options.missingValueAction) {
    const { column, action, customValue } = options.missingValueAction;
    const colIdx = originalResult.headers.indexOf(column);

    if (colIdx !== -1) {
      if (action === 'drop_row') {
        const filtered = workingRows.filter((r) => r[colIdx] !== null && r[colIdx] !== undefined && String(r[colIdx]).trim() !== '');
        missingRowsDropped = workingRows.length - filtered.length;
        workingRows = filtered;
      } else {
        let fillReplacement: any = null;
        const profile = originalResult.columnProfiles.find((p) => p.name === column);

        if (action === 'fill_mean' && profile?.stats) {
          fillReplacement = profile.stats.mean;
        } else if (action === 'fill_median' && profile?.stats) {
          fillReplacement = profile.stats.median;
        } else if (action === 'fill_mode' && profile?.frequencies && profile.frequencies.length > 0) {
          fillReplacement = profile.frequencies[0].value;
        } else if (action === 'fill_custom' && customValue !== undefined) {
          fillReplacement = customValue;
        }

        if (fillReplacement !== null) {
          workingRows.forEach((row) => {
            if (row[colIdx] === null || row[colIdx] === undefined || String(row[colIdx]).trim() === '') {
              row[colIdx] = fillReplacement;
              cellsModifiedCount++;
              missingValuesFilled++;
            }
          });
        }
      }
    }
  }

  // Convert cleaned rows back to CSV text using Papa.unparse
  const cleanedData = [originalResult.headers, ...workingRows];
  const cleanedCsvString = Papa.unparse(cleanedData);

  const totalFilteredRows = emptyRowsDropped + duplicatesRemoved + missingRowsDropped + (options.handleOutliers === 'drop' ? outliersCapped : 0);

  const summaryReport = `
# QUANTRIX Data Sanitization Audit Report
- Original File: ${originalResult.fileName}
- Original Records: ${initialCount}
- Cleaned Final Records: ${workingRows.length}
- Empty Rows Dropped: ${emptyRowsDropped}
- Duplicate Rows Removed: ${duplicatesRemoved}
- Missing Cells Imputed: ${missingValuesFilled}
- Type Casts / Cleaned Numbers: ${typeCastsCount}
- Extreme Outliers Treated: ${outliersCapped}
- Total Modified Cells: ${cellsModifiedCount}
- Generated Timestamp: ${new Date().toISOString()}
`.trim();

  // Generate complete reproducible Jupyter Notebook Python script
  const jupyterNotebookScript = `# =====================================================================
# QUANTRIX AUTOMATED JUPYTER NOTEBOOK DATA CLEANING PIPELINE
# File: ${originalResult.fileName}
# Generated on: ${new Date().toLocaleString()}
# =====================================================================

import pandas as pd
import numpy as np

# 1. Load Dataset
print("[1/6] Loading dataset...")
df = pd.read_csv("${originalResult.fileName}")
print(f"Original Shape: {df.shape[0]} rows, {df.shape[1]} columns")

# 2. Drop 100% empty rows & strip whitespace
print("[2/6] Dropping empty rows and stripping whitespace...")
df.dropna(how='all', inplace=True)
for col in df.select_dtypes(include=['object']).columns:
    df[col] = df[col].astype(str).str.strip().replace({'nan': np.nan, '': np.nan})

# 3. Remove Duplicate Rows
duplicates = df.duplicated().sum()
df.drop_duplicates(inplace=True)
print(f"[3/6] Removed {duplicates} duplicate records.")

# 4. Handle Missing Values (Categorical -> 'Unknown' / Numeric -> Median)
print("[4/6] Imputing missing values...")
for col in df.columns:
    if df[col].dtype == 'object':
        df[col] = df[col].fillna('Unknown')
    elif np.issubdtype(df[col].dtype, np.number):
        median_val = df[col].median()
        df[col] = df[col].fillna(median_val)

# 5. Outlier Detection & Capping (1.5 * IQR)
print("[5/6] Treating numeric outliers with IQR capping...")
for col in df.select_dtypes(include=[np.number]).columns:
    q1 = df[col].quantile(0.25)
    q3 = df[col].quantile(0.75)
    iqr = q3 - q1
    if iqr > 0:
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr
        df[col] = np.clip(df[col], lower_bound, upper_bound)

# 6. Export Cleaned Dataset
output_file = "cleaned_${originalResult.fileName}"
df.to_csv(output_file, index=False)
print(f"[6/6] Pipeline complete! Cleaned data saved to: {output_file}")
print(f"Final Shape: {df.shape[0]} rows, {df.shape[1]} columns")
`;

  return {
    cleanedRows: workingRows,
    cleanedCsvString,
    rowsRemovedCount: totalFilteredRows,
    cellsModifiedCount,
    summaryReport,
    jupyterNotebookScript,
  };
}
