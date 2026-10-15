import { describe, expect, it } from 'vitest';

import { PROJECT_STAGE_LABELS, labelFor } from './enums';

describe('labelFor', () => {
  it('returns the mapped label', () => {
    expect(labelFor(PROJECT_STAGE_LABELS, 'PO')).toBe('PO');
    expect(labelFor(PROJECT_STAGE_LABELS, 'Lead')).toBe('Lead');
  });

  it('falls back to the raw value for unknown keys', () => {
    expect(labelFor(PROJECT_STAGE_LABELS, 'Unknown')).toBe('Unknown');
  });
});
