import {
  ActivityCategory,
  ActivityConfig,
  TimeCalculations,
  TimeInputs,
  TimeInsight,
  TimetablePreferences,
  TimetableSlot,
  WhatIfTimeState,
} from '../types/time';
import { formatHours } from './formatters';

export const ACTIVITIES: ActivityConfig[] = [
  { id: 'sleep', label: 'Sleep & Rest', color: '#6366f1', defaultHours: 7.5, isFixed: true, minRecommended: 7, maxRecommended: 9 },
  { id: 'college_work', label: 'College / Work', color: '#38bdf8', defaultHours: 6.0, isFixed: true },
  { id: 'travel', label: 'Commute / Travel', color: '#a855f7', defaultHours: 1.5, isFixed: true },
  { id: 'study', label: 'Study & Deep Work', color: '#10b981', defaultHours: 3.0, isFixed: false },
  { id: 'entertainment', label: 'Entertainment & Leisure', color: '#f43f5e', defaultHours: 2.0, isFixed: false },
  { id: 'meals_personal', label: 'Meals & Personal Care', color: '#f59e0b', defaultHours: 2.0, isFixed: true, minRecommended: 1.5 },
  { id: 'other', label: 'Other Commitments', color: '#64748b', defaultHours: 1.0, isFixed: false },
];

export function calculateTimeMetrics(inputs: TimeInputs): TimeCalculations {
  const sleep = Math.max(0, inputs.sleep || 0);
  const collegeWork = Math.max(0, inputs.collegeWork || 0);
  const travel = Math.max(0, inputs.travel || 0);
  const study = Math.max(0, inputs.study || 0);
  const entertainment = Math.max(0, inputs.entertainment || 0);
  const mealsPersonal = Math.max(0, inputs.mealsPersonal || 0);
  const other = Math.max(0, inputs.other || 0);

  const totalAllocated = Number((sleep + collegeWork + travel + study + entertainment + mealsPersonal + other).toFixed(2));
  const unallocated = Number((24 - totalAllocated).toFixed(2));
  const isOverAllocated = totalAllocated > 24;
  const overAllocatedHours = isOverAllocated ? Number((totalAllocated - 24).toFixed(2)) : 0;

  const daysCount = Math.max(1, Math.min(7, inputs.selectedDaysPerWeek || 5));
  const semesterWeeks = Math.max(1, inputs.semesterWeeks || 16);

  const dailyStudy = study;
  const weeklyStudy = Number((study * daysCount).toFixed(1));
  const semesterProjectedStudy = Math.round(weeklyStudy * semesterWeeks);

  const studyTargetDaily = inputs.studyTargetDaily || 0;
  const studyGoalShortfallDaily = Number(Math.max(0, studyTargetDaily - dailyStudy).toFixed(2));
  const studyGoalMet = dailyStudy >= studyTargetDaily;

  const activityPercentages: Record<ActivityCategory, number> = {
    sleep: totalAllocated > 0 ? Number(((sleep / 24) * 100).toFixed(1)) : 0,
    college_work: totalAllocated > 0 ? Number(((collegeWork / 24) * 100).toFixed(1)) : 0,
    travel: totalAllocated > 0 ? Number(((travel / 24) * 100).toFixed(1)) : 0,
    study: totalAllocated > 0 ? Number(((study / 24) * 100).toFixed(1)) : 0,
    entertainment: totalAllocated > 0 ? Number(((entertainment / 24) * 100).toFixed(1)) : 0,
    meals_personal: totalAllocated > 0 ? Number(((mealsPersonal / 24) * 100).toFixed(1)) : 0,
    other: totalAllocated > 0 ? Number(((other / 24) * 100).toFixed(1)) : 0,
  };

  let sleepQualityRating: 'optimal' | 'suboptimal_low' | 'suboptimal_high' = 'optimal';
  if (sleep < 6.5) sleepQualityRating = 'suboptimal_low';
  else if (sleep > 9.5) sleepQualityRating = 'suboptimal_high';

  return {
    totalAllocated,
    unallocated: Math.max(0, unallocated),
    isOverAllocated,
    overAllocatedHours,
    dailyStudy,
    weeklyStudy,
    semesterProjectedStudy,
    studyGoalShortfallDaily,
    studyGoalMet,
    activityPercentages,
    sleepQualityRating,
  };
}

