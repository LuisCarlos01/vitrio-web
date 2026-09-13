import { describe, expect, it } from 'vitest';
import { contrastTextColor } from './contrast-text-color';

describe('contrastTextColor', () => {
  it('returns white for a dark background', () => {
    expect(contrastTextColor('#111827')).toBe('#FFFFFF');
  });

  it('returns black for a light background', () => {
    expect(contrastTextColor('#F5F5F5')).toBe('#000000');
  });

  it('handles hex without the leading #', () => {
    expect(contrastTextColor('111827')).toBe('#FFFFFF');
  });
});
