import { CURATED_PALETTES } from '../components/color-palette-picker';

type CatalogColorFields = {
  hasCustomColor: boolean;
  buttonColorHex: string | null;
};

export function resolveButtonColorHex(catalog: CatalogColorFields): string {
  return catalog.hasCustomColor
    ? (catalog.buttonColorHex ?? CURATED_PALETTES[0].buttonColorHex)
    : CURATED_PALETTES[0].buttonColorHex;
}
