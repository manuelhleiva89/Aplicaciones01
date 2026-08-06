import { AppSettings } from '../types';

export function formatMoney(
  amount: number,
  settings: AppSettings = { currencySymbol: '$', currencyCode: 'USD', decimals: 2, expenseCategories: [], incomeCategories: [] }
): string {
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);
  const formatted = absVal.toLocaleString('en-US', {
    minimumFractionDigits: settings.decimals,
    maximumFractionDigits: settings.decimals,
  });
  return `${isNegative ? '-' : ''}${settings.currencySymbol}${formatted}`;
}

export function calculateMonthsBetween(startDateStr: string, endDateStr: string): number {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;

  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  return Math.max(1, months);
}
