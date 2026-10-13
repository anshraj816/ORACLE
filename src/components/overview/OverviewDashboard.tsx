import React from 'react';
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Coins,
  Cpu,
  FileSpreadsheet,
  LineChart,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateMoneyMetrics } from '../../utils/moneyCalculations';
import { calculateTimeMetrics } from '../../utils/timeCalculations';
import { formatCurrency, formatHours, formatPercentage } from '../../utils/formatters';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

export const OverviewDashboard: React.FC = () => {
  const { setActiveTab, moneyInputs, timeInputs, currency, parsedCsv } = useApp();

  const moneyMetrics = calculateMoneyMetrics(moneyInputs);
  const timeMetrics = calculateTimeMetrics(timeInputs);

  // QUANTRIX Synergy Index (Score 0–100)
  // Financial component (0-40): savings rate and surplus health
  const financeScore = Math.min(
    40,
    Math.max(
      0,
      moneyMetrics.isDeficit
        ? 5
        : Math.round(15 + Math.min(25, moneyMetrics.savingsRate * 0.7))
    )
  );

  // Time component (0-40): routine feasibility and dedicated study pacing
  const timeScore = Math.min(
    40,
    Math.max(
      0,
      timeMetrics.isOverAllocated
        ? 10
        : Math.round(
            20 +
              Math.min(20, (timeMetrics.weeklyStudy / 40) * 20)
          )
    )
  );

  // Data component (0-20): dataset health / clean ratio
  const dataScore = parsedCsv
    ? Math.min(
        20,
        Math.max(
          5,
          Math.round(
            20 -
              (parsedCsv.issues.length /
                Math.max(1, parsedCsv.overview.totalDataRows)) *
                10
          )
        )
      )
    : 18;

  const totalSynergyScore = Math.min(100, Math.max(10, financeScore + timeScore + dataScore));
  const synergyTier =
    totalSynergyScore >= 85
      ? { label: 'OPTIMAL SYNERGY', color: 'text-emerald-400', badge: 'emerald', ringColor: '#10b981' }
      : totalSynergyScore >= 70
      ? { label: 'STRONG ALIGNMENT', color: 'text-cyan-400', badge: 'cyan', ringColor: '#06b6d4' }
      : totalSynergyScore >= 50
      ? { label: 'MODERATE BALANCE', color: 'text-amber-400', badge: 'amber', ringColor: '#f59e0b' }
      : { label: 'NEEDS RE-CALIBRATION', color: 'text-rose-400', badge: 'rose', ringColor: '#f43f5e' };


  // LED blinking animation states:
  // Words: ["Turn", "Complexity", "to", "Reality"]
  // 0: All hidden/dimmed (clean pause before restart)
  // 1: "Turn" appears with single clean LED pulse
  // 2: "Complexity" appears with single clean LED pulse
  // 3: "to" appears with single clean LED pulse
  // 4: "Reality" appears with single clean LED pulse & full line illuminates
  // 4 remains still for 3 seconds, then restarts
  const [animStep, setAnimStep] = React.useState<number>(0);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (animStep === 0) {
      // Short reset pause before Turn starts
      timer = setTimeout(() => {
        setAnimStep(1);
      }, 400);
    } else if (animStep === 1) {
      // Turn -> Complexity
      timer = setTimeout(() => {
        setAnimStep(2);
      }, 600);
    } else if (animStep === 2) {
      // Complexity -> to
      timer = setTimeout(() => {
        setAnimStep(3);
      }, 600);
    } else if (animStep === 3) {
      // to -> Reality (each blinks exactly once as it enters)
      timer = setTimeout(() => {
        setAnimStep(4);
      }, 600);
    } else if (animStep === 4) {
      // Full headline illuminated: hold still for exactly 3 seconds
      timer = setTimeout(() => {
        setAnimStep(0);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [animStep]);

  const words = [
    { text: 'Turn', step: 1, glowClass: 'led-glow-indigo' },
    { text: 'Complexity', step: 2, glowClass: 'led-glow-indigo' },
    { text: 'to', step: 3, glowClass: 'led-glow-cyan' },
    { text: 'Reality', step: 4, glowClass: 'led-glow-cyan font-black' },
  ];

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#131627]/95 via-[#0d0f1b]/95 to-[#0b0c14]/95 border border-white/[0.08] p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          {/* Top Pill: QUANTRIX Brand & Symbol (Remains Still / Constant) */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-indigo-500/30 shadow-lg shadow-indigo-950/50">
              <div className="relative flex items-center justify-center w-7 h-7 rounded-lg overflow-hidden border border-cyan-400/50 shadow-md shadow-cyan-500/30 shrink-0">
                <img
                  src="./assets/quantrix_symbol.jpg"
                  alt="QUANTRIX Symbol"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300 font-mono">
                QUANTRIX
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>FINANCE · TIME · DATA</span>
            </div>
          </div>

          {/* LED Word-by-Word Animated Heading: "Turn Complexity to Reality" */}
          <div className="min-h-[4.5rem] sm:min-h-[5.5rem] flex items-center">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.2] flex flex-wrap items-center gap-x-3.5 gap-y-1">
              {words.map((w) => {
                const isEnteringNow = animStep === w.step;
                const isAlreadyLit = animStep > w.step;

                return (
                  <span
                    key={`${w.text}-${animStep === 0 ? 'reset' : 'active'}`}
                    className={`inline-block transition-all duration-300 select-none ${
                      isEnteringNow
                        ? `${w.glowClass} led-single-flash`
                        : isAlreadyLit
                        ? `${w.glowClass} opacity-100`
                        : 'opacity-10 text-slate-700 blur-[1px]'
                    }`}
                  >
                    {w.text}
                  </span>
                );
              })}
            </h1>
          </div>

          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            A personal intelligence platform for understanding your finances, optimizing your time,
            and discovering insights hidden in your data. Make better decisions with the power of computation.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              onClick={() => setActiveTab('money')}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Start Money Simulator
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setActiveTab('csv')}
              icon={<FileSpreadsheet className="w-4 h-4" />}
            >
              Analyze CSV Data
            </Button>
          </div>
        </div>
      </div>

      {/* QUANTRIX Synergy Index Master Card */}
      <Card className="p-6 sm:p-7 relative overflow-hidden" glow="emerald">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          {/* Left: Score Gauge */}
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke={synergyTier.ringColor}
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (totalSynergyScore / 100) * 251.2}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                  {totalSynergyScore}
                </span>
                <span className="text-[9px] text-slate-400 font-semibold uppercase">/100</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  QUANTRIX Synergy Index
                </span>
                <Badge variant={synergyTier.badge as any} size="sm">
                  {synergyTier.label}
                </Badge>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white mt-1">
                Unified Computational Alignment
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-lg leading-relaxed">
                A synthesized health index combining your financial runway stability, daily focus schedule,
                and dataset cleanliness in real time.
              </p>
            </div>
          </div>

          {/* Right: Component Pillars Breakdown */}
          <div className="grid grid-cols-3 gap-3 w-full lg:w-auto shrink-0">
            <div className="p-3 rounded-xl bg-[#090a14] border border-white/[0.05] flex flex-col items-center text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Finance
              </span>
              <span className="text-base sm:text-lg font-bold text-indigo-400 mt-0.5">
                {financeScore}<span className="text-xs text-slate-500 font-normal">/40</span>
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">Surplus & Savings</span>
            </div>

            <div className="p-3 rounded-xl bg-[#090a14] border border-white/[0.05] flex flex-col items-center text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Time
              </span>
              <span className="text-base sm:text-lg font-bold text-cyan-400 mt-0.5">
                {timeScore}<span className="text-xs text-slate-500 font-normal">/40</span>
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">Focus Pacing</span>
            </div>

            <div className="p-3 rounded-xl bg-[#090a14] border border-white/[0.05] flex flex-col items-center text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Data
              </span>
              <span className="text-base sm:text-lg font-bold text-emerald-400 mt-0.5">
                {dataScore}<span className="text-xs text-slate-500 font-normal">/20</span>
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">Data Quality</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Live State Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Money KPI */}
        <Card className="p-5 flex items-center justify-between" glow="indigo">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Live Monthly Surplus
            </span>
            <span
              className={`text-2xl font-bold mt-1 ${
                moneyMetrics.isDeficit ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {formatCurrency(moneyMetrics.monthlySurplus, currency)}
            </span>
            <span className="text-xs text-slate-400 mt-0.5">
              Savings rate: {formatPercentage(moneyMetrics.savingsRate)}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Wallet className="w-6 h-6" />
          </div>
        </Card>

        {/* Time KPI */}
        <Card className="p-5 flex items-center justify-between" glow="cyan">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Semester Study Projection
            </span>
            <span className="text-2xl font-bold text-cyan-400 mt-1">
              {timeMetrics.semesterProjectedStudy} hrs
            </span>
            <span className="text-xs text-slate-400 mt-0.5">
              Daily deep work: {formatHours(timeMetrics.dailyStudy)}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Clock className="w-6 h-6" />
          </div>
        </Card>

        {/* Engine KPI */}
        <Card className="p-5 flex items-center justify-between" glow="violet">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Analytics Engine
            </span>
            <span className="text-2xl font-bold text-violet-400 mt-1 flex items-center gap-1.5">
              Local V8
            </span>
            <span className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              100% In-Browser Privacy
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <Cpu className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Three Primary Modules Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Interactive Modules</h2>
            <p className="text-xs text-slate-400">Select any engine to begin modeling or profiling</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Module 1: Money */}
          <Card className="p-6 flex flex-col justify-between group" glow="indigo">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                  <Coins className="w-6 h-6" />
                </div>
                <Badge variant="indigo">Module 01</Badge>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                Money Simulator
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Deterministic cash flow modeling, categorized budget allocation, 12-month projections,
                and a What-If sensitivity slider engine.
              </p>

              <div className="mt-5 space-y-2 border-t border-white/[0.06] pt-4 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Interactive Donut & Projection Curves</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Real What-If rent & food percentage shifts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Rule-based arithmetic recommendation engine</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06]">
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => setActiveTab('money')}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Launch Money Simulator
              </Button>
            </div>
          </Card>

          {/* Module 2: Time */}
          <Card className="p-6 flex flex-col justify-between group" glow="cyan">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                  <Clock className="w-6 h-6" />
                </div>
                <Badge variant="cyan">Module 02</Badge>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                Time Simulator
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Strict 24-hour balance validator, weekly study scaling, what-if trade-off matrix, and an
                algorithmic collision-free timetable generator.
              </p>

              <div className="mt-5 space-y-2 border-t border-white/[0.06] pt-4 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>24-Hour Visual Donut & Daily Timeline</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Reallocate time between leisure and deep work</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Non-overlapping timetable generator with breaks</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06]">
              <Button
                variant="outline"
                className="w-full justify-between border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10"
                onClick={() => setActiveTab('time')}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Launch Time Simulator
              </Button>
            </div>
          </Card>

          {/* Module 3: CSV */}
          <Card className="p-6 flex flex-col justify-between group" glow="violet">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400 group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <Badge variant="violet">Module 03</Badge>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors">
                CSV Data Intelligence
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Power BI-inspired tabular profiler. Detects missing values, whitespace anomalies, duplicate
                records, IQR outliers, and correlation heatmaps.
              </p>

              <div className="mt-5 space-y-2 border-t border-white/[0.06] pt-4 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />
                  <span>Searchable Data Quality Audit Table</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />
                  <span>Histograms, Scatter Plots & Correlation Matrix</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />
                  <span>Non-destructive Cleaning Studio with CSV export</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06]">
              <Button
                variant="outline"
                className="w-full justify-between border-violet-500/40 text-violet-300 hover:bg-violet-500/10"
                onClick={() => setActiveTab('csv')}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Launch CSV Intelligence
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Sample Showcase Previews (Explicitly Labeled) */}
      <div className="p-6 rounded-2xl bg-[#0b0c14]/70 border border-white/[0.06]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Engine Capabilities Preview</h3>
              <Badge variant="slate" size="sm">
                Explicit Demo Reference
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Sample calculations illustrating QUANTRIX's deterministic logic engines
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#121422] border border-white/[0.05]">
            <span className="font-semibold text-indigo-300 block mb-1">
              Sample Financial Rule Calculation
            </span>
            <p className="text-slate-400 leading-relaxed font-mono text-[11px]">
              "If Food spending is ₹16,000 (17% of outflow), a 15% reduction frees ₹2,400/mo. Compounded
              over 12 months, this yields +₹28,800."
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#121422] border border-white/[0.05]">
            <span className="font-semibold text-cyan-300 block mb-1">
              Sample Routine Reallocation Rule
            </span>
            <p className="text-slate-400 leading-relaxed font-mono text-[11px]">
              "Shifting 45 mins from leisure to study across 5 weekdays yields +3.75 hrs/week. Over a
              16-week term, this creates 60 additional deep-work hours."
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#121422] border border-white/[0.05]">
            <span className="font-semibold text-violet-300 block mb-1">
              Sample Data Quality Audit Logic
            </span>
            <p className="text-slate-400 leading-relaxed font-mono text-[11px]">
              "Cell CUST-1009 MonthlySpend contains '   ' (whitespace-only). Flagged as Medium Severity
              issue #12. Legitimate 0 values are preserved."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
