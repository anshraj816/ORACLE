import React, { useState } from 'react';
import { ArrowRight, RotateCcw, Shuffle, Sparkles, TrendingUp } from 'lucide-react';
import { ActivityCategory, TimeCalculations, TimeInputs, WhatIfTimeState } from '../../types/time';
import { ACTIVITIES, applyTimeWhatIf } from '../../utils/timeCalculations';
import { formatHours } from '../../utils/formatters';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Slider } from '../common/Slider';

interface WhatIfTimeSimulatorProps {
  baseInputs: TimeInputs;
  baseMetrics: TimeCalculations;
  onApplyToSchedule?: (newInputs: TimeInputs) => void;
}

export const WhatIfTimeSimulator: React.FC<WhatIfTimeSimulatorProps> = ({
  baseInputs,
  baseMetrics,
  onApplyToSchedule,
}) => {
  const [whatIf, setWhatIf] = useState<WhatIfTimeState>({
    sourceActivity: 'entertainment',
    targetActivity: 'study',
    shiftMinutes: 45,
    applyDaysCount: baseInputs.selectedDaysPerWeek || 5,
  });

  const {
    simulatedInputs,
    simulatedMetrics,
    additionalWeeklyHours,
    additionalSemesterHours,
  } = applyTimeWhatIf(baseInputs, whatIf);

  const resetWhatIf = () => {
    setWhatIf({
      sourceActivity: 'entertainment',
      targetActivity: 'study',
      shiftMinutes: 0,
      applyDaysCount: baseInputs.selectedDaysPerWeek || 5,
    });
  };

  return (
    <Card className="p-6" glow="cyan">
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Shuffle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">What-If Time Reallocation Engine</h3>
            <p className="text-xs text-slate-400">
              Shift hours between activities and observe weekly and semester compounding
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={resetWhatIf}
          icon={<RotateCcw className="w-3.5 h-3.5" />}
          className="text-xs text-slate-400 hover:text-white"
        >
          Reset Reallocation
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Reallocate From */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Reallocate From (Source)
              </label>
              <select
                value={whatIf.sourceActivity}
                onChange={(e) =>
                  setWhatIf((prev) => ({
                    ...prev,
                    sourceActivity: e.target.value as ActivityCategory,
                  }))
                }
                className="bg-[#121422] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-200 focus:outline-none focus:border-cyan-500/50"
              >
                {ACTIVITIES.filter((a) => a.id !== whatIf.targetActivity).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Reallocate To */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Reallocate Into (Target)
              </label>
              <select
                value={whatIf.targetActivity}
                onChange={(e) =>
                  setWhatIf((prev) => ({
                    ...prev,
                    targetActivity: e.target.value as ActivityCategory,
                  }))
                }
                className="bg-[#121422] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-200 focus:outline-none focus:border-cyan-500/50"
              >
                {ACTIVITIES.filter((a) => a.id !== whatIf.sourceActivity).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Slider
            label="Time Shift Amount"
            min={0}
            max={120}
            step={15}
            value={whatIf.shiftMinutes}
            onChange={(val) => setWhatIf((prev) => ({ ...prev, shiftMinutes: val }))}
            displayValue={`${whatIf.shiftMinutes} minutes / day`}
            color="cyan"
          />

          <Slider
            label="Active Days per Week"
            min={1}
            max={7}
            step={1}
            value={whatIf.applyDaysCount}
            onChange={(val) => setWhatIf((prev) => ({ ...prev, applyDaysCount: val }))}
            displayValue={`${whatIf.applyDaysCount} days / week`}
            color="indigo"
          />
        </div>

        {/* Compounding Impact Display (5 cols) */}
        <div className="lg:col-span-5 bg-[#121422] border border-white/[0.06] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 block mb-4">
              Compounded Study Hours Gain
            </span>

            <div className="space-y-4 pb-4 border-b border-white/[0.06]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Weekly Additional Study:</span>
                <span className="text-lg font-bold font-mono text-emerald-400">
                  +{additionalWeeklyHours} hrs / wk
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {baseInputs.semesterWeeks}-Week Semester Gain:
                </span>
                <span className="text-2xl font-extrabold font-mono text-cyan-300">
                  +{additionalSemesterHours} hrs
                </span>
              </div>
            </div>

            <div className="pt-4 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Baseline Semester Study:</span>
                <span className="font-mono text-slate-300">
                  {baseMetrics.semesterProjectedStudy} hrs
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Simulated Semester Total:</span>
                <span className="font-mono font-bold text-white">
                  {simulatedMetrics.semesterProjectedStudy} hrs
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono">
              Formula: ({whatIf.shiftMinutes}m ÷ 60) × {whatIf.applyDaysCount}d × {baseInputs.semesterWeeks}wks
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
