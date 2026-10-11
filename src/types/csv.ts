export type InferredColumnType = 'numeric' | 'categorical' | 'date' | 'boolean' | 'mixed';

export type IssueType =
  | 'missing_value'
  | 'empty_string'
  | 'whitespace_only'
  | 'duplicate_row'
  | 'duplicate_header'
  | 'mixed_type'
  | 'outlier'
  | 'constant_column';

export interface DataQualityIssue {
  id: string;
  issueType: IssueType;
  severity: 'low' | 'medium' | 'high';
  dataRowIndex: number; // 0-indexed data row
  csvLineNumber: number; // 1-indexed physical file line
  columnName: string;
  originalValue: string | null;
  message: string;
}

export interface ColumnProfile {
  name: string;
  index: number;
  inferredType: InferredColumnType;
  totalCount: number;
  missingCount: number;
  missingPercentage: number;
  uniqueCount: number;
  isConstant: boolean;
  sampleValues: (string | number | boolean | null)[];
  
  // Numeric-specific stats (if applicable)
  stats?: {
    mean: number;
    median: number;
    stdDev: number;
    min: number;
    max: number;
    q1: number;
    q3: number;
    iqr: number;
    outlierCount: number;
  };

  // Categorical frequencies (top 10)
  frequencies?: { value: string; count: number; percentage: number }[];
}

export interface DatasetOverview {
  fileName: string;
  fileSizeBytes: number;
  totalDataRows: number;
  totalColumns: number;
  totalCells: number;
  missingCells: number;
  blankWhitespaceCells: number;
  missingPercentage: number;
  duplicateRowsCount: number;
  emptyRowsCount: number;
  constantColumnsCount: number;
  parsingErrorsCount: number;
  columnTypesSummary: Record<InferredColumnType, number>;
  rowNumberingExplanation: string;
}

export interface CorrelationPair {
  colA: string;
  colB: string;
  coefficient: number; // -1 to 1
}

export interface CsvInsight {
  id: string;
  category: 'quality' | 'distribution' | 'correlation' | 'action';
  title: string;
  description: string;
  evidence: string;
}

export interface CleaningOptions {
  removeDuplicates: boolean;
  trimWhitespace: boolean;
  standardizeCase?: {
    column: string;
    mode: 'lower' | 'upper' | 'title';
  };
  missingValueAction?: {
    column: string;
    action: 'drop_row' | 'fill_mean' | 'fill_median' | 'fill_mode' | 'fill_custom';
    customValue?: string;
  };
}
