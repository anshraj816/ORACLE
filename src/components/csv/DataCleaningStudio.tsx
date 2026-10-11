import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Download,
  FileCheck,
  Filter,
  RotateCcw,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { CleaningOptions, ColumnProfile } from '../../types/csv';
import { ParsedCsvResult, cleanDataset } from '../../utils/csvAnalysis';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

interface DataCleaningStudioProps {
  parsedResult: ParsedCsvResult;
}

export const DataCleaningStudio: React.FC<DataCleaningStudioProps> = ({ parsedResult }) => {
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [selectedCaseCol, setSelectedCaseCol] = useState(parsedResult.headers[0] || '');
  const [caseMode, setCaseMode] = useState<'none' | 'lower' | 'upper' | 'title'>('none');
  const [selectedMissingCol, setSelectedMissingCol] = useState(parsedResult.headers[0] || '');
  const [missingAction, setMissingAction] = useState<
    'none' | 'drop_row' | 'fill_mean' | 'fill_median' | 'fill_mode' | 'fill_custom'
  >('none');
  const [customFillValue, setCustomFillValue] = useState('');

  // Preview state
  const [previewResult, setPreviewResult] = useState<ReturnType<typeof cleanDataset> | null>(null);

  const handleRunCleaning = () => {
    const options: CleaningOptions = {
      removeDuplicates,
      trimWhitespace,
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

    const cleaned = cleanDataset(parsedResult, options);
    setPreviewResult(cleaned);
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

  const handleDownloadAuditReport = () => {
    if (!previewResult) return;
    const blob = new Blob([previewResult.summaryReport], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `audit_report_${parsedResult.fileName.replace('.csv', '')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="p-6" glow="emerald">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] mb-6 gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Wand2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Non-Destructive Cleaning Studio</h3>
            <p className="text-xs text-slate-400">
              Transform and sanitize a working copy without mutating original dataset
            </p>
          </div>
        </div>

        <Button
          size="sm"
          onClick={handleRunCleaning}
          icon={<Sparkles className="w-3.5 h-3.5" />}
        >
          Generate Sanitized Copy
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cleaning Controls */}
        <div className="space-y-5">
          {/* Deduplication Toggle */}
          <div className="p-4 rounded-xl bg-[#121422] border border-white/[0.05] flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">
                Remove Duplicate Records
              </span>
              <span className="text-[11px] text-slate-400">
                Filters identical row signatures ({parsedResult.overview.duplicateRowsCount} found)
              </span>
            </div>
            <input
              type="checkbox"
              checked={removeDuplicates}
              onChange={(e) => setRemoveDuplicates(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-white/20"
            />
          </div>

          {/* Trim Whitespace Toggle */}
          <div className="p-4 rounded-xl bg-[#121422] border border-white/[0.05] flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">
                Trim Stray Whitespace
              </span>
              <span className="text-[11px] text-slate-400">
                Strips leading/trailing spaces and cleans padding anomalies
              </span>
            </div>
            <input
              type="checkbox"
              checked={trimWhitespace}
              onChange={(e) => setTrimWhitespace(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-white/20"
            />
          </div>

          {/* Standardize Text Casing */}
          <div className="p-4 rounded-xl bg-[#121422] border border-white/[0.05] space-y-3">
            <span className="text-xs font-semibold text-slate-200 block">
              Standardize Text Field Casing
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
                <option value="title">Title Case (Capitalize)</option>
              </select>
            </div>
          </div>

          {/* Missing Value Treatment */}
          <div className="p-4 rounded-xl bg-[#121422] border border-white/[0.05] space-y-3">
            <span className="text-xs font-semibold text-slate-200 block">
              Column-Specific Missing Value Treatment
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
                <option value="fill_mean">Impute Mean (Numeric)</option>
                <option value="fill_median">Impute Median (Numeric)</option>
                <option value="fill_mode">Impute Most Frequent (Mode)</option>
                <option value="fill_custom">Fill Custom Value</option>
              </select>
            </div>

            {missingAction === 'fill_custom' && (
              <input
                type="text"
                placeholder="Enter custom replacement text/number..."
                value={customFillValue}
                onChange={(e) => setCustomFillValue(e.target.value)}
                className="w-full bg-[#0b0c14] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
              />
            )}
          </div>
        </div>

        {/* Cleaning Outcome Preview & Download */}
        <div className="p-5 rounded-2xl bg-[#121422] border border-white/[0.06] flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 block mb-4">
              Sanitization Outcome Audit
            </span>

            {previewResult ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 pb-4 border-b border-white/[0.06]">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Original Records:</span>
                    <span className="text-lg font-bold font-mono text-slate-300">
                      {parsedResult.overview.totalDataRows}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Cleaned Records:</span>
                    <span className="text-lg font-bold font-mono text-emerald-400">
                      {previewResult.cleanedRows.length}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Rows Removed (Duplicates / Dropped):</span>
                    <span className="font-mono text-rose-300 font-bold">
                      -{previewResult.rowsRemovedCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Data Cells Sanitized / Imputed:</span>
                    <span className="font-mono text-cyan-300 font-bold">
                      {previewResult.cellsModifiedCount}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#090a10] border border-white/[0.05] text-[11px] font-mono text-slate-400 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap">
                  {previewResult.summaryReport}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                Click <strong>"Generate Sanitized Copy"</strong> to preview row impacts and download
                the updated CSV.
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              size="sm"
              disabled={!previewResult}
              onClick={handleDownloadAuditReport}
              icon={<FileCheck className="w-4 h-4" />}
            >
              Export Audit Log
            </Button>
            <Button
              size="sm"
              disabled={!previewResult}
              onClick={handleDownloadCleaned}
              icon={<Download className="w-4 h-4" />}
            >
              Download Cleaned CSV
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
