import type { FormEvent } from 'react';

const QUANTITY_SCALE = 4;
const PERCENT_SCALE = 4;
const FX_SCALE = 8;

/** Format integer scaled quantity to API decimal string. */
export function formatQuantityFromScaled(scaled: number): string {
  const sign = scaled < 0 ? '-' : '';
  const abs = Math.abs(scaled);
  const intPart = Math.floor(abs / 10 ** QUANTITY_SCALE);
  const frac = abs % 10 ** QUANTITY_SCALE;
  return `${sign}${intPart}.${String(frac).padStart(QUANTITY_SCALE, '0')}`;
}

export function formatQuantityInput(value: number): string {
  return value.toFixed(QUANTITY_SCALE);
}

export function formatPercentInput(value: number): string {
  return value.toFixed(PERCENT_SCALE);
}

export function formatFxInput(value: number): string {
  return value.toFixed(FX_SCALE);
}

/**
 * Strip non-ASCII digits from typing (blocks letters, Arabic-Indic digits, commas, etc.).
 * Allows one `.` decimal separator and optional fraction digit cap while editing.
 */
export function sanitizeAsciiNumericInput(raw: string, maxFractionDigits?: number): string {
  let out = '';
  let seenDot = false;
  for (const ch of raw) {
    if (ch >= '0' && ch <= '9') {
      out += ch;
      continue;
    }
    if (ch === '.' && !seenDot) {
      seenDot = true;
      out += ch;
    }
  }
  if (maxFractionDigits !== undefined && seenDot) {
    const [intPart, fracPart = ''] = out.split('.');
    if (fracPart.length > maxFractionDigits) {
      out = `${intPart}.${fracPart.slice(0, maxFractionDigits)}`;
    }
  }
  return out;
}

/** Use on controlled inputs or with `onInput` for live filtering on uncontrolled fields. */
export function filterAsciiNumericInputEvent(
  event: FormEvent<HTMLInputElement>,
  maxFractionDigits?: number,
): void {
  const el = event.currentTarget;
  const next = sanitizeAsciiNumericInput(el.value, maxFractionDigits);
  if (next !== el.value) {
    el.value = next;
  }
}

export function asciiNumericFieldProps(maxFractionDigits?: number) {
  return {
    lang: 'en' as const,
    dir: 'ltr' as const,
    inputMode: 'decimal' as const,
    onInput: (e: FormEvent<HTMLInputElement>) =>
      filterAsciiNumericInputEvent(e, maxFractionDigits),
  };
}

export function parseQuantityInput(raw: string): string {
  const n = Number(sanitizeAsciiNumericInput(raw));
  if (!Number.isFinite(n) || n < 0) return '0.0000';
  return n.toFixed(QUANTITY_SCALE);
}

export function parsePercentInput(raw: string): string {
  const n = Number(sanitizeAsciiNumericInput(raw, PERCENT_SCALE));
  if (!Number.isFinite(n)) return '0.0000';
  return n.toFixed(PERCENT_SCALE);
}

export function parseFxInput(raw: string): string {
  const n = Number(sanitizeAsciiNumericInput(raw, FX_SCALE));
  if (!Number.isFinite(n) || n <= 0) return '';
  return n.toFixed(FX_SCALE);
}

export { FX_SCALE, PERCENT_SCALE, QUANTITY_SCALE };
