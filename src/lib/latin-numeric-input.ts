/**
 * Restrict numeric fields to ASCII digits (0-9) and at most one decimal point.
 * Blocks letters, Arabic-Indic digits (٠–٩), and other scripts.
 */
export function sanitizeLatinDecimalInput(
  raw: string,
  options?: { maxDecimals?: number },
): string {
  let out = '';
  let hasDot = false;
  for (const ch of raw) {
    if (ch >= '0' && ch <= '9') {
      out += ch;
    } else if (ch === '.' && !hasDot) {
      hasDot = true;
      out += ch;
    }
  }

  if (options?.maxDecimals === undefined || !hasDot) {
    return out;
  }

  const [intPart, fracPart = ''] = out.split('.');
  const frac = fracPart.slice(0, options.maxDecimals);
  if (raw.endsWith('.') && fracPart.length <= options.maxDecimals) {
    return `${intPart}.${frac}`;
  }
  return frac.length > 0 ? `${intPart}.${frac}` : intPart;
}

export function mergeLatinDecimalPaste(
  current: string,
  pasted: string,
  selectionStart: number,
  selectionEnd: number,
  options?: { maxDecimals?: number },
): string {
  const merged =
    current.slice(0, selectionStart) + pasted + current.slice(selectionEnd);
  return sanitizeLatinDecimalInput(merged, options);
}
