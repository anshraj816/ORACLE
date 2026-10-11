import React from 'react';
import { HelpCircle, Network, ShieldAlert } from 'lucide-react';
import { ColumnProfile, CorrelationPair } from '../../types/csv';
import { Card } from '../common/Card';

interface CorrelationHeatmapProps {
  correlationPairs: CorrelationPair[];
  columnProfiles: ColumnProfile[];
}

export const CorrelationHeatmap: React.FC<CorrelationHeatmapProps> = ({
  correlationPairs,
  columnProfiles,
}) => {
  const numericCols = columnProfiles.filter((p) => p.inferredType === 'numeric' && p.stats);

  if (numericCols.length < 2) {
    return (
      <Card className="p-6 text-center text-xs text-slate-400">
        Correlation heatmap requires at least 2 numeric columns in the uploaded CSV dataset.
      </Card>
    );
  }

  // Get correlation between colA and colB
  const getCorr = (a: string, b: string): number => {
    if (a === b) return 1.0;
    const pair = correlationPairs.find(
      (p) => (p.colA === a && p.colB === b) || (p.colA === b && p.colB === a)
    );
    return pair ? pair.coefficient : 0;
  };

  const getCellBg = (r: number) => {
    if (r === 1) return 'bg-indigo-600/50 text-white font-bold';
    if (r > 0.6) return 'bg-indigo-500/35 text-indigo-200';
    if (r > 0.3) return 'bg-indigo-500/20 text-indigo-300';
    if (r > -0.3) return 'bg-slate-800/40 text-slate-400';
    if (r > -0.6) return 'bg-rose-500/20 text-rose-300';
    return 'bg-rose-500/35 text-rose-200';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Pearson Correlation Matrix</h3>
            <p className="text-xs text-slate-400">
              Co-movement coefficients computed pairwise across all numeric features [-1.00 to +1.00]
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="p-2 text-left text-slate-400 font-semibold border-b border-white/[0.06]">
                Feature
              </th>
              {numericCols.map((col) => (
                <th
                  key={col.name}
                  className="p-2 text-center text-slate-300 font-semibold border-b border-white/[0.06] max-w-[100px] truncate"
                  title={col.name}
                >
                  {col.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {numericCols.map((rowCol) => (
              <tr key={rowCol.name} className="border-b border-white/[0.03]">
                <td className="p-2 font-semibold text-slate-300 max-w-[120px] truncate" title={rowCol.name}>
                  {rowCol.name}
                </td>
                {numericCols.map((colCol) => {
                  const r = getCorr(rowCol.name, colCol.name);
                  return (
                    <td
                      key={colCol.name}
                      className={`p-2 text-center font-mono text-[11px] transition-colors ${getCellBg(r)}`}
                      title={`${rowCol.name} ↔ ${colCol.name}: Pearson r = ${r}`}
                    >
                      {r.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mandatory Causality Disclaimer */}
      <div className="mt-6 p-3.5 rounded-xl bg-[#090a10] border border-white/[0.05] flex items-start gap-2.5 text-[11px] text-slate-400 leading-relaxed">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <span>
          <strong className="text-slate-300">Statistical Caveat:</strong> Correlation measures linear
          association between variables, but <strong>correlation does NOT prove causation</strong>.
          Confounding variables, reverse causality, and sample biases must be evaluated prior to
          forming operational conclusions.
        </span>
      </div>
    </Card>
  );
};
