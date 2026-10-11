import React, { useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Moon,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TimeInputs } from '../../types/time';
import { calculateTimeMetrics, generateTimeInsights } from '../../utils/timeCalculations';
import { formatHours, formatPercentage } from '../../utils/formatters';
import { TIME_PRESETS } from '../../utils/sampleData';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { NumberInput } from '../common/NumberInput';
import { TimeDonutChart } from './TimeDonutChart';
import { TimelineVisualizer } from './TimelineVisualizer';
import { TimetableGeneratorView } from './TimetableGeneratorView';
import { TimeInsightsCard } from './TimeInsightsCard';
import { WhatIfTimeSimulator } from './WhatIfTimeSimulator';

export const TimeSimulator: React.FC = () => {
  const { timeInputs, setTimeInputs, addToast } = useApp();

  const handleApplyPreset = (key: keyof typeof TIME_PRESETS) => {
    const preset = TIME_PRESETS[key];
    setTimeInputs(preset.inputs);
    addToast({
      type: 'success',
      title: `Loaded ${preset.label}`,
      message: preset.description,
    });
  };

  const metrics = calculateTimeMetrics(timeInputs);
  const insights = generateTimeInsights(timeInputs, metrics);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      {/* Top Presets Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0f111a] border border-white/[0.08]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Routine Presets:</span>
          <div className="flex flex-wrap gap-2">
            {Object.entries(TIME_PRESETS).map(([k, p]) => (
              <button
                key={k}
                onClick={() => handleApplyPreset(k as any)}
                className="text-xs px-3 py-1.5 rounded-lg bg-[#181b2a] hover:bg-[#23273e] text-slate-200 border border-white/[0.06] transition-colors cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {metrics.isOverAllocated && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>Over-Allocated: Day exceeds 24h by +{metrics.overAllocatedHours} hrs</span>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Allocated */}
        <Card className="p-5" glow={metrics.isOverAllocated ? 'none' : 'cyan'}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total 24h Daily Budget
            </span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div
            className={`text-2xl font-bold font-mono mt-2 ${
              metrics.isOverAllocated ? 'text-rose-400' : 'text-slate-100'
            }`}
          >
            {metrics.totalAllocated} / 24.0h
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
            <span>Remaining Buffer:</span>
            <span
              className={`font-semibold ${
                metrics.isOverAllocated ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {metrics.isOverAllocated ? `-${metrics.overAllocatedHours}h` : `${metrics.unallocated}h`}
            </span>
          </div>
        </Card>

        {/* Daily & Weekly Study Hours */}
        <Card className="p-5" glow="emerald">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Daily Deep Work Focus
            </span>
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
            {formatHours(metrics.dailyStudy)} / day
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
            <span>Weekly Study ({timeInputs.selectedDaysPerWeek} days):</span>
            <span className="font-semibold text-slate-200">{metrics.weeklyStudy} hrs</span>
          </div>
        </Card>

        {/* Semester Projection */}
        <Card className="p-5" glow="indigo">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Semester Projection ({timeInputs.semesterWeeks} wks)
            </span>
            <Calendar className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-400 mt-2">
            {metrics.semesterProjectedStudy} Total hrs
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
            <span>Study Target:</span>
            <span className="font-semibold text-slate-200">
              {metrics.studyGoalMet ? 'Target Satisfied' : `Short by ${metrics.studyGoalShortfallDaily}h`}
            </span>
          </div>
        </Card>

        {/* Sleep Quality */}
        <Card className="p-5" glow="violet">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Restorative Sleep
            </span>
            <Moon className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-2">
            {formatHours(timeInputs.sleep)}
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
            <span>Rating:</span>
            <span
              className={`font-semibold capitalize ${
                metrics.sleepQualityRating === 'optimal'
                  ? 'text-emerald-400'
                  : 'text-amber-400'
              }`}
            >
              {metrics.sleepQualityRating.replace('_', ' ')}
            </span>
          </div>
        </Card>
      </div>

      {/* Inputs & Visuals Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs (7 cols) */}
        <Card className="lg:col-span-7 p-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">Daily Routine Constraints</h3>
            </div>
            <span className="text-xs text-slate-400">Decimal Hours (0.5 = 30m)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NumberInput
              label="Sleep Duration (Daily)"
              value={timeInputs.sleep}
              onChange={(val) => setTimeInputs((prev) => ({ ...prev, sleep: val }))}
              suffix="hrs"
              min={3}
              max={14}
              step={0.5}
              helperText="Recommended: 7.0 - 8.5 hours"
            />

            <NumberInput
              label="College Lectures / Work Shift"
              value={timeInputs.collegeWork}
              onChange={(val) => setTimeInputs((prev) => ({ ...prev, collegeWork: val }))}
              suffix="hrs"
              min={0}
              max={16}
              step={0.5}
              helperText="Fixed academic or employment commitments"
            />

            <NumberInput
              label="Transit / Commute Time"
              value={timeInputs.travel}
              onChange={(val) => setTimeInputs((prev) => ({ ...prev, travel: val }))}
              suffix="hrs"
              min={0}
              max={6}
              step={0.25}
              helperText="Roundtrip travel between home and campus/office"
            />

            <NumberInput
              label="Study & Deep Work (Daily)"
              value={timeInputs.study}
              onChange={(val) => setTimeInputs((prev) => ({ ...prev, study: val }))}
              suffix="hrs"
              min={0}
              max={12}
              step={0.5}
              helperText="Dedicated self-study, assignments, revision"
            />

            <NumberInput
              label="Entertainment & Leisure"
              value={timeInputs.entertainment}
              onChange={(val) => setTimeInputs((prev) => ({ ...prev, entertainment: val }))}
              suffix="hrs"
              min={0}
              max={10}
              step={0.5}
              helperText="Gaming, streaming, social media, hobbies"
            />

            <NumberInput
              label="Meals & Personal Hygiene"
              value={timeInputs.mealsPersonal}
              onChange={(val) => setTimeInputs((prev) => ({ ...prev, mealsPersonal: val }))}
              suffix="hrs"
              min={0.5}
              max={6}
              step={0.25}
              helperText="Breakfast, lunch, dinner, exercise, routines"
            />

            <NumberInput
              label="Other Unscheduled Tasks"
              value={timeInputs.other}
              onChange={(val) => setTimeInputs((prev) => ({ ...prev, other: val }))}
              suffix="hrs"
              min={0}
              max={6}
              step={0.5}
              helperText="Errands, chores, family responsibilities"
            />

            <NumberInput
              label="Preferred Daily Study Target"
              value={timeInputs.studyTargetDaily}
              onChange={(val) => setTimeInputs((prev) => ({ ...prev, studyTargetDaily: val }))}
              suffix="hrs"
              min={0}
              max={12}
              step={0.5}
              helperText="Your aspirational goal for deep work"
            />

            <NumberInput
              label="Semester Duration"
              value={timeInputs.semesterWeeks}
              onChange={(val) => setTimeInputs((prev) => ({ ...prev, semesterWeeks: val }))}
              suffix="wks"
              min={4}
              max={30}
              step={1}
              helperText="Standard term: 16 weeks"
            />

            <NumberInput
              label="Active Study Days per Week"
              value={timeInputs.selectedDaysPerWeek}
              onChange={(val) => setTimeInputs((prev) => ({ ...prev, selectedDaysPerWeek: val }))}
              suffix="days"
              min={1}
              max={7}
              step={1}
              helperText="Weekdays (5) or full week (7)"
            />
          </div>
        </Card>

        {/* Right Donut & Timeline (5 cols) */}
        <Card className="lg:col-span-5 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-4 border-b border-white/[0.08] mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">Daily 24-Hour Balance</h3>
            </div>

            <TimeDonutChart inputs={timeInputs} metrics={metrics} />

            <div className="mt-6 pt-4 border-t border-white/[0.06]">
              <TimelineVisualizer inputs={timeInputs} />
            </div>
          </div>
        </Card>
      </div>

      {/* What-If Time Reallocation Engine */}
      <WhatIfTimeSimulator baseInputs={timeInputs} baseMetrics={metrics} />

      {/* Algorithmic Timetable Generator */}
      <TimetableGeneratorView inputs={timeInputs} />

      {/* Rule-Based Routine Insights */}
      <TimeInsightsCard insights={insights} />
    </div>
  );
};
