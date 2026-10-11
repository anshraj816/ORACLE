import React, { useState } from 'react';
import {
  AlertTriangle,
  Calculator,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { TimeInsight } from '../../types/time';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';

interface TimeInsightsCardProps {
  insights: TimeInsight[];
}

export const TimeInsightsCard: React.FC<TimeInsightsCardProps> = ({ insights }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const getBadgeVariant = (type: TimeInsight['type']) => {
    switch (type) {
      case 'critical':
        return 'rose';
      case 'warning':
        return 'amber';
      case 'positive':
        return 'emerald';
      case 'opportunity':
        return 'cyan';
    }
  };

  return (
    <Card className="p-6" glow="cyan">
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Rule-Based Routine Intelligence</h3>
            <p className="text-xs text-slate-400">
              Deterministic calculations evaluating daily capacity, sleep debt, and study momentum
            </p>
          </div>
        </div>

        <Badge variant="cyan" size="sm">
          {insights.length} Observations
        </Badge>
      </div>

      <div className="space-y-3.5">
        {insights.map((insight) => {
          const isExpanded = expandedId === insight.id;

          return (
            <div
              key={insight.id}
              className="rounded-xl border border-white/[0.06] bg-[#121422]/60 overflow-hidden transition-all duration-200"
            >
              <div
                onClick={() => toggleExpand(insight.id)}
                className="p-4 flex items-start justify-between gap-3 cursor-pointer hover:bg-white/[0.02]"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {insight.type === 'critical' || insight.type === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-cyan-400 shrink-0" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-100">{insight.title}</h4>
                      <Badge variant={getBadgeVariant(insight.type)} size="sm">
                        {insight.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {insight.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="p-1 rounded-md text-slate-400 hover:text-white"
                  aria-label={isExpanded ? 'Collapse math' : 'Show math'}
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-white/[0.04] bg-[#0c0e18]/80 text-xs text-slate-300 animate-in fade-in">
                  <div className="flex items-center gap-1.5 font-semibold text-cyan-300 mb-1">
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Calculation & Schedule Verification:</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#141829] font-mono text-[11px] text-slate-300 border border-white/[0.04]">
                    {insight.calculationExplanation}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