export function applyTimeWhatIf(
  baseInputs: TimeInputs,
  whatIf: WhatIfTimeState
): {
  simulatedInputs: TimeInputs;
  baseMetrics: TimeCalculations;
  simulatedMetrics: TimeCalculations;
  additionalWeeklyHours: number;
  additionalSemesterHours: number;
} {
  const shiftHours = whatIf.shiftMinutes / 60;
  const simulatedInputs = { ...baseInputs };

  // Reallocate
  const currentSource = (simulatedInputs as any)[whatIf.sourceActivity === 'college_work' ? 'collegeWork' : whatIf.sourceActivity === 'meals_personal' ? 'mealsPersonal' : whatIf.sourceActivity] || 0;
  const actualShift = Math.min(currentSource, shiftHours);

  const sourceKey = whatIf.sourceActivity === 'college_work' ? 'collegeWork' : whatIf.sourceActivity === 'meals_personal' ? 'mealsPersonal' : whatIf.sourceActivity;
  const targetKey = whatIf.targetActivity === 'college_work' ? 'collegeWork' : whatIf.targetActivity === 'meals_personal' ? 'mealsPersonal' : whatIf.targetActivity;

  (simulatedInputs as any)[sourceKey] = Math.max(0, Number((currentSource - actualShift).toFixed(2)));
  (simulatedInputs as any)[targetKey] = Number(((simulatedInputs as any)[targetKey] + actualShift).toFixed(2));

  const baseMetrics = calculateTimeMetrics(baseInputs);
  const simulatedMetrics = calculateTimeMetrics(simulatedInputs);

  const additionalDailyStudy = Math.max(0, simulatedMetrics.dailyStudy - baseMetrics.dailyStudy);
  const additionalWeeklyHours = Number((additionalDailyStudy * whatIf.applyDaysCount).toFixed(1));
  const additionalSemesterHours = Math.round(additionalWeeklyHours * baseInputs.semesterWeeks);

  return {
    simulatedInputs,
    baseMetrics,
    simulatedMetrics,
    additionalWeeklyHours,
    additionalSemesterHours,
  };
}

