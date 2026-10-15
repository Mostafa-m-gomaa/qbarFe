/** Shared date/number formatting helpers (Arabic-first defaults). */

const DEFAULT_LOCALE = 'en-US';

/** Formats an ISO datetime string as a short date, or a dash when null/invalid. */
export function formatDate(iso: string | null | undefined, locale = DEFAULT_LOCALE): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

/** Formats an ISO datetime string as date + time, or a dash when null/invalid. */
export function formatDateTime(iso: string | null | undefined, locale = DEFAULT_LOCALE): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

/** Formats a number with locale grouping. */
export function formatNumber(value: number, locale = DEFAULT_LOCALE): string {
  return new Intl.NumberFormat(locale).format(value);
}

/** Formats a 0–100 percentage value with one decimal at most. */
export function formatPercent(value: number, locale = DEFAULT_LOCALE): string {
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value)}%`;
}
