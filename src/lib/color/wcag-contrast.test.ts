import { describe, expect, it } from 'vitest';
import { contrastRatio } from './wcag-contrast';

describe('contrastRatio', () => {
  it('returns 21 for black against white, the maximum possible ratio', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 0);
  });

  it('returns 1 when both colors are identical', () => {
    expect(contrastRatio('#DB2777', '#DB2777')).toBeCloseTo(1, 5);
  });

  it('is symmetric regardless of argument order', () => {
    expect(contrastRatio('#1C1917', '#B8860B')).toBeCloseTo(
      contrastRatio('#B8860B', '#1C1917'),
      5,
    );
  });
});
