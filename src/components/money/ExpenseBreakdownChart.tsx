import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { CurrencyCode, ExpenseBreakdown } from '../../types/money';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

interface ExpenseBreakdownChartProps {
  breakdown: ExpenseBreakdown[];
  totalExpenses: number;
  currency: CurrencyCode;
}

export const ExpenseBreakdownChart: React.FC<ExpenseBreakdownChartProps> = ({
  breakdown,
  totalExpenses,
  currency,
}) => {
  const chartData = breakdown
    .filter((item) => item.amount > 0)
    .map((item) => ({
      name: item.category,
      value: item.amount,
      percentage: item.percentage,
      color: item.color,
    }));

  if (totalExpenses === 0 || chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500 text-xs">
        <span>No expenses recorded yet</span>
      </div>
    );
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
            paddingAngle={4}
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
                return (
                  <div className="bg-[#0f111a]/95 border border-white/10 rounded-xl p-3 shadow-xl backdrop-blur-md">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                      <span className="text-xs font-semibold text-white">{data.name}</span>
                    </div>
                    <div className="text-sm font-bold text-slate-100">
                      {formatCurrency(data.value, currency)}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {formatPercentage(data.percentage)} of total expenses
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
          Total Outflows
        </span>
        <span className="text-lg font-bold text-white mt-0.5">
          {formatCurrency(totalExpenses, currency)}
        </span>
      </div>
    </div>
  );
};
