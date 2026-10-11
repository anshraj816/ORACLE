import { CurrencyCode, CurrencyConfig } from '../types/money';

export const CURRENCY_CONFIGS: Record<CurrencyCode, CurrencyConfig> = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee (INR)', rateToInr: 1 },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar (USD)', rateToInr: 86.5 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro (EUR)', rateToInr: 94.2 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound (GBP)', rateToInr: 110.8 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen (JPY)', rateToInr: 0.58 },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CAD)', rateToInr: 63.5 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (AUD)', rateToInr: 56.4 },
};

export function formatCurrency(amount: number, currency: CurrencyCode = 'INR'): string {
  const config = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.INR;
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  let formatted = '';
  if (currency === 'INR') {
    // Indian numbering format (lakhs / crores)
    formatted = absAmount.toLocaleString('en-IN', {
      maximumFractionDigits: 0,
    });
  } else {
    formatted = absAmount.toLocaleString('en-US', {
      maximumFractionDigits: 0,
    });
  }

  return `${isNegative ? '-' : ''}${config.symbol}${formatted}`;
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export function decimalToHoursMinutes(decimalHours: number): { hours: number; minutes: number } {
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  return { hours, minutes };
}

export function hoursMinutesToDecimal(hours: number, minutes: number): number {
  return Number((hours + minutes / 60).toFixed(2));
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
