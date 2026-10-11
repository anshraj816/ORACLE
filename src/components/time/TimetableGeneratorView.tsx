import React, { useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Edit2,
  Info,
  Plus,
  RefreshCw,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { TimeInputs, TimetablePreferences, TimetableSlot } from '../../types/time';
import { ACTIVITIES, generateTimetable } from '../../utils/timeCalculations';
import { formatHours } from '../../utils/formatters';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

interface TimetableGeneratorViewProps {
  inputs: TimeInputs;
}

export const TimetableGeneratorView: React.FC<TimetableGeneratorViewProps> = ({ inputs }) => {
  const [preferences, setPreferences] = useState<TimetablePreferences>({
    preferredStudyPeriod: 'evening',
    breakIntervalMinutes: 50,
    breakDurationMinutes: 10,
    wakeUpTime: '06:30',
  });

  const [generatedSchedule, setGeneratedSchedule] = useState(() =>
    generateTimetable(inputs, preferences)
  );

  const [slots, setSlots] = useState<TimetableSlot[]>(generatedSchedule.slots);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);

  const handleRegenerate = () => {
    const res = generateTimetable(inputs, preferences);
    setGeneratedSchedule(res);
    setSlots(res.slots);
    setEditingSlotId(null);
  };

  const handleUpdateSlot = (id: string, newLabel: string, newStartTime: string, newEndTime: string) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, label: newLabel, startTime: newStartTime, endTime: newEndTime } : s))
    );
    setEditingSlotId(null);
  };

  const handleDeleteSlot = (id: string) => {
    setSlots((prev) => prev.filter((s) => s.id !== id));
  };

  const handleDownloadCsv = () => {
    const header = 'Start Time,End Time,Activity Category,Session Name,Fixed Commitment\n';
    const rows = slots
      .map((s) => `"${s.startTime}","${s.endTime}","${s.activity}","${s.label}","${s.isFixed ? 'Yes' : 'No'}"`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'oracle_daily_timetable.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="p-6" glow="violet">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] mb-6 gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Algorithmic Timetable Generator</h3>
            <p className="text-xs text-slate-400">
              Constructs non-overlapping 24-hour daily schedules around hard constraints
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownloadCsv}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export Schedule
          </Button>
          <Button
            size="sm"
            onClick={handleRegenerate}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Regenerate
          </Button>
        </div>
      </div>

      {/* Preferences Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-[#121422] border border-white/[0.06] mb-6">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
            Target Wake Time
          </label>
          <input
            type="time"
            value={preferences.wakeUpTime}
            onChange={(e) => setPreferences((p) => ({ ...p, wakeUpTime: e.target.value }))}
            className="w-full bg-[#0b0c14] border border-white/[0.08] rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
            Cognitive Break Protocol
          </label>
          <select
            value={preferences.breakIntervalMinutes}
            onChange={(e) =>
              setPreferences((p) => ({
                ...p,
                breakIntervalMinutes: Number(e.target.value) as any,
                breakDurationMinutes: Number(e.target.value) === 50 ? 10 : 15,
              }))
            }
            className="w-full bg-[#0b0c14] border border-white/[0.08] rounded-lg px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none"
          >
            <option value={50}>Pomodoro (50m Focus / 10m Rest)</option>
            <option value={90}>Ultradian Rhythm (90m Focus / 15m Rest)</option>
            <option value={120}>Extended Block (120m Focus / 30m Rest)</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
            Preferred Deep Work Period
          </label>
          <select
            value={preferences.preferredStudyPeriod}
            onChange={(e) =>
              setPreferences((p) => ({
                ...p,
                preferredStudyPeriod: e.target.value as any,
              }))
            }
            className="w-full bg-[#0b0c14] border border-white/[0.08] rounded-lg px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none"
          >
            <option value="morning">Morning (Early Focus)</option>
            <option value="evening">Evening (Post-College)</option>
            <option value="night">Night (Low Distraction)</option>
          </select>
        </div>
      </div>

      {/* Feasibility Alert / Explanation */}
      <div
        className={`p-4 rounded-xl border mb-6 text-xs leading-relaxed flex items-start gap-3 ${
          generatedSchedule.isFeasible
            ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-200'
            : 'bg-amber-500/10 border-amber-500/25 text-amber-200'
        }`}
      >
        {generatedSchedule.isFeasible ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          <span className="font-semibold block mb-0.5">
            {generatedSchedule.isFeasible
              ? 'Schedule Validated & Feasible'
              : 'Constraint Bottleneck Detected'}
          </span>
          <p className="opacity-90">{generatedSchedule.explanation}</p>
        </div>
      </div>

      {/* Timetable Slot List */}
      <div className="space-y-2.5">
        {slots.map((slot) => {
          const actConfig = ACTIVITIES.find((a) => a.id === slot.activity);
          const color = actConfig ? actConfig.color : '#64748b';
          const isEditing = editingSlotId === slot.id;

          return (
            <div
              key={slot.id}
              className="flex items-center justify-between p-3.5 rounded-xl bg-[#121422]/70 border border-white/[0.04] hover:border-white/[0.1] transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-3 h-8 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />

                <div className="flex items-center gap-2 font-mono text-xs text-slate-300 shrink-0">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {slot.startTime} – {slot.endTime}
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-100 truncate">
                      {slot.label}
                    </span>
                    {slot.isFixed && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 font-mono">
                        Fixed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge
                  variant={
                    slot.activity === 'study'
                      ? 'emerald'
                      : slot.activity === 'sleep'
                      ? 'indigo'
                      : slot.activity === 'college_work'
                      ? 'cyan'
                      : 'slate'
                  }
                  size="sm"
                >
                  {actConfig?.label.split('/')[0].trim() || slot.activity}
                </Badge>

                {!slot.isFixed && (
                  <button
                    onClick={() => handleDeleteSlot(slot.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                    title="Remove slot"
                    aria-label="Remove slot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mandatory Non-Medical Advice Disclaimer */}
      <div className="mt-6 p-3.5 rounded-xl bg-[#090a10] border border-white/[0.05] flex items-start gap-2.5 text-[11px] text-slate-400 leading-relaxed">
        <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <span>
          <strong className="text-slate-300">Methodology & Health Notice:</strong> This schedule is
          generated using deterministic algorithmic constraint satisfaction. It is a personal
          planning aid and is not a medically validated clinical sleep or health recommendation.
          Academic performance depends on mastery, comprehension, and consistent practice beyond
          raw scheduled duration.
        </span>
      </div>
    </Card>
  );
};
