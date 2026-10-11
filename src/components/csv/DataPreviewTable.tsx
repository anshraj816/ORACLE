import React, { useMemo, useState } from 'react';
import {
  ArrowDownAZ,
  ArrowUpAZ,
  ChevronLeft,
  ChevronRight,
  Columns,
  Eye,
  Search,
  Table,
} from 'lucide-react';
import { ColumnProfile } from '../../types/csv';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';

interface DataPreviewTableProps {
  headers: string[];
  rows: (string | number | boolean | null)[][];
  columnProfiles: ColumnProfile[];
}

const PAGE_SIZE = 15;

export const DataPreviewTable: React.FC<DataPreviewTableProps> = ({
  headers,
  rows,
  columnProfiles,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    headers.forEach((h) => (initial[h] = true));
    return initial;
  });
  const [showColPicker, setShowColPicker] = useState(false);

  // Sorting handler
  const handleSort = (colIndex: number) => {
    if (sortCol === colIndex) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else {
        setSortCol(null);
        setSortDirection('asc');
      }
    } else {
      setSortCol(colIndex);
      setSortDirection('asc');
    }
  };

  // Filtered and Sorted rows
  const filteredAndSortedRows = useMemo(() => {
    let result = rows.map((r, originalIndex) => ({ row: r, originalIndex }));

    // Global Search
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      result = result.filter(({ row }) =>
        row.some((cell) => cell !== null && cell !== undefined && String(cell).toLowerCase().includes(q))
      );
    }

    // Sort
    if (sortCol !== null) {
      result.sort((a, b) => {
        const valA = a.row[sortCol];
        const valB = b.row[sortCol];

        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
        if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [rows, searchTerm, sortCol, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedRows.length / PAGE_SIZE));
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredAndSortedRows.slice(start, start + PAGE_SIZE);
  }, [filteredAndSortedRows, page]);

  const getTypeBadge = (colName: string) => {
    const prof = columnProfiles.find((p) => p.name === colName);
    if (!prof) return null;

    const variants: Record<string, 'indigo' | 'cyan' | 'violet' | 'emerald' | 'amber'> = {
      numeric: 'indigo',
      categorical: 'cyan',
      date: 'violet',
      boolean: 'emerald',
      mixed: 'amber',
    };

    return (
      <Badge variant={variants[prof.inferredType] || 'indigo'} size="sm">
        {prof.inferredType.slice(0, 3).toUpperCase()}
      </Badge>
    );
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] mb-6 gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Table className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Interactive Data Grid</h3>
            <p className="text-xs text-slate-400">
              Showing {filteredAndSortedRows.length} of {rows.length} total records
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Global Search */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search table values..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="bg-[#121422] border border-white/[0.08] rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 w-44 sm:w-56"
            />
          </div>

          {/* Column Picker Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowColPicker((prev) => !prev)}
              className="p-2 rounded-xl bg-[#121422] border border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Column visibility"
              aria-label="Column visibility"
            >
              <Columns className="w-4 h-4" />
            </button>

            {showColPicker && (
              <div className="absolute right-0 top-12 z-20 w-56 bg-[#0f111a] border border-white/10 rounded-xl p-3 shadow-2xl space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Visible Columns
                </span>
                <div className="max-h-48 overflow-y-auto space-y-1.5">
                  {headers.map((h) => (
                    <label key={h} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns[h] !== false}
                        onChange={(e) =>
                          setVisibleColumns((prev) => ({ ...prev, [h]: e.target.checked }))
                        }
                        className="rounded border-white/20 bg-slate-800 text-indigo-500 focus:ring-0"
                      />
                      <span className="truncate">{h}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-[#121526] text-slate-400 font-semibold border-b border-white/[0.06]">
            <tr>
              <th className="py-3 px-3 w-16 text-slate-400 font-mono">Row #</th>
              {headers.map((h, idx) => {
                if (visibleColumns[h] === false) return null;
                const isSorted = sortCol === idx;
                return (
                  <th
                    key={h}
                    onClick={() => handleSort(idx)}
                    className="py-3 px-3 cursor-pointer hover:text-white select-none transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span>{h}</span>
                      {getTypeBadge(h)}
                      {isSorted ? (
                        sortDirection === 'asc' ? (
                          <ArrowUpAZ className="w-3.5 h-3.5 text-indigo-400" />
                        ) : (
                          <ArrowDownAZ className="w-3.5 h-3.5 text-indigo-400" />
                        )
                      ) : null}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {paginatedRows.map(({ row, originalIndex }) => (
              <tr key={originalIndex} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                  #{originalIndex + 1}
                </td>
                {headers.map((h, colIdx) => {
                  if (visibleColumns[h] === false) return null;
                  const cell = row[colIdx];
                  const isNull = cell === null || cell === undefined;
                  return (
                    <td
                      key={`${originalIndex}-${colIdx}`}
                      className={`py-2.5 px-3 font-mono text-[11px] ${
                        isNull
                          ? 'text-amber-400/80 bg-amber-500/5 font-semibold'
                          : typeof cell === 'number'
                          ? 'text-slate-200'
                          : 'text-slate-300'
                      }`}
                    >
                      {isNull ? 'NULL' : String(cell)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/[0.06] text-xs text-slate-400">
          <span>
            Showing {(page - 1) * PAGE_SIZE + 1} to{' '}
            {Math.min(page * PAGE_SIZE, filteredAndSortedRows.length)} of {filteredAndSortedRows.length} records
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
    </Card>
  );
};
