import { relativeLuminance } from './contrast-text-color';

export function contrastRatio(hexA: string, hexB: string): number {
  const [lighter, darker] = [
    relativeLuminance(hexA),
    relativeLuminance(hexB),
  ].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

/** 3:1, limiar WCAG AA pra elementos de UI (ex. botão) contra a cor que eles tocam. */
export const WCAG_AA_UI_RATIO = 3;
