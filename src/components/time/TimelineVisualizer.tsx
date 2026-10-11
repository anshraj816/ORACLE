import React from 'react';
import { TimeInputs } from '../../types/time';
import { ACTIVITIES } from '../../utils/timeCalculations';
import { formatHours } from '../../utils/formatters';

interface TimelineVisualizerProps {
  inputs: TimeInputs;
}

export const TimelineVisualizer: React.FC<TimelineVisualizerProps> = ({ inputs }) => {
  const blocks = [
    { label: 'Sleep & Rest', hours: inputs.sleep, color: '#6366f1' },
    { label: 'College / Work', hours: inputs.collegeWork, color: '#38bdf8' },
    { label: 'Commute / Travel', hours: inputs.travel, color: '#a855f7' },
    { label: 'Study & Deep Work', hours: inputs.study, color: '#10b981' },
    { label: 'Entertainment', hours: inputs.entertainment, color: '#f43f5e' },
    { label: 'Meals & Care', hours: inputs.mealsPersonal, color: '#f59e0b' },
    { label: 'Other', hours: inputs.other, color: '#64748b' },
  ].filter((b) => b.hours > 0);

  const total = blocks.reduce((acc, b) => acc + b.hours, 0);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Daily 24-Hour Timeline Distribution</span>
        <span className="font-mono">{total.toFixed(1)} / 24.0h</span>
      </div>

      {/* Visual Bar */}
      <div className="relative w-full h-8 rounded-xl bg-slate-900 border border-white/[0.08] overflow-hidden flex">
        {blocks.map((block, idx) => {
          const widthPct = Math.min(100, (block.hours / 24) * 100);
          return (
            <div
              key={idx}
              style={{
                width: `${widthPct}%`,
                backgroundColor: block.color,
              }}
              title={`${block.label}: ${formatHours(block.hours)} (${widthPct.toFixed(1)}%)`}
              className="h-full group relative transition-all duration-300 hover:brightness-110 cursor-pointer flex items-center justify-center overflow-hidden"
            >
              {widthPct > 8 && (
                <span className="text-[10px] font-bold text-white truncate px-1 select-none drop-shadow-sm">
                  {formatHours(block.hours)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* 24-Hour Markers */}
      <div className="flex justify-between text-[10px] font-mono text-slate-500 px-1">
        <span>00:00</span>
        <span>04:00</span>
        <span>08:00</span>
        <span>12:00</span>
        <span>16:00</span>
        <span>20:00</span>
        <span>24:00</span>
      </div>
    </div>
  );
};
