import type { ExportProjectColumn, ExportProjectRow } from './projects-export.types';
import { EXPORT_PROJECT_COLUMNS } from './projects-export.types';
import { exportColumnLabels } from './projects-export-rows';

/** RFC 4180 field escape for CSV. */
export function escapeCsvField(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportRowsToCsv(rows: ExportProjectRow[]): string {
  const labels = exportColumnLabels();
  const header = EXPORT_PROJECT_COLUMNS.map((col) => escapeCsvField(labels[col])).join(',');
  const body = rows
    .map((row) =>
      EXPORT_PROJECT_COLUMNS.map((col: ExportProjectColumn) => escapeCsvField(row[col] ?? '')).join(
        ',',
      ),
    )
    .join('\r\n');
  return `${header}\r\n${body}`;
}

export function downloadProjectsCsv(rows: ExportProjectRow[], filename?: string): void {
  const name = filename ?? `projects-${new Date().toISOString().slice(0, 10)}.csv`;
  const csv = exportRowsToCsv(rows);
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}
