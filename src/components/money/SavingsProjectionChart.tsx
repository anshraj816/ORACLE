import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CurrencyCode } from '../../types/money';
import { formatCurrency } from '../../utils/formatters';

interface SavingsProjectionChartProps {
  baseMonthlySurplus: number;
  simulatedMonthlySurplus: number;
  savingsTarget: number;
  currency: CurrencyCode;
}

export const SavingsProjectionChart: React.FC<SavingsProjectionChartProps> = ({
  baseMonthlySurplus,
  simulatedMonthlySurplus,
  savingsTarget,
  currency,
}) => {
  // Generate 12 months cumulative trajectory
  const data = Array.from({ length: 13 }, (_, i) => {
    const month = i === 0 ? 'Start' : `Month ${i}`;
    return {
      month,
      baseline: Math.round(baseMonthlySurplus * i),
      simulated: Math.round(simulatedMonthlySurplus * i),
      targetGoal: Math.round(savingsTarget * i),
    };
  });

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorSimulated" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="month"
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <YAxis
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickFormatter={(val) => {
              if (Math.abs(val) >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
              if (Math.abs(val) >= 1000) return `${(val / 1000).toFixed(0)}k`;
              return val;
            }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-[#0f111a]/95 border border-white/10 rounded-xl p-3 shadow-xl backdrop-blur-md">
                    <div className="text-xs font-semibold text-slate-400 mb-2">{label}</div>
                    {payload.map((item) => (
                      <div key={item.dataKey as string} className="flex items-center justify-between gap-4 text-xs py-0.5">
                        <span className="flex items-center gap-1.5" style={{ color: item.color }}>
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                          {item.name}:
                        </span>
                        <span className="font-mono font-bold text-slate-100">
                          {formatCurrency(Number(item.value), currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '10px' }}
            formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
          />
          <Area
            type="monotone"
            dataKey="baseline"
            name="Original Plan"
            stroke="#6366f1"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorBaseline)"
          />
          <Area
            type="monotone"
            dataKey="simulated"
            name="What-If Simulation"
            stroke="#38bdf8"
            strokeWidth={2}
            strokeDasharray="4 4"
            fillOpacity={1}
            fill="url(#colorSimulated)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
