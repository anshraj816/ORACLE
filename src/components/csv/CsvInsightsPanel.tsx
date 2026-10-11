import React from 'react';
import {
  AlertTriangle,
  Compass,
  FileSearch,
  Lightbulb,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { CsvInsight } from '../../types/csv';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';

interface CsvInsightsPanelProps {
  insights: CsvInsight[];
}

export const CsvInsightsPanel: React.FC<CsvInsightsPanelProps> = ({ insights }) => {
  const getBadgeVariant = (cat: CsvInsight['category']) => {
    switch (cat) {
      case 'quality':
        return 'amber';
      case 'correlation':
        return 'indigo';
      case 'distribution':
        return 'cyan';
      case 'action':
        return 'violet';
    }
  };

  const getIcon = (cat: CsvInsight['category']) => {
    switch (cat) {
      case 'quality':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'correlation':
        return <TrendingUp className="w-4 h-4 text-indigo-400 shrink-0" />;
      case 'distribution':
        return <FileSearch className="w-4 h-4 text-cyan-400 shrink-0" />;
      case 'action':
        return <Compass className="w-4 h-4 text-violet-400 shrink-0" />;
    }
  };

  return (
    <Card className="p-6" glow="violet">
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Automated Statistical Intelligence</h3>
            <p className="text-xs text-slate-400">
              Deterministic rule-based deductions derived from computed profiling metrics
            </p>
          </div>
        </div>

        <Badge variant="violet" size="sm">
          {insights.length} Synthesized Findings
        </Badge>
      </div>

      <div className="space-y-3.5">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="p-4 rounded-xl border border-white/[0.06] bg-[#121422]/60 flex items-start gap-3.5"
          >
            <div className="mt-0.5">{getIcon(insight.category)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-semibold text-slate-100">{insight.title}</h4>
                <Badge variant={getBadgeVariant(insight.category)} size="sm">
                  {insight.category.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{insight.description}</p>
              <div className="mt-2 text-[11px] font-mono text-slate-400 bg-[#0c0e18] px-2.5 py-1.5 rounded-lg border border-white/[0.03]">
                Evidence: {insight.evidence}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
