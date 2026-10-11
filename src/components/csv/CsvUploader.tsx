import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Database,
  FileSpreadsheet,
  FileUp,
  Sparkles,
  UploadCloud,
} from 'lucide-react';
import { ParsedCsvResult, parseCsvContent } from '../../utils/csvAnalysis';
import {
  SAMPLE_CSV_BUDGET,
  SAMPLE_CSV_CHURN,
  SAMPLE_CSV_STUDENT,
} from '../../utils/sampleData';
import { formatBytes } from '../../utils/formatters';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

interface CsvUploaderProps {
  onParsed: (result: ParsedCsvResult) => void;
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
  currentResult: ParsedCsvResult | null;
}

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export const CsvUploader: React.FC<CsvUploaderProps> = ({
  onParsed,
  isLoading,
  setIsLoading,
  currentResult,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const processFile = (file: File) => {
    setErrorMsg(null);
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
      setErrorMsg('Please upload a valid .csv file.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMsg(`File exceeds the 25MB browser limit (${formatBytes(file.size)}).`);
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = parseCsvContent(text, file.name, file.size);
        onParsed(parsed);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to parse CSV file.');
      } finally {
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setErrorMsg('Failed to read file from disk.');
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSampleLoad = (type: 'churn' | 'student' | 'budget') => {
    setErrorMsg(null);
    setIsLoading(true);
    setTimeout(() => {
      try {
        if (type === 'churn') {
          const res = parseCsvContent(SAMPLE_CSV_CHURN, 'customer_churn_analytics.csv');
          onParsed(res);
        } else if (type === 'student') {
          const res = parseCsvContent(SAMPLE_CSV_STUDENT, 'student_academic_performance.csv');
          onParsed(res);
        } else {
          const res = parseCsvContent(SAMPLE_CSV_BUDGET, 'monthly_transactions_audit.csv');
          onParsed(res);
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to load sample dataset.');
      } finally {
        setIsLoading(false);
      }
    }, 150);
  };

  return (
    <Card className="p-6" glow="violet">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-white/[0.08] mb-6 gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-violet-400" />
            CSV Data Ingestion & Sample Library
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            100% Client-side browser profiling via PapaParse V8 engine. Max 25MB.
          </p>
        </div>

        {/* 1-Click Sample Datasets */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Quick Samples:
          </span>
          <button
            onClick={() => handleSampleLoad('churn')}
            disabled={isLoading}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-[#181b2a] hover:bg-[#23273e] text-slate-200 border border-white/[0.06] transition-colors cursor-pointer"
          >
            Customer Churn
          </button>
          <button
            onClick={() => handleSampleLoad('student')}
            disabled={isLoading}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-[#181b2a] hover:bg-[#23273e] text-slate-200 border border-white/[0.06] transition-colors cursor-pointer"
          >
            Student Scores
          </button>
          <button
            onClick={() => handleSampleLoad('budget')}
            disabled={isLoading}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-[#181b2a] hover:bg-[#23273e] text-slate-200 border border-white/[0.06] transition-colors cursor-pointer"
          >
            Bank Transactions
          </button>
        </div>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragOver
            ? 'border-violet-400 bg-violet-500/10 scale-[1.01]'
            : 'border-white/10 hover:border-violet-500/40 bg-[#0c0e18]/60 hover:bg-[#121526]/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              processFile(e.target.files[0]);
            }
          }}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-lg shadow-violet-950/50">
            {isLoading ? (
              <span className="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>

          <div>
            <span className="text-sm font-bold text-white block">
              {isLoading ? 'Parsing and profiling CSV...' : 'Click to browse or drop your CSV here'}
            </span>
            <span className="text-xs text-slate-400 mt-1 block">
              Supports UTF-8 CSVs up to 25MB • Local memory parsing only
            </span>
          </div>

          {currentResult && !isLoading && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                Active: {currentResult.fileName} ({formatBytes(currentResult.fileSizeBytes)},{' '}
                {currentResult.overview.totalDataRows} rows)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Error Message Alert */}
      {errorMsg && (
        <div className="mt-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}
    </Card>
  );
};
