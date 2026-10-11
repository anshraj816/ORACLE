export type ActivityCategory =
  | 'sleep'
  | 'college_work'
  | 'travel'
  | 'study'
  | 'entertainment'
  | 'meals_personal'
  | 'other';

export interface ActivityConfig {
  id: ActivityCategory;
  label: string;
  color: string;
  defaultHours: number;
  isFixed: boolean;
  minRecommended?: number;
  maxRecommended?: number;
}

export interface TimeInputs {
  sleep: number;
  collegeWork: number;
  travel: number;
  study: number;
  entertainment: number;
  mealsPersonal: number;
  other: number;
  studyTargetDaily: number;
  semesterWeeks: number;
  selectedDaysPerWeek: number; // e.g. 5 or 7
}

export interface TimeCalculations {
  totalAllocated: number;
  unallocated: number;
  isOverAllocated: boolean;
  overAllocatedHours: number;
  dailyStudy: number;
  weeklyStudy: number;
  semesterProjectedStudy: number;
  studyGoalShortfallDaily: number;
  studyGoalMet: boolean;
  activityPercentages: Record<ActivityCategory, number>;
  sleepQualityRating: 'optimal' | 'suboptimal_low' | 'suboptimal_high';
}

export interface WhatIfTimeState {
  sourceActivity: ActivityCategory;
  targetActivity: ActivityCategory;
  shiftMinutes: number; // e.g. 30, 45, 60
  applyDaysCount: number; // 1 - 7
}

export interface TimetableSlot {
  id: string;
  startTime: string; // "07:00"
  endTime: string;   // "08:30"
  activity: ActivityCategory;
  label: string;
  isFixed: boolean;
}

export interface TimetablePreferences {
  preferredStudyPeriod: 'morning' | 'afternoon' | 'evening' | 'night';
  breakIntervalMinutes: 50 | 90 | 120;
  breakDurationMinutes: 10 | 15 | 30;
  wakeUpTime: string; // "06:30"
}

export interface TimeInsight {
  id: string;
  type: 'critical' | 'warning' | 'positive' | 'opportunity';
  title: string;
  description: string;
  calculationExplanation: string;
  weeklyHoursEffect: number;
  semesterHoursEffect: number;
}
