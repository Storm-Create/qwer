/**
 * Business Empire: Ultimate
 * Unified Financial, Numerical & Text Formatting Utilities
 */

export interface FormatMoneyOptions {
  currency?: string;
  compact?: boolean;
  hideCurrency?: boolean;
}

/**
 * Единый формат денежных значений:
 * $1,250, $150,000, $1.25M, $4.50B
 */
export function formatMoney(
  amount: number,
  currencyOrOptions: string | FormatMoneyOptions = '$',
  compact: boolean = false
): string {
  let currency = '$';
  let isCompact = compact;
  let hideCurrency = false;

  if (typeof currencyOrOptions === 'object') {
    currency = currencyOrOptions.currency ?? '$';
    isCompact = currencyOrOptions.compact ?? false;
    hideCurrency = currencyOrOptions.hideCurrency ?? false;
  } else {
    currency = currencyOrOptions;
  }

  const isNegative = amount < 0;
  const abs = Math.abs(amount);

  let formatted = '';
  if (isCompact) {
    if (abs >= 1_000_000_000_000) {
      formatted = `${(abs / 1_000_000_000_000).toFixed(2)}T`;
    } else if (abs >= 1_000_000_000) {
      formatted = `${(abs / 1_000_000_000).toFixed(2)}B`;
    } else if (abs >= 1_000_000) {
      formatted = `${(abs / 1_000_000).toFixed(2)}M`;
    } else if (abs >= 10_000) {
      formatted = `${(abs / 1_000).toFixed(1)}k`;
    } else {
      formatted = Math.round(abs).toLocaleString('ru-RU');
    }
  } else {
    formatted = Math.round(abs).toLocaleString('ru-RU');
  }

  const prefix = hideCurrency ? '' : currency;
  return `${isNegative ? '-' : ''}${prefix}${formatted}`;
}

/**
 * Единый формат процентов:
 * +12.5%, -4.2%, 0.0%
 */
export function formatPercent(value: number, includeSign: boolean = true): string {
  const sign = includeSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

/**
 * Единый формат целых и дробных чисел
 */
export function formatNumber(value: number, maximumFractionDigits: number = 0): string {
  return value.toLocaleString('ru-RU', { maximumFractionDigits });
}

/**
 * Компактный формат чисел (1.5k, 2.3M, 4.1B)
 */
export function formatCompact(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000_000_000) return `${sign}${(abs / 1_000_000_000_000).toFixed(2)}T`;
  if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 10_000) return `${sign}${(abs / 1_000).toFixed(1)}k`;
  return `${sign}${Math.round(abs).toLocaleString('ru-RU')}`;
}

/**
 * Единый словарь терминов
 */
export const TERMS = {
  cash: 'Деньги',
  netWorth: 'Капитал',
  revenue: 'Выручка',
  profit: 'Прибыль',
  expenses: 'Расходы',
  hourlyIncome: 'Доход/час',
  dailyIncome: 'Доход/день',
  level: 'Уровень',
  upgrade: 'Улучшить',
  buy: 'Купить',
  sell: 'Продать',
  manage: 'Управление',
  hire: 'Нанять',
  fire: 'Уволить',
  claim: 'Забрать',
  active: 'Активен',
  inactive: 'Неактивен',
  inProgress: 'В процессе',
  locked: 'Заблокировано',
  completed: 'Завершено',
};
