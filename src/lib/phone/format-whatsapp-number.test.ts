import { describe, expect, it } from 'vitest';
import { formatWhatsappNumber } from './format-whatsapp-number';

describe('formatWhatsappNumber', () => {
  it('returns an empty string for empty input', () => {
    expect(formatWhatsappNumber('')).toBe('');
  });

  it('strips letters and symbols, keeping only digits', () => {
    expect(formatWhatsappNumber('not-a-number')).toBe('');
    expect(formatWhatsappNumber('abc11def91234ghi5678')).toBe(
      '(11) 91234-5678',
    );
  });

  it('formats progressively while the DDD is still being typed', () => {
    expect(formatWhatsappNumber('1')).toBe('(1');
    expect(formatWhatsappNumber('11')).toBe('(11');
    expect(formatWhatsappNumber('119')).toBe('(11) 9');
  });

  it('formats a complete mobile number (9-digit local, 11 digits total)', () => {
    expect(formatWhatsappNumber('11912345678')).toBe('(11) 91234-5678');
  });

  it('formats a complete landline number (8-digit local, 10 digits total)', () => {
    expect(formatWhatsappNumber('1133334444')).toBe('(11) 3333-4444');
  });

  it('truncates any extra digits beyond a full mobile number', () => {
    expect(formatWhatsappNumber('1191234567899999')).toBe('(11) 91234-5678');
  });
});