export function generateTimetable(
  inputs: TimeInputs,
  prefs: TimetablePreferences
): {
  slots: TimetableSlot[];
  isFeasible: boolean;
  unfittedStudyMinutes: number;
  explanation: string;
} {
  // Parse wake-up time (e.g. "06:30")
  const [wakeH, wakeM] = prefs.wakeUpTime.split(':').map(Number);
  const wakeTotalMin = (wakeH || 6) * 60 + (wakeM || 30);

  const slots: TimetableSlot[] = [];
  let currentMin = wakeTotalMin;

  const helperMinToTime = (totalMin: number): string => {
    const wrapped = ((totalMin % 1440) + 1440) % 1440;
    const h = Math.floor(wrapped / 60);
    const m = wrapped % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  // 1. Morning Routine & Breakfast
  const morningCareMin = Math.round(Math.min(inputs.mealsPersonal * 60 * 0.35, 60));
  if (morningCareMin > 0) {
    slots.push({
      id: 'slot-morning',
      startTime: helperMinToTime(currentMin),
      endTime: helperMinToTime(currentMin + morningCareMin),
      activity: 'meals_personal',
      label: 'Morning Routine & Breakfast',
      isFixed: true,
    });
    currentMin += morningCareMin;
  }

  // 2. Travel to College / Work
  const travelHalfMin = Math.round((inputs.travel * 60) / 2);
  if (travelHalfMin > 0) {
    slots.push({
      id: 'slot-travel-morning',
      startTime: helperMinToTime(currentMin),
      endTime: helperMinToTime(currentMin + travelHalfMin),
      activity: 'travel',
      label: 'Commute / Travel',
      isFixed: true,
    });
    currentMin += travelHalfMin;
  }

  // 3. College / Work Block
  const workMin = Math.round(inputs.collegeWork * 60);
  if (workMin > 0) {
    slots.push({
      id: 'slot-work',
      startTime: helperMinToTime(currentMin),
      endTime: helperMinToTime(currentMin + workMin),
      activity: 'college_work',
      label: 'College Lectures / Work Block',
      isFixed: true,
    });
    currentMin += workMin;
  }

  // 4. Return Commute
  if (travelHalfMin > 0) {
    slots.push({
      id: 'slot-travel-evening',
      startTime: helperMinToTime(currentMin),
      endTime: helperMinToTime(currentMin + travelHalfMin),
      activity: 'travel',
      label: 'Return Commute',
      isFixed: true,
    });
    currentMin += travelHalfMin;
  }

  // 5. Evening Decompression / Lunch or Dinner
  const dinnerMin = Math.round(Math.min(inputs.mealsPersonal * 60 * 0.45, 60));
  if (dinnerMin > 0) {
    slots.push({
      id: 'slot-dinner',
      startTime: helperMinToTime(currentMin),
      endTime: helperMinToTime(currentMin + dinnerMin),
      activity: 'meals_personal',
      label: 'Dinner & Personal Reset',
      isFixed: true,
    });
    currentMin += dinnerMin;
  }

  // Calculate remaining waking window before sleep
  const sleepMin = Math.round(inputs.sleep * 60);
  const bedTimeMin = (wakeTotalMin + 1440 - sleepMin) % 1440;
  
  // Available minutes for study and entertainment
  const remainingWindowMin = ((bedTimeMin - currentMin + 1440) % 1440);
  const neededStudyMin = Math.round(inputs.study * 60);
  const neededEntMin = Math.round(inputs.entertainment * 60);

  let unfittedStudyMinutes = 0;
  let isFeasible = true;
  let explanation = '';

  if (remainingWindowMin < neededStudyMin) {
    isFeasible = false;
    unfittedStudyMinutes = neededStudyMin - remainingWindowMin;
    explanation = `Your schedule constraints (Fixed College/Work: ${inputs.collegeWork}h, Commute: ${inputs.travel}h, Sleep: ${inputs.sleep}h) leave only ${formatHours(remainingWindowMin / 60)} in the active evening window, which cannot accommodate ${formatHours(inputs.study)} of study. Consider reducing commute friction or adjusting fixed commitments.`;
    
    // Fit what we can
    if (remainingWindowMin > 30) {
      slots.push({
        id: 'slot-study-1',
        startTime: helperMinToTime(currentMin),
        endTime: helperMinToTime(currentMin + remainingWindowMin),
        activity: 'study',
        label: `Deep Work Session (Capped: ${formatHours(remainingWindowMin / 60)})`,
        isFixed: false,
      });
      currentMin += remainingWindowMin;
    }
  } else {
    // Schedule study in focused blocks with break intervals
    const blockDuration = Math.min(neededStudyMin, prefs.breakIntervalMinutes);
    slots.push({
      id: 'slot-study-primary',
      startTime: helperMinToTime(currentMin),
      endTime: helperMinToTime(currentMin + blockDuration),
      activity: 'study',
      label: `Deep Work Block (${blockDuration}m)`,
      isFixed: false,
    });
    currentMin += blockDuration;

    const remainingStudy = neededStudyMin - blockDuration;
    if (remainingStudy > 0) {
      // Add restorative break
      slots.push({
        id: 'slot-study-break',
        startTime: helperMinToTime(currentMin),
        endTime: helperMinToTime(currentMin + prefs.breakDurationMinutes),
        activity: 'other',
        label: `Cognitive Rest Break (${prefs.breakDurationMinutes}m)`,
        isFixed: false,
      });
      currentMin += prefs.breakDurationMinutes;

      slots.push({
        id: 'slot-study-secondary',
        startTime: helperMinToTime(currentMin),
        endTime: helperMinToTime(currentMin + remainingStudy),
        activity: 'study',
        label: `Focused Study Block 2 (${remainingStudy}m)`,
        isFixed: false,
      });
      currentMin += remainingStudy;
    }

    // Schedule entertainment / wind-down
    const actualEntMin = Math.min(neededEntMin, ((bedTimeMin - currentMin + 1440) % 1440));
    if (actualEntMin > 0) {
      slots.push({
        id: 'slot-entertainment',
        startTime: helperMinToTime(currentMin),
        endTime: helperMinToTime(currentMin + actualEntMin),
        activity: 'entertainment',
        label: 'Wind Down / Hobbies / Leisure',
        isFixed: false,
      });
      currentMin += actualEntMin;
    }

    explanation = `Schedule optimized successfully. Dedicated study blocks (${formatHours(inputs.study)}) fit seamlessly into your evening routine with scheduled cognitive breaks, leaving ${formatHours(inputs.entertainment)} for evening recovery.`;
  }

  // 6. Sleep Block
  slots.push({
    id: 'slot-sleep',
    startTime: helperMinToTime(bedTimeMin),
    endTime: helperMinToTime(wakeTotalMin),
    activity: 'sleep',
    label: `Sleep Cycle (${inputs.sleep} hrs)`,
    isFixed: true,
  });

  return {
    slots,
    isFeasible,
    unfittedStudyMinutes,
    explanation,
  };
}

export function generateTimeInsights(inputs: TimeInputs, metrics: TimeCalculations): TimeInsight[] {
  const insights: TimeInsight[] = [];

  // 1. Over-allocation check
  if (metrics.isOverAllocated) {
    insights.push({
      id: 'overallocation-error',
      type: 'critical',
      title: `Schedule Over-Allocated by ${metrics.overAllocatedHours} Hours`,
      description: `Your activities sum to ${metrics.totalAllocated} hours in a 24-hour day. A schedule exceeding 24 hours is mathematically impossible and will cause sleep or study debt.`,
      calculationExplanation: `Sum of all inputs = ${metrics.totalAllocated}h. 24.00h - ${metrics.totalAllocated}h = -${metrics.overAllocatedHours}h over capacity.`,
      weeklyHoursEffect: -(metrics.overAllocatedHours * (inputs.selectedDaysPerWeek || 5)),
      semesterHoursEffect: -(metrics.overAllocatedHours * (inputs.selectedDaysPerWeek || 5) * (inputs.semesterWeeks || 16)),
    });
  }

  // 2. Sleep duration evaluation
  if (inputs.sleep < 6.5) {
    insights.push({
      id: 'low-sleep-risk',
      type: 'warning',
      title: `Chronic Sleep Deficit Risk (${inputs.sleep}h/night)`,
      description: `Sleep duration is under the standard 7-8 hour regenerative window. Cognitive retention and memory consolidation decline significantly under sustained sleep deprivation.`,
      calculationExplanation: `Target: 7.5h. Current: ${inputs.sleep}h. Daily sleep shortfall: ${(7.5 - inputs.sleep).toFixed(1)}h/day = ${((7.5 - inputs.sleep) * 7).toFixed(1)}h sleep debt per week.`,
      weeklyHoursEffect: 0,
      semesterHoursEffect: 0,
    });
  } else if (inputs.sleep >= 7 && inputs.sleep <= 8.5) {
    insights.push({
      id: 'optimal-sleep',
      type: 'positive',
      title: `Optimal Rest Schedule (${inputs.sleep}h)`,
      description: `Your sleep budget supports sustained mental endurance and memory consolidation without encroaching on waking hours.`,
      calculationExplanation: `Maintains a healthy ${(inputs.sleep / 24 * 100).toFixed(1)}% daily restorative ratio.`,
      weeklyHoursEffect: 0,
      semesterHoursEffect: 0,
    });
  }

  // 3. Study target progress
  if (metrics.studyGoalShortfallDaily > 0) {
    const weeklyShortfall = metrics.studyGoalShortfallDaily * inputs.selectedDaysPerWeek;
    const semesterShortfall = Math.round(weeklyShortfall * inputs.semesterWeeks);
    insights.push({
      id: 'study-shortfall',
      type: 'opportunity',
      title: `Study Target Shortfall: ${metrics.studyGoalShortfallDaily}h/day`,
      description: `Your daily target is ${inputs.studyTargetDaily}h, but current schedule provides ${inputs.study}h. This leaves a deficit of ${weeklyShortfall} hours weekly (${semesterShortfall} hours across the ${inputs.semesterWeeks}-week semester).`,
      calculationExplanation: `Daily Target (${inputs.studyTargetDaily}h) - Current (${inputs.study}h) = ${metrics.studyGoalShortfallDaily}h/day × ${inputs.selectedDaysPerWeek} days = ${weeklyShortfall}h/wk. Over ${inputs.semesterWeeks} wks = ${semesterShortfall}h.`,
      weeklyHoursEffect: -weeklyShortfall,
      semesterHoursEffect: -semesterShortfall,
    });
  } else {
    insights.push({
      id: 'study-target-hit',
      type: 'positive',
      title: `Study Goal Satisfied: ${metrics.dailyStudy}h/day`,
      description: `You are on pace to complete ${metrics.semesterProjectedStudy} total deep-work hours over your ${inputs.semesterWeeks}-week semester.`,
      calculationExplanation: `${inputs.study}h/day × ${inputs.selectedDaysPerWeek} days/wk = ${metrics.weeklyStudy}h/wk × ${inputs.semesterWeeks} wks = ${metrics.semesterProjectedStudy} total hours.`,
      weeklyHoursEffect: metrics.weeklyStudy,
      semesterHoursEffect: metrics.semesterProjectedStudy,
    });
  }

  // 4. Commute friction check
  if (inputs.travel >= 2.5) {
    insights.push({
      id: 'commute-drain',
      type: 'warning',
      title: 'High Transit Friction (≥2.5 Hours)',
      description: `Commute consumes ${inputs.travel} hours daily (${(inputs.travel * inputs.selectedDaysPerWeek).toFixed(1)}h/week). Utilizing 30-40% of transit time for passive review or audio lectures can recover study capacity.`,
      calculationExplanation: `${inputs.travel}h/day × ${inputs.selectedDaysPerWeek} days = ${(inputs.travel * inputs.selectedDaysPerWeek).toFixed(1)} hours in transit each week.`,
      weeklyHoursEffect: inputs.travel * inputs.selectedDaysPerWeek,
      semesterHoursEffect: inputs.travel * inputs.selectedDaysPerWeek * inputs.semesterWeeks,
    });
  }

  return insights;
}
