/**
 * Money formatting for Q-Bar.
 *
 * The backend stores money as integer minor units. `minorUnits` is a per-currency
 * property (0–4) sourced exclusively from `GET /currencies` — never assume 2 decimals
 * and never hardcode a currency here.
 */

export interface FormatMoneyInput {
  /** Integer amount in minor units (e.g. 10050 for 100.50 at minorUnits=2). */
  amountMinor: number;
  /** ISO 4217 currency code (e.g. "EGP"). Used for the display suffix/Intl formatting. */
  currencyCode: string;
  /**
   * Number of minor-unit decimals for this currency (from `GET /currencies`).
   * When unknown (currency metadata not yet loaded) the raw integer is shown with the code.
   */
  minorUnits: number | null | undefined;
  /** Locale for digit/grouping formatting. Defaults to English (US). */
  locale?: string;
}

/**
 * Converts integer minor units to a localized currency string.
 * Falls back to a plain "<amount> <code>" rendering when `minorUnits` is unavailable.
 */
export function formatMoney({
  amountMinor,
  currencyCode,
  minorUnits,
  locale = 'en-US',
}: FormatMoneyInput): string {
  if (minorUnits === null || minorUnits === undefined) {
    return `${new Intl.NumberFormat(locale).format(amountMinor)} ${currencyCode}`;
  }

  const value = amountMinor / 10 ** minorUnits;

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: minorUnits,
      maximumFractionDigits: minorUnits,
    }).format(value);
  } catch {
    // Unknown/invalid currency code for Intl — degrade gracefully.
    return `${new Intl.NumberFormat(locale, {
      minimumFractionDigits: minorUnits,
      maximumFractionDigits: minorUnits,
    }).format(value)} ${currencyCode}`;
  }
}
