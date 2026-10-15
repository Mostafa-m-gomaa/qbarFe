/** Convert `datetime-local` value to ISO UTC for the API. */
export function dueAtToIso(value: string): string {
  if (!value.trim()) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    return new Date(`${value}T09:00:00`).toISOString();
  }
  return d.toISOString();
}

/** Format API `dueAt` for `datetime-local` input (local timezone). */
export function dueAtToInputValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
