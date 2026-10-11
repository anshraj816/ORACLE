import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { TimeCalculations, TimeInputs } from '../../types/time';
import { ACTIVITIES } from '../../utils/timeCalculations';
import { formatHours, formatPercentage } from '../../utils/formatters';

interface TimeDonutChartProps {
  inputs: TimeInputs;
  metrics: TimeCalculations;
}

export const TimeDonutChart: React.FC<TimeDonutChartProps> = ({ inputs, metrics }) => {
  const chartData = [
    { name: 'Sleep & Rest', value: inputs.sleep, color: '#6366f1' },
    { name: 'College / Work', value: inputs.collegeWork, color: '#38bdf8' },
    { name: 'Commute / Travel', value: inputs.travel, color: '#a855f7' },
    { name: 'Study & Deep Work', value: inputs.study, color: '#10b981' },
    { name: 'Entertainment & Leisure', value: inputs.entertainment, color: '#f43f5e' },
    { name: 'Meals & Personal Care', value: inputs.mealsPersonal, color: '#f59e0b' },
    { name: 'Other Commitments', value: inputs.other, color: '#64748b' },
  ].filter((item) => item.value > 0);

  // If there's unallocated time, include it in the donut
  if (metrics.unallocated > 0) {
    chartData.push({
      name: 'Unallocated Buffer',
      value: metrics.unallocated,
      color: '#1e293b',
    });
  }

  return (
    <div className="relative w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={68}
            outerRadius={95}
            paddingAngle={2}
            dataKey="value"
            animationDuration={600}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="#090a10" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                const pct = ((data.value / 24) * 100).toFixed(1);
                return (
                  <div className="bg-[#0f111a]/95 border border-white/10 rounded-xl p-3 shadow-xl backdrop-blur-md">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                      <span className="text-xs font-semibold text-white">{data.name}</span>
                    </div>
                    <div className="text-sm font-bold text-slate-100 font-mono">
                      {formatHours(data.value)} ({data.value} hrs)
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {pct}% of 24h daily budget
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center Donut Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          24h Daily Budget
        </span>
        <span
          className={`text-lg font-bold font-mono mt-0.5 ${
            metrics.isOverAllocated ? 'text-rose-400' : 'text-slate-100'
          }`}
        >
          {metrics.totalAllocated} / 24h
        </span>
        <span
          className={`text-[10px] font-semibold mt-0.5 ${
            metrics.isOverAllocated ? 'text-rose-400' : 'text-slate-400'
          }`}
        >
          {metrics.isOverAllocated
            ? `+${metrics.overAllocatedHours}h Over`
            : `${metrics.unallocated}h Buffer`}
        </span>
      </div>
    </div>
  );
};
