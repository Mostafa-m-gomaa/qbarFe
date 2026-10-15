import { useCurrencyMap } from '@/features/currencies/use-currencies';
import { cn } from '@/lib/cn';
import { formatMoney } from '@/lib/money';

interface MoneyTextProps {
  /** Integer amount in minor units. */
  amountMinor: number;
  /** ISO currency code; `minorUnits` is resolved from the currencies catalog. */
  currencyCode: string;
  className?: string;
}

/**
 * Renders a money amount using the currency's `minorUnits` from `GET /currencies`.
 * Never assumes a decimal count or a specific currency.
 */
export function MoneyText({ amountMinor, currencyCode, className }: MoneyTextProps) {
  const currencyMap = useCurrencyMap();
  const minorUnits = currencyMap.get(currencyCode)?.minorUnits ?? null;

  return (
    <span className={cn('tabular-nums', className)} dir="ltr">
      {formatMoney({ amountMinor, currencyCode, minorUnits })}
    </span>
  );
}
