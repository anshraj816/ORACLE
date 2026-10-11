import React from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Copy,
  Database,
  Hash,
  HelpCircle,
  Layers,
  Sparkles,
  Table,
  Zap,
} from 'lucide-react';
import { ColumnProfile, DatasetOverview } from '../../types/csv';
import { formatBytes, formatPercentage } from '../../utils/formatters';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';

interface DatasetOverviewCardsProps {
  overview: DatasetOverview;
  columnProfiles: ColumnProfile[];
}

export const DatasetOverviewCards: React.FC<DatasetOverviewCardsProps> = ({
  overview,
  columnProfiles,
}) => {
  return (
    <div className="space-y-6">
      {/* Power BI Inspired KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Data Rows */}
        <Card className="p-4" glow="indigo">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Data Rows</span>
            <Table className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {overview.totalDataRows.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Excludes header</span>
        </Card>

        {/* Total Columns */}
        <Card className="p-4" glow="cyan">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Columns</span>
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
            {overview.totalColumns}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Fields defined</span>
        </Card>

        {/* Total Cells */}
        <Card className="p-4" glow="violet">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Cells</span>
            <Database className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {overview.totalCells.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Matrix points</span>
        </Card>

        {/* Missing Cells & % */}
        <Card
          className="p-4"
          glow={overview.missingPercentage > 5 ? 'none' : 'indigo'}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Missing Cells</span>
            <AlertTriangle
              className={`w-3.5 h-3.5 ${
                overview.missingCells > 0 ? 'text-amber-400' : 'text-slate-400'
              }`}
            />
          </div>
          <div
            className={`text-xl font-bold font-mono mt-1 ${
              overview.missingCells > 0 ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {overview.missingCells}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {formatPercentage(overview.missingPercentage)} null/empty
          </span>
        </Card>

        {/* Duplicate Rows */}
        <Card className="p-4" glow="violet">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Duplicates</span>
            <Copy className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <div
            className={`text-xl font-bold font-mono mt-1 ${
              overview.duplicateRowsCount > 0 ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {overview.duplicateRowsCount}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {overview.duplicateRowsCount > 0 ? 'Redundant records' : 'Clean / unique'}
          </span>
        </Card>

        {/* Constant Columns */}
        <Card className="p-4" glow="indigo">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Constants</span>
            <Hash className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {overview.constantColumnsCount}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Zero-variance fields</span>
        </Card>
      </div>

      {/* Row Numbering Convention Banner */}
      <div className="p-3.5 rounded-xl bg-[#121422] border border-white/[0.06] flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>
            <strong>Convention:</strong> Physical CSV Line 1 = Header row. Data Row #1 = Physical
            Line 2 (0-indexed programmatically, displayed 1-indexed in UI). Legitimate zero (0)
            values are preserved and never classified as missing.
          </span>
        </div>
        <span className="font-mono text-[11px] text-slate-400 shrink-0 ml-4 hidden md:block">
          {overview.fileName} ({formatBytes(overview.fileSizeBytes)})
        </span>
      </div>

      {/* Inferred Column Types Breakdown */}
      <Card className="p-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Inferred Column Type Distribution
          </h4>
          <span className="text-xs text-slate-400">{overview.totalColumns} Fields profiled</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3 rounded-xl bg-[#141829] border border-white/[0.04] flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">Numeric</span>
              <span className="text-lg font-bold text-indigo-400 font-mono">
                {overview.columnTypesSummary.numeric}
              </span>
            </div>
            <Badge variant="indigo" size="sm">NUM</Badge>
          </div>

          <div className="p-3 rounded-xl bg-[#141829] border border-white/[0.04] flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">Categorical</span>
              <span className="text-lg font-bold text-cyan-400 font-mono">
                {overview.columnTypesSummary.categorical}
              </span>
            </div>
            <Badge variant="cyan" size="sm">CAT</Badge>
          </div>

          <div className="p-3 rounded-xl bg-[#141829] border border-white/[0.04] flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">Date / Time</span>
              <span className="text-lg font-bold text-violet-400 font-mono">
                {overview.columnTypesSummary.date}
              </span>
            </div>
            <Badge variant="violet" size="sm">DATE</Badge>
          </div>

          <div className="p-3 rounded-xl bg-[#141829] border border-white/[0.04] flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">Boolean</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">
                {overview.columnTypesSummary.boolean}
              </span>
            </div>
            <Badge variant="emerald" size="sm">BOOL</Badge>
          </div>

          <div className="p-3 rounded-xl bg-[#141829] border border-white/[0.04] flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">Mixed / Ambiguous</span>
              <span
                className={`text-lg font-bold font-mono ${
                  overview.columnTypesSummary.mixed > 0 ? 'text-amber-400' : 'text-slate-400'
                }`}
              >
                {overview.columnTypesSummary.mixed}
              </span>
            </div>
            <Badge variant={overview.columnTypesSummary.mixed > 0 ? 'amber' : 'slate'} size="sm">
              MIXED
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};
