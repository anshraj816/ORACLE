import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Code2,
  Download,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  Play,
  RotateCcw,
  Settings2,
  ShieldAlert,
  Sparkles,
  Wand2,
  Zap,
} from 'lucide-react';
import { CleaningOptions, ColumnProfile } from '../../types/csv';
import { ParsedCsvResult, cleanDataset, parseCsvContent } from '../../utils/csvAnalysis';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { useApp } from '../../context/AppContext';

interface DataCleaningStudioProps {
  parsedResult: ParsedCsvResult;
}

export const DataCleaningStudio: React.FC<DataCleaningStudioProps> = ({ parsedResult }) => {
  // Global & Professional Cleaning Options
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [removeEmptyRows, setRemoveEmptyRows] = useState(true);
  const [cleanSpecialChars, setCleanSpecialChars] = useState(true);
  const [autoTypeCasting, setAutoTypeCasting] = useState(true);
  const [fillCategoricalMissing, setFillCategoricalMissing] = useState<'preserve' | 'unknown' | 'mode'>('unknown');
  const [fillNumericMissing, setFillNumericMissing] = useState<'preserve' | 'mean' | 'median' | 'zero'>('median');
  const [handleOutliers, setHandleOutliers] = useState<'preserve' | 'cap_iqr' | 'drop'>('cap_iqr');

  // Column specific adjustments
  const [selectedCaseCol, setSelectedCaseCol] = useState(parsedResult.headers[0] || '');
  const [caseMode, setCaseMode] = useState<'none' | 'lower' | 'upper' | 'title'>('none');
  const [selectedMissingCol, setSelectedMissingCol] = useState(parsedResult.headers[0] || '');
  const [missingAction, setMissingAction] = useState<
    'none' | 'drop_row' | 'fill_mean' | 'fill_median' | 'fill_mode' | 'fill_custom'
  >('none');
  const [customFillValue, setCustomFillValue] = useState('');

  // Active view tab inside studio
  const [cleaningTab, setCleaningTab] = useState<'quick' | 'advanced' | 'code'>('quick');

  // Preview state
  const [previewResult, setPreviewResult] = useState<ReturnType<typeof cleanDataset> | null>(() => {
    // Run an initial quick pass so user immediately sees results
    return cleanDataset(parsedResult, {
      removeDuplicates: true,
      trimWhitespace: true,
      removeEmptyRows: true,
      cleanSpecialCharacters: true,
      autoTypeCasting: true,
      fillCategoricalMissing: 'unknown',
      fillNumericMissing: 'median',
      handleOutliers: 'cap_iqr',
    });
  });

  const handleRunCleaning = (preset?: 'one_click_jupyter' | 'conservative') => {
    let opts: CleaningOptions;

    if (preset === 'one_click_jupyter') {
      setRemoveDuplicates(true);
      setTrimWhitespace(true);
      setRemoveEmptyRows(true);
      setCleanSpecialChars(true);
      setAutoTypeCasting(true);
      setFillCategoricalMissing('unknown');
      setFillNumericMissing('median');
      setHandleOutliers('cap_iqr');

      opts = {
        removeDuplicates: true,
        trimWhitespace: true,
        removeEmptyRows: true,
        cleanSpecialCharacters: true,
        autoTypeCasting: true,
        fillCategoricalMissing: 'unknown',
        fillNumericMissing: 'median',
        handleOutliers: 'cap_iqr',
      };
    } else {
      opts = {
        removeDuplicates,
        trimWhitespace,
        removeEmptyRows,
        cleanSpecialCharacters: cleanSpecialChars,
        autoTypeCasting,
        fillCategoricalMissing,
        fillNumericMissing,
        handleOutliers,
        standardizeCase:
          caseMode !== 'none'
            ? {
                column: selectedCaseCol,
                mode: caseMode,
              }
            : undefined,
        missingValueAction:
          missingAction !== 'none'
            ? {
                column: selectedMissingCol,
                action: missingAction,
                customValue: customFillValue,
              }
            : undefined,
      };
    }

    const cleaned = cleanDataset(parsedResult, opts);
    setPreviewResult(cleaned);
    addToast({
      type: 'info',
      title: 'Cleaning Pipeline Executed',
      message: `${cleaned.cellsModifiedCount} cells modified, ${cleaned.rowsRemovedCount} rows filtered. Check the preview table below!`,
    });
  };

  const handleDownloadCleaned = () => {
    if (!previewResult) return;
    const blob = new Blob([previewResult.cleanedCsvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cleaned_${parsedResult.fileName}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadCleanedPdf = () => {
    if (!previewResult) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      addToast({
        type: 'warning',
        title: 'Popup Blocked',
        message: 'Please allow popups to open and print the PDF report.',
      });
      return;
    }

    const rowsPreviewHtml = previewResult.cleanedRows.slice(0, 50).map((row: (string | number | boolean | null)[], rIdx: number) => `
      <tr style="border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 11px;">
        <td style="padding: 6px 10px; color: #64748b;">${rIdx + 1}</td>
        ${row.map((c: string | number | boolean | null) => `<td style="padding: 6px 10px; color: #1e293b;">${c === null || c === undefined || c === '' ? '<span style="color:#e11d48; font-style:italic;">NULL</span>' : String(c)}</td>`).join('')}
      </tr>
    `).join('');

    const headersHtml = parsedResult.headers.map(h => `<th style="padding: 8px 10px; text-align: left; background: #f8fafc; color: #334155; font-size: 11px; border-bottom: 2px solid #cbd5e1;">${h}</th>`).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QUANTRIX Cleaned Dataset Report - ${parsedResult.fileName}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 30px; color: #0f172a; margin: 0; }
            .header { border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            .badge { background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
            .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
            .kpi { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; }
            .kpi-title { font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; }
            .kpi-val { font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .footer { margin-top: 30px; padding-top: 12px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; }
            @media print {
              body { padding: 0; }
              @page { margin: 1.5cm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">QUANTRIX — Cleaned Dataset Audit Report</h1>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">Source File: <strong>${parsedResult.fileName}</strong> • Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            </div>
            <span class="badge">Verified Cleaned</span>
          </div>

          <div class="kpi-grid">
            <div class="kpi">
              <div class="kpi-title">Original Records</div>
              <div class="kpi-val">${parsedResult.overview.totalDataRows}</div>
            </div>
            <div class="kpi">
              <div class="kpi-title">Cleaned Records</div>
              <div class="kpi-val" style="color: #059669;">${previewResult.cleanedRows.length}</div>
            </div>
            <div class="kpi">
              <div class="kpi-title">Modified Cells</div>
              <div class="kpi-val" style="color: #0284c7;">${previewResult.cellsModifiedCount}</div>
            </div>
            <div class="kpi">
              <div class="kpi-title">Removed / Filtered</div>
              <div class="kpi-val" style="color: #e11d48;">${previewResult.rowsRemovedCount}</div>
            </div>
          </div>

          <h3 style="font-size: 13px; text-transform: uppercase; color: #334155; margin-bottom: 8px;">Sample Cleaned Records (Print Excerpt)</h3>
          <table>
            <thead>
              <tr>
                <th style="padding: 8px 10px; background: #f8fafc; border-bottom: 2px solid #cbd5e1; width: 30px;">#</th>
                ${headersHtml}
              </tr>
            </thead>
            <tbody>
              ${rowsPreviewHtml}
            </tbody>
          </table>

          <div class="footer">
            <span>QUANTRIX Local-First Computational Platform • Verified In-Browser Privacy</span>
            <span>Automated Data Quality Audit</span>
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadAuditReport = () => {
    if (!previewResult) return;
    const blob = new Blob([previewResult.summaryReport], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cleaning_audit_${parsedResult.fileName.replace('.csv', '')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const { setParsedCsv, addToast } = useApp();

  const handleDownloadJupyterNotebook = () => {
    if (!previewResult) return;
    const blob = new Blob([previewResult.jupyterNotebookScript], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `clean_${parsedResult.fileName.replace('.csv', '')}.py`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleApplyCleanedToApp = () => {
    if (!previewResult) return;
    try {
      const reParsed = parseCsvContent(previewResult.cleanedCsvString, `cleaned_${parsedResult.fileName}`);
      setParsedCsv(reParsed);
      addToast({
        type: 'success',
        title: 'Dataset Updated Successfully',
        message: `Applied cleaned data across all charts, tables, and AI assistant (${reParsed.overview.totalDataRows} rows).`,
      });
    } catch (e) {
      addToast({
        type: 'error',
        title: 'Apply Error',
        message: 'Could not apply cleaned dataset.',
      });
    }
  };

  return (
    <Card className="p-6" glow="emerald">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/[0.08] mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-lg shadow-emerald-950/40">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Professional Data Cleaning Studio</h3>
              <Badge variant="emerald" size="sm">Jupyter Grade</Badge>
            </div>
            <p className="text-xs text-slate-400">
              End-to-end data pipeline: type casting, missing value imputation, outlier capping, and duplicate removal
            </p>
          </div>
        </div>

        {/* 1-Click Master Clean Button */}
        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            onClick={() => handleRunCleaning('one_click_jupyter')}
            className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold shadow-lg shadow-emerald-950/50"
            icon={<Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />}
          >
            1-Click Total Jupyter Fix
          </Button>
        </div>
      </div>

      {/* Mode Sub-nav */}
      <div className="flex items-center gap-2 mb-6 p-1 bg-[#0b0c14] border border-white/[0.06] rounded-xl w-fit">
        <button
          onClick={() => setCleaningTab('quick')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            cleaningTab === 'quick' ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Full Pipeline Parameters</span>
        </button>
        <button
          onClick={() => setCleaningTab('advanced')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            cleaningTab === 'advanced' ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>Column-Specific Rules</span>
        </button>
        <button
          onClick={() => setCleaningTab('code')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            cleaningTab === 'code' ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Jupyter / Pandas Code</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {cleaningTab === 'quick' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Row & Integrity Cleaners */}
              <div className="p-4 rounded-2xl bg-[#121422] border border-white/[0.06] space-y-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-indigo-400" />
                  1. Row & Structural Integrity
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-[#090a12] border border-white/[0.04] cursor-pointer hover:border-white/10 transition-colors">
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">Deduplicate Rows</span>
                      <span className="text-[10px] text-slate-400">Remove identical rows ({parsedResult.overview.duplicateRowsCount} found)</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={removeDuplicates}
                      onChange={(e) => setRemoveDuplicates(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-white/20"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-[#090a12] border border-white/[0.04] cursor-pointer hover:border-white/10 transition-colors">
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">Drop Blank Rows</span>
                      <span className="text-[10px] text-slate-400">Eliminate 100% empty rows</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={removeEmptyRows}
                      onChange={(e) => setRemoveEmptyRows(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-white/20"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-[#090a12] border border-white/[0.04] cursor-pointer hover:border-white/10 transition-colors">
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">Trim Whitespace</span>
                      <span className="text-[10px] text-slate-400">Strip leading & trailing padding</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={trimWhitespace}
                      onChange={(e) => setTrimWhitespace(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-white/20"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-[#090a12] border border-white/[0.04] cursor-pointer hover:border-white/10 transition-colors">
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">Clean Special Chars</span>
                      <span className="text-[10px] text-slate-400">Remove invisible control bytes</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={cleanSpecialChars}
                      onChange={(e) => setCleanSpecialChars(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-white/20"
                    />
                  </label>
                </div>
              </div>

              {/* Data Type Casting & Cleaning */}
              <div className="p-4 rounded-2xl bg-[#121422] border border-white/[0.06] space-y-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  2. Smart Type Casting & Conversion
                </span>

                <label className="flex items-center justify-between p-3 rounded-xl bg-[#090a12] border border-white/[0.04] cursor-pointer hover:border-white/10 transition-colors">
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">Automatic Type Casting & Currency Stripping</span>
                    <span className="text-[10px] text-slate-400">
                      Converts dirty currencies (e.g. "$12,500" &rarr; 12500) and normalize booleans ("yes"/"True" &rarr; true)
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoTypeCasting}
                    onChange={(e) => setAutoTypeCasting(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-white/20"
                  />
                </label>
              </div>

              {/* Missing Values (Categorical vs Numeric) */}
              <div className="p-4 rounded-2xl bg-[#121422] border border-white/[0.06] space-y-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  3. Missing Value Imputation (Categorical & Numeric)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-[#090a12] border border-white/[0.04] space-y-1.5">
                    <label className="text-xs font-semibold text-slate-200 block">
                      Text Columns (Director, Cast, City...)
                    </label>
                    <select
                      value={fillCategoricalMissing}
                      onChange={(e) => setFillCategoricalMissing(e.target.value as any)}
                      className="w-full bg-[#121422] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="unknown">Fill with "Unknown"</option>
                      <option value="mode">Fill with Most Frequent (Mode)</option>
                      <option value="preserve">Keep Empty / Preserved</option>
                    </select>
                  </div>

                  <div className="p-3 rounded-xl bg-[#090a12] border border-white/[0.04] space-y-1.5">
                    <label className="text-xs font-semibold text-slate-200 block">
                      Numeric Columns (Salary, Budget, Rating...)
                    </label>
                    <select
                      value={fillNumericMissing}
                      onChange={(e) => setFillNumericMissing(e.target.value as any)}
                      className="w-full bg-[#121422] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="median">Impute Median (Robust to outliers)</option>
                      <option value="mean">Impute Mean (Mathematical average)</option>
                      <option value="zero">Fill with Zero (0)</option>
                      <option value="preserve">Keep Empty / Preserved</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Statistical Outliers Treatment */}
              <div className="p-4 rounded-2xl bg-[#121422] border border-white/[0.06] space-y-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  4. Statistical Outliers (1.5 &times; IQR Rule)
                </span>

                <div className="p-3 rounded-xl bg-[#090a12] border border-white/[0.04] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-slate-200 block">IQR Outlier Handling Strategy</span>
                    <span className="text-[10px] text-slate-400 block leading-tight">Caps extreme anomalies at [Q1 - 1.5*IQR, Q3 + 1.5*IQR] or drops them</span>
                  </div>
                  <select
                    value={handleOutliers}
                    onChange={(e) => setHandleOutliers(e.target.value as any)}
                    className="w-full sm:w-auto bg-[#121422] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none shrink-0"
                  >
                    <option value="cap_iqr">Cap with IQR Boundary (Recommended)</option>
                    <option value="drop">Drop Outlier Records</option>
                    <option value="preserve">Preserve Raw Outliers</option>
                  </select>
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => handleRunCleaning()}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                icon={<Play className="w-3.5 h-3.5" />}
              >
                Apply Parameters & Update Preview
              </Button>
            </div>
          )}

          {cleaningTab === 'advanced' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Standardize Text Casing */}
              <div className="p-4 rounded-2xl bg-[#121422] border border-white/[0.05] space-y-3">
                <span className="text-xs font-semibold text-slate-200 block">
                  Column-Specific Text Normalization
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={selectedCaseCol}
                    onChange={(e) => setSelectedCaseCol(e.target.value)}
                    className="bg-[#0b0c14] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    {parsedResult.headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>

                  <select
                    value={caseMode}
                    onChange={(e) => setCaseMode(e.target.value as any)}
                    className="bg-[#0b0c14] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="none">No Casing Change</option>
                    <option value="lower">lowercase (all small)</option>
                    <option value="upper">UPPERCASE (all caps)</option>
                    <option value="title">Title Case (Capitalize Every Word)</option>
                  </select>
                </div>
              </div>

              {/* Specific Column Missing Value Treatment */}
              <div className="p-4 rounded-2xl bg-[#121422] border border-white/[0.05] space-y-3">
                <span className="text-xs font-semibold text-slate-200 block">
                  Targeted Column Null Action
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={selectedMissingCol}
                    onChange={(e) => setSelectedMissingCol(e.target.value)}
                    className="bg-[#0b0c14] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    {parsedResult.headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>

                  <select
                    value={missingAction}
                    onChange={(e) => setMissingAction(e.target.value as any)}
                    className="bg-[#0b0c14] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="none">Preserve NULLs</option>
                    <option value="drop_row">Drop Rows with NULL</option>
                    <option value="fill_mean">Impute Mean</option>
                    <option value="fill_median">Impute Median</option>
                    <option value="fill_mode">Impute Most Frequent</option>
                    <option value="fill_custom">Fill Custom Value</option>
                  </select>
                </div>

                {missingAction === 'fill_custom' && (
                  <input
                    type="text"
                    placeholder="Enter custom replacement text..."
                    value={customFillValue}
                    onChange={(e) => setCustomFillValue(e.target.value)}
                    className="w-full bg-[#0b0c14] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                  />
                )}
              </div>

              <Button
                size="sm"
                onClick={() => handleRunCleaning()}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                icon={<Play className="w-3.5 h-3.5" />}
              >
                Apply Targeted Rules
              </Button>
            </div>
          )}

          {cleaningTab === 'code' && (
            <div className="space-y-3 animate-in fade-in">
              <div className="p-3 rounded-xl bg-[#090a12] border border-white/[0.06] text-xs text-slate-300">
                You can copy or download this standalone Python code and run it directly in **Jupyter Notebook**, Google Colab, or VS Code!
              </div>
              <div className="p-4 rounded-2xl bg-[#090a12] border border-white/[0.08] max-h-96 overflow-y-auto">
                <pre className="text-[11px] font-mono text-emerald-300 leading-relaxed whitespace-pre-wrap">
                  {previewResult?.jupyterNotebookScript}
                </pre>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleDownloadJupyterNotebook}
                icon={<Code2 className="w-4 h-4" />}
              >
                Download Python / Jupyter Script (.py)
              </Button>
            </div>
          )}
        </div>

        {/* Cleaning Outcome Preview & Download Column (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#121422] border border-white/[0.06] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Cleaning Impact Audit
              </span>
              <Badge variant="cyan" size="sm">Real-Time Verification</Badge>
            </div>

            {previewResult ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-white/[0.06]">
                  <div className="p-3 rounded-xl bg-[#090a10] border border-white/[0.04]">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Original Records</span>
                    <span className="text-xl font-bold font-mono text-slate-200">
                      {parsedResult.overview.totalDataRows}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#090a10] border border-white/[0.04]">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Cleaned Records</span>
                    <span className="text-xl font-bold font-mono text-emerald-400">
                      {previewResult.cleanedRows.length}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      Rows Removed (Duplicates / Empty):
                    </span>
                    <span className="font-mono text-rose-300 font-bold">
                      -{previewResult.rowsRemovedCount}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      Total Cells Modified / Imputed:
                    </span>
                    <span className="font-mono text-cyan-300 font-bold">
                      {previewResult.cellsModifiedCount}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#090a10] border border-white/[0.05] text-[11px] font-mono text-slate-400 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {previewResult.summaryReport}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                Click <strong>"1-Click Total Jupyter Fix"</strong> to run all professional cleaners.
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-end gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              disabled={!previewResult}
              onClick={handleDownloadAuditReport}
              icon={<FileCheck className="w-4 h-4" />}
            >
              Audit Log
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={!previewResult}
              onClick={handleDownloadJupyterNotebook}
              icon={<Code2 className="w-4 h-4" />}
            >
              Python Script
            </Button>
            <Button
              size="sm"
              disabled={!previewResult}
              onClick={handleApplyCleanedToApp}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
              icon={<Sparkles className="w-4 h-4" />}
            >
              Apply to Dataset & Charts
            </Button>
            <Button
              size="sm"
              disabled={!previewResult}
              onClick={handleDownloadCleaned}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              icon={<Download className="w-4 h-4" />}
            >
              Download Cleaned CSV
            </Button>
            <Button
              size="sm"
              disabled={!previewResult}
              onClick={handleDownloadCleanedPdf}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-950/40"
              icon={<FileText className="w-4 h-4" />}
            >
              Download PDF Report
            </Button>
          </div>
        </div>
      </div>

      {/* Live Sample of Cleaned Rows Preview */}
      {previewResult && previewResult.cleanedRows.length > 0 && (
        <div className="mt-8 pt-6 border-t border-white/[0.08]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Cleaned Data Sample Preview (First 5 Rows)
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Showing 5 of {previewResult.cleanedRows.length} cleaned rows
            </span>
          </div>
          <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#090a12]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#121422] border-b border-white/[0.06] text-slate-400">
                <tr>
                  <th className="py-2.5 px-3 text-[11px] font-semibold text-slate-500">#</th>
                  {parsedResult.headers.map((h) => (
                    <th
                      key={h}
                      className={`py-2.5 px-3 text-[11px] font-semibold whitespace-nowrap ${
                        h === selectedCaseCol && caseMode !== 'none'
                          ? 'text-cyan-300 bg-cyan-950/20'
                          : 'text-slate-300'
                      }`}
                    >
                      {h}
                      {h === selectedCaseCol && caseMode !== 'none' && (
                        <span className="ml-1 text-[9px] text-cyan-400 font-normal">({caseMode})</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-slate-200">
                {previewResult.cleanedRows.slice(0, 5).map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-white/[0.02]">
                    <td className="py-2 px-3 text-slate-600 font-mono text-[10px]">{rIdx + 1}</td>
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className={`py-2 px-3 font-mono text-xs whitespace-nowrap ${
                          parsedResult.headers[cIdx] === selectedCaseCol && caseMode !== 'none'
                            ? 'text-cyan-200 font-bold bg-cyan-950/10'
                            : 'text-slate-300'
                        }`}
                      >
                        {cell === null || cell === undefined || cell === '' ? (
                          <span className="text-rose-400 italic font-sans text-[10px]">NULL</span>
                        ) : (
                          String(cell)
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  );
};

