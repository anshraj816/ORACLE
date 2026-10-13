import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import { ColumnProfile } from '../../types/csv';
import { formatPercentage } from '../../utils/formatters';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';

interface VisualAnalyticsPanelProps {
  headers: string[];
  rows: (string | number | boolean | null)[][];
  columnProfiles: ColumnProfile[];
}

type ChartType = 'histogram' | 'categorical' | 'scatter' | 'timeseries' | 'missing_bar';

export const VisualAnalyticsPanel: React.FC<VisualAnalyticsPanelProps> = ({
  headers,
  rows,
  columnProfiles,
}) => {
  const numericColumns = columnProfiles.filter((p) => p.inferredType === 'numeric');
  const categoricalColumns = columnProfiles.filter((p) => p.inferredType === 'categorical');
  const dateColumns = columnProfiles.filter((p) => p.inferredType === 'date');

  const [chartType, setChartType] = useState<ChartType>('histogram');
  const [selectedColA, setSelectedColA] = useState<string>(numericColumns[0]?.name || headers[0] || '');
  const [selectedColB, setSelectedColB] = useState<string>(numericColumns[1]?.name || headers[1] || '');

  // 1. Histogram data builder
  const histogramData = useMemo(() => {
    const prof = columnProfiles.find((p) => p.name === selectedColA);
    if (!prof || !prof.stats) return [];

    const numbers = rows
      .map((r) => r[prof.index])
      .filter((v): v is number => typeof v === 'number')
      .sort((a, b) => a - b);

    if (numbers.length === 0) return [];

    const min = prof.stats.min;
    const max = prof.stats.max;
    const binCount = 8;
    const binSize = (max - min) / binCount || 1;

    const bins = Array.from({ length: binCount }, (_, i) => {
      const start = min + i * binSize;
      const end = start + binSize;
      return {
        bin: `${start.toFixed(1)}–${end.toFixed(1)}`,
        start,
        end,
        count: 0,
      };
    });

    numbers.forEach((val) => {
      let idx = Math.floor((val - min) / binSize);
      if (idx >= binCount) idx = binCount - 1;
      if (idx < 0) idx = 0;
      bins[idx].count++;
    });

    return bins;
  }, [selectedColA, rows, columnProfiles]);

  // 2. Categorical frequencies data builder
  const categoricalData = useMemo(() => {
    const prof = columnProfiles.find((p) => p.name === selectedColA);
    if (!prof || !prof.frequencies) return [];
    return prof.frequencies.slice(0, 10).map((f) => ({
      category: f.value || 'BLANK',
      count: f.count,
      percentage: f.percentage,
    }));
  }, [selectedColA, columnProfiles]);

  // 3. Scatter Plot data builder
  const scatterData = useMemo(() => {
    const profA = columnProfiles.find((p) => p.name === selectedColA);
    const profB = columnProfiles.find((p) => p.name === selectedColB);
    if (!profA || !profB) return [];

    const points: { x: number; y: number }[] = [];
    rows.forEach((r) => {
      const valA = r[profA.index];
      const valB = r[profB.index];
      if (typeof valA === 'number' && typeof valB === 'number') {
        points.push({ x: valA, y: valB });
      }
    });

    return points;
  }, [selectedColA, selectedColB, rows, columnProfiles]);

  // 4. Missing value visualization data
  const missingData = useMemo(() => {
    return columnProfiles.map((p) => ({
      column: p.name,
      missingPct: p.missingPercentage,
      missingCount: p.missingCount,
    }));
  }, [columnProfiles]);

  // 5. Time series data builder
  const timeSeriesData = useMemo(() => {
    const profDate = columnProfiles.find((p) => p.name === selectedColA);
    const profNum = columnProfiles.find((p) => p.name === selectedColB);
    if (!profDate || !profNum) return [];

    return rows
      .map((r) => ({
        date: String(r[profDate.index] || ''),
        value: typeof r[profNum.index] === 'number' ? (r[profNum.index] as number) : null,
      }))
      .filter((p) => p.date !== '' && p.value !== null)
      .slice(0, 40);
  }, [selectedColA, selectedColB, rows, columnProfiles]);

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] mb-6 gap-4">
        <div>
          <h3 className="text-base font-bold text-white">Visual Analytics Studio</h3>
          <p className="text-xs text-slate-400">
            Interactive chart representations synthesized directly from parsed column types
          </p>
        </div>

        {/* Chart Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#121422] p-1 rounded-xl border border-white/[0.06]">
          <button
            onClick={() => setChartType('histogram')}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              chartType === 'histogram'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Histogram
          </button>
          <button
            onClick={() => setChartType('categorical')}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              chartType === 'categorical'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Frequencies
          </button>
          <button
            onClick={() => setChartType('scatter')}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              chartType === 'scatter'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Scatter Plot
          </button>
          <button
            onClick={() => setChartType('missing_bar')}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              chartType === 'missing_bar'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Missing Audit
          </button>
          {dateColumns.length > 0 && (
            <button
              onClick={() => setChartType('timeseries')}
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                chartType === 'timeseries'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Time Trend
            </button>
          )}
        </div>
      </div>

      {/* Axis Selection Dropdowns */}
      <div className="flex items-center gap-4 mb-6 p-3 rounded-xl bg-[#121422] border border-white/[0.04]">
        {chartType === 'histogram' && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold">Numeric Target:</span>
            <select
              value={selectedColA}
              onChange={(e) => setSelectedColA(e.target.value)}
              className="bg-[#0b0c14] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none"
            >
              {numericColumns.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {chartType === 'categorical' && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold">Category Column:</span>
            <select
              value={selectedColA}
              onChange={(e) => setSelectedColA(e.target.value)}
              className="bg-[#0b0c14] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none"
            >
              {columnProfiles.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.inferredType})
                </option>
              ))}
            </select>
          </div>
        )}

        {chartType === 'scatter' && (
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-semibold">X-Axis (Numeric):</span>
              <select
                value={selectedColA}
                onChange={(e) => setSelectedColA(e.target.value)}
                className="bg-[#0b0c14] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none"
              >
                {numericColumns.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-semibold">Y-Axis (Numeric):</span>
              <select
                value={selectedColB}
                onChange={(e) => setSelectedColB(e.target.value)}
                className="bg-[#0b0c14] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none"
              >
                {numericColumns.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {chartType === 'timeseries' && (
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-semibold">Date Column:</span>
              <select
                value={selectedColA}
                onChange={(e) => setSelectedColA(e.target.value)}
                className="bg-[#0b0c14] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none"
              >
                {dateColumns.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-semibold">Metric (Numeric):</span>
              <select
                value={selectedColB}
                onChange={(e) => setSelectedColB(e.target.value)}
                className="bg-[#0b0c14] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none"
              >
                {numericColumns.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Chart Canvas Container */}
      <div className="w-full h-80">
        {chartType === 'histogram' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histogramData} margin={{ top: 10, right: 10, left: -10, bottom: 35 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="bin"
                stroke="#64748b"
                interval={0}
                angle={-25}
                textAnchor="end"
                height={45}
                tick={{ fill: '#94a3b8', fontSize: 10 }}
              />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#0f111a]/95 border border-white/10 rounded-xl p-3 shadow-xl backdrop-blur-md text-xs">
                        <div className="font-semibold text-slate-300">Range: {data.bin}</div>
                        <div className="font-bold text-indigo-400 mt-1">Count: {data.count} records</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {chartType === 'categorical' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoricalData} margin={{ top: 10, right: 10, left: -10, bottom: 45 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="category"
                stroke="#64748b"
                interval={0}
                angle={-35}
                textAnchor="end"
                height={55}
                tick={{ fill: '#94a3b8', fontSize: 10 }}
              />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#0f111a]/95 border border-white/10 rounded-xl p-3 shadow-xl backdrop-blur-md text-xs">
                        <div className="font-semibold text-slate-300">{data.category}</div>
                        <div className="font-bold text-cyan-400 mt-1">
                          {data.count} records ({formatPercentage(data.percentage)})
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {chartType === 'scatter' && (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                type="number"
                dataKey="x"
                name={selectedColA}
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name={selectedColB}
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#0f111a]/95 border border-white/10 rounded-xl p-3 shadow-xl backdrop-blur-md text-xs">
                        <div className="text-slate-300">
                          {selectedColA}: <strong>{payload[0].value}</strong>
                        </div>
                        <div className="text-slate-300 mt-0.5">
                          {selectedColB}: <strong>{payload[1].value}</strong>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter name="Points" data={scatterData} fill="#a855f7" />
            </ScatterChart>
          </ResponsiveContainer>
        )}

        {chartType === 'missing_bar' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={missingData} margin={{ top: 10, right: 10, left: -10, bottom: 45 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="column"
                stroke="#64748b"
                interval={0}
                angle={-35}
                textAnchor="end"
                height={55}
                tick={{ fill: '#94a3b8', fontSize: 10 }}
              />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#0f111a]/95 border border-white/10 rounded-xl p-3 shadow-xl backdrop-blur-md text-xs">
                        <div className="font-semibold text-slate-300">{data.column}</div>
                        <div className="font-bold text-amber-400 mt-1">
                          {data.missingCount} missing cells ({formatPercentage(data.missingPct)})
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="missingPct" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {chartType === 'timeseries' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -10, bottom: 45 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                interval={0}
                angle={-35}
                textAnchor="end"
                height={55}
                tick={{ fill: '#94a3b8', fontSize: 10 }}
              />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};
