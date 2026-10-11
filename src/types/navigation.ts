export type NavTab = 'overview' | 'money' | 'time' | 'csv' | 'settings';

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  durationMs?: number;
}
