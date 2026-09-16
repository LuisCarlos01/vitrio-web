import { describe, expect, it } from 'vitest';
import { CURATED_PALETTES } from '../components/color-palette-picker';
import { resolveButtonColorHex } from './catalog-colors';

describe('resolveButtonColorHex', () => {
  it('returns the curated default when the catalog has no custom color yet', () => {
    expect(
      resolveButtonColorHex({ hasCustomColor: false, buttonColorHex: null }),
    ).toBe(CURATED_PALETTES[0].buttonColorHex);
  });

  it('returns the chosen color once the catalog has a custom color', () => {
    expect(
      resolveButtonColorHex({
        hasCustomColor: true,
        buttonColorHex: '#3B82F6',
      }),
    ).toBe('#3B82F6');
  });

  it('falls back to the curated default if hasCustomColor is true but the hex is still null', () => {
    expect(
      resolveButtonColorHex({ hasCustomColor: true, buttonColorHex: null }),
    ).toBe(CURATED_PALETTES[0].buttonColorHex);
  });
});
