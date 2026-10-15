import { formatMoney } from '@/lib/money';

export function formatDocumentMoney(
  amountMinor: number,
  currencyCode: string,
  currencyMinorUnits: number,
): string {
  return formatMoney({
    amountMinor,
    currencyCode,
    minorUnits: currencyMinorUnits,
  });
}
