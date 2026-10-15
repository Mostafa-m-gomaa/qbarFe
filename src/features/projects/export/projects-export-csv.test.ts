import { describe, expect, it } from 'vitest';

import type { ExportProjectRow } from './projects-export.types';
import { EXPORT_PROJECT_COLUMNS } from './projects-export.types';
import { escapeCsvField, exportRowsToCsv } from './projects-export-csv';

function emptyRow(overrides: Partial<ExportProjectRow> = {}): ExportProjectRow {
  const row = Object.fromEntries(EXPORT_PROJECT_COLUMNS.map((c) => [c, ''])) as ExportProjectRow;
  return { ...row, ...overrides };
}

describe('escapeCsvField', () => {
  it('quotes fields with commas and doubles internal quotes', () => {
    expect(escapeCsvField('plain')).toBe('plain');
    expect(escapeCsvField('a,b')).toBe('"a,b"');
    expect(escapeCsvField('say "hi"')).toBe('"say ""hi"""');
  });
});

describe('exportRowsToCsv', () => {
  it('escapes special characters in data rows', () => {
    const csv = exportRowsToCsv([
      emptyRow({ name: 'Project, "VIP"', customer: 'Acme\nLtd' }),
    ]);
    expect(csv).toContain('"Project, ""VIP"""');
    expect(csv.split('\r\n')).toHaveLength(2);
  });
});
