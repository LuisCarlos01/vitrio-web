export function relativeLuminance(hex: string): number {
  const normalized = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map(
    (offset) => parseInt(normalized.slice(offset, offset + 2), 16) / 255,
  );

  const [rs, gs, bs] = [r, g, b].map((channel) =>
    channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4),
  );

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/** WCAG relative luminance — usada pra escolher texto claro/escuro legível sobre uma cor de fundo dinâmica (definida pela revendedora, não fixa). */
export function contrastTextColor(
  backgroundHex: string,
): '#FFFFFF' | '#000000' {
  return relativeLuminance(backgroundHex) > 0.179 ? '#000000' : '#FFFFFF';
}
