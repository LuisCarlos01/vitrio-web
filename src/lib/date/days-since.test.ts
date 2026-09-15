import { describe, expect, it } from 'vitest';
import { daysSince } from './days-since';

describe('daysSince', () => {
  it('returns 0 for a timestamp from earlier today', () => {
    const now = new Date('2026-09-15T18:00:00Z');
    expect(daysSince('2026-09-15T06:00:00Z', now)).toBe(0);
  });

  it('returns the number of whole days elapsed', () => {
    const now = new Date('2026-09-15T12:00:00Z');
    expect(daysSince('2026-09-10T12:00:00Z', now)).toBe(5);
  });

  it('rounds down a partial day instead of up', () => {
    const now = new Date('2026-09-15T23:00:00Z');
    expect(daysSince('2026-09-10T12:00:00Z', now)).toBe(5);
  });

  it('returns null for an invalid date string instead of NaN', () => {
    expect(daysSince('not-a-date')).toBeNull();
  });
});
