import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  Search,
  ShieldAlert,
  X,
} from 'lucide-react';
import { DataQualityIssue, IssueType } from '../../types/csv';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

interface DataQualityInspectorProps {
  issues: DataQualityIssue[];
  headers: string[];
  rows: (string | number | boolean | null)[][];
  fileName: string;
}

const PAGE_SIZE = 10;

export const DataQualityInspector: React.FC<DataQualityInspectorProps> = ({
  issues,
  headers,
  rows,
  fileName,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedColumn, setSelectedColumn] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [inspectingRowIndex, setInspectingRowIndex] = useState<number | null>(null);

  // Filter issues
  const filteredIssues = useMemo(() => {
    return issues.filter((iss) => {
      const matchSearch =
        searchTerm === '' ||
        iss.columnName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        iss.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(iss.originalValue).toLowerCase().includes(searchTerm.toLowerCase());

      const matchType = selectedType === 'all' || iss.issueType === selectedType;
      const matchCol = selectedColumn === 'all' || iss.columnName === selectedColumn;

      return matchSearch && matchType && matchCol;
    });
  }, [issues, searchTerm, selectedType, selectedColumn]);

  const totalPages = Math.max(1, Math.ceil(filteredIssues.length / PAGE_SIZE));
  const paginatedIssues = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredIssues.slice(start, start + PAGE_SIZE);
  }, [filteredIssues, page]);

  // Export Data Quality Report as Markdown
  const handleExportReport = () => {
    const md = `
# ORACLE Data Quality Audit Report
- Dataset: ${fileName}
- Generated At: ${new Date().toISOString()}
- Total Issues Detected: ${issues.length}

## Summary of Findings by Issue Type
${Array.from(new Set(issues.map((i) => i.issueType)))
  .map((t) => `- **${t}**: ${issues.filter((i) => i.issueType === t).length} instances`)
  .join('\n')}

## Detailed Issue Registry
| Data Row (0-idx) | CSV Line | Column | Issue Type | Severity | Value | Description |
|---|---|---|---|---|---|---|
${issues
  .slice(0, 100)
  .map(
    (i) =>
      `| ${i.dataRowIndex} | ${i.csvLineNumber} | ${i.columnName} | ${i.issueType} | ${i.severity} | ${
        i.originalValue ? `\`${i.originalValue}\`` : 'NULL'
      } | ${i.message} |`
  )
  .join('\n')}
${issues.length > 100 ? `\n*(Truncated: ${issues.length - 100} additional records omitted from markdown preview)*` : ''}
`.trim();

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `data_quality_report_${fileName.replace('.csv', '')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSeverityBadge = (severity: DataQualityIssue['severity']) => {
    switch (severity) {
      case 'high':
        return <Badge variant="rose" size="sm">HIGH</Badge>;
      case 'medium':
        return <Badge variant="amber" size="sm">MED</Badge>;
      case 'low':
        return <Badge variant="indigo" size="sm">LOW</Badge>;
    }
  };

  return (
    <Card className="p-6" glow="violet">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] mb-6 gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Data Quality Inspector</h3>
            <p className="text-xs text-slate-400">
              Granular record-level anomaly and integrity register ({issues.length} flags)
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleExportReport}
          icon={<Download className="w-3.5 h-3.5" />}
        >
          Export Quality Audit Report
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {/* Search */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search column, message, value..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#121422] border border-white/[0.08] rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-violet-500/50"
          />
        </div>

        {/* Issue Type Filter */}
        <select
          value={selectedType}
          onChange={(e) => {
            setSelectedType(e.target.value);
            setPage(1);
          }}
          className="bg-[#121422] border border-white/[0.08] rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none"
        >
          <option value="all">All Issue Types ({issues.length})</option>
          <option value="missing_value">Missing Values / Empty</option>
          <option value="whitespace_only">Whitespace-Only Cells</option>
          <option value="duplicate_row">Duplicate Rows</option>
          <option value="outlier">Numeric Outliers (IQR)</option>
          <option value="mixed_type">Mixed Column Types</option>
          <option value="constant_column">Constant / Zero Variance</option>
        </select>

        {/* Column Filter */}
        <select
          value={selectedColumn}
          onChange={(e) => {
            setSelectedColumn(e.target.value);
            setPage(1);
          }}
          className="bg-[#121422] border border-white/[0.08] rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none"
        >
          <option value="all">All Columns</option>
          {headers.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
      </div>

      {/* Issues Table */}
      {filteredIssues.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-xs">
          No quality issues matching the current filters.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#121526] text-slate-400 font-semibold border-b border-white/[0.06]">
              <tr>
                <th className="py-3 px-3">Data Row #</th>
                <th className="py-3 px-3">CSV Line</th>
                <th className="py-3 px-3">Column</th>
                <th className="py-3 px-3">Issue Type</th>
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-3">Original Value</th>
                <th className="py-3 px-3">Diagnostic Message</th>
                <th className="py-3 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {paginatedIssues.map((iss) => (
                <tr key={iss.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 px-3 font-mono text-slate-300">
                    Row #{iss.dataRowIndex + 1}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">
                    Line {iss.csvLineNumber}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-200">
                    {iss.columnName}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">
                    {iss.issueType.replace('_', ' ')}
                  </td>
                  <td className="py-2.5 px-3">{getSeverityBadge(iss.severity)}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-amber-300 truncate max-w-[140px]">
                    {iss.originalValue !== null ? iss.originalValue : 'NULL'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 max-w-[240px] truncate">
                    {iss.message}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => setInspectingRowIndex(iss.dataRowIndex)}
                      className="p-1 rounded text-slate-400 hover:text-indigo-300 hover:bg-white/10"
                      title="Inspect full row"
                      aria-label="Inspect full row"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/[0.06] text-xs text-slate-400">
          <span>
            Showing {(page - 1) * PAGE_SIZE + 1} to{' '}
            {Math.min(page * PAGE_SIZE, filteredIssues.length)} of {filteredIssues.length} issues
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-white/10 text-slate-300 disabled:opacity-30 disabled:pointer-events-none hover:bg-white/10"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-slate-200">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-white/10 text-slate-300 disabled:opacity-30 disabled:pointer-events-none hover:bg-white/10"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Row Inspection Modal */}
      {inspectingRowIndex !== null && rows[inspectingRowIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl bg-[#0f111a] border border-white/[0.1] rounded-2xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-indigo-400" />
                <h4 className="text-base font-bold text-white">
                  Inspect Record: Row #{inspectingRowIndex + 1} (Line {inspectingRowIndex + 2})
                </h4>
              </div>
              <button
                onClick={() => setInspectingRowIndex(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
                aria-label="Close record inspection"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {headers.map((h, i) => {
                const val = rows[inspectingRowIndex][i];
                const isNull = val === null || val === undefined;
                return (
                  <div
                    key={h}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#141829] border border-white/[0.04] text-xs"
                  >
                    <span className="font-semibold text-slate-400">{h}</span>
                    <span
                      className={`font-mono ${
                        isNull ? 'text-amber-400 font-semibold' : 'text-slate-100'
                      }`}
                    >
                      {isNull ? 'NULL (Missing)' : String(val)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <Button size="sm" onClick={() => setInspectingRowIndex(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
