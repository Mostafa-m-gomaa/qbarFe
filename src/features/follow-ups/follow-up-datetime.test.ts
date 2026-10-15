import { describe, expect, it } from 'vitest';

import { dueAtToInputValue, dueAtToIso } from './follow-up-datetime';

describe('follow-up datetime helpers', () => {
  it('round-trips datetime-local through ISO', () => {
    const iso = '2030-06-01T09:00:00.000Z';
    const input = dueAtToInputValue(iso);
    expect(dueAtToIso(input)).toBeTruthy();
  });
});
