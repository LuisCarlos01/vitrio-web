import { useState } from 'react';
import { Label } from '@/components/ui/label';

export const CURATED_PALETTES = [
  { name: 'Clássico', primaryColorHex: '#1C1917', buttonColorHex: '#B8860B' },
  { name: 'Vibrante', primaryColorHex: '#DB2777', buttonColorHex: '#7C3AED' },
  { name: 'Pastel', primaryColorHex: '#F472B6', buttonColorHex: '#A78BFA' },
  { name: 'Terroso', primaryColorHex: '#C2703D', buttonColorHex: '#6B7A4F' },
  { name: 'Noturno', primaryColorHex: '#111827', buttonColorHex: '#F59E0B' },
  { name: 'Moderno', primaryColorHex: '#1E3A8A', buttonColorHex: '#3B82F6' },
] as const;

type PaletteColors = { primaryColorHex: string; buttonColorHex: string };

type ColorPalettePickerProps = PaletteColors & {
  onChange: (colors: PaletteColors) => void;
};

function findMatchingPalette(primaryColorHex: string, buttonColorHex: string) {
  return CURATED_PALETTES.find(
    (palette) =>
      palette.primaryColorHex.toLowerCase() === primaryColorHex.toLowerCase() &&
      palette.buttonColorHex.toLowerCase() === buttonColorHex.toLowerCase(),
  );
}

export function ColorPalettePicker({
  primaryColorHex,
  buttonColorHex,
  onChange,
}: ColorPalettePickerProps) {
  const [explicitSelection, setExplicitSelection] = useState<string | null>(
    null,
  );
  const selected =
    explicitSelection ??
    findMatchingPalette(primaryColorHex, buttonColorHex)?.name ??
    'custom';

  return (
    <fieldset>
      <legend>Cor da loja</legend>
      {CURATED_PALETTES.map((palette) => {
        const isSelected = selected === palette.name;
        const currentPrimary = isSelected
          ? primaryColorHex
          : palette.primaryColorHex;
        const currentButton = isSelected
          ? buttonColorHex
          : palette.buttonColorHex;

        return (
          <div key={palette.name}>
            <Label>
              <input
                type="radio"
                name="color-palette"
                checked={isSelected}
                onChange={() => {
                  setExplicitSelection(palette.name);
                  onChange({
                    primaryColorHex: palette.primaryColorHex,
                    buttonColorHex: palette.buttonColorHex,
                  });
                }}
              />
              {palette.name}
            </Label>
            <input
              type="color"
              aria-label={`Cor primária de ${palette.name}`}
              value={currentPrimary.toLowerCase()}
              onChange={(event) => {
                setExplicitSelection(palette.name);
                onChange({
                  primaryColorHex: event.target.value,
                  buttonColorHex: currentButton,
                });
              }}
            />
            <input
              type="color"
              aria-label={`Cor do botão de ${palette.name}`}
              value={currentButton.toLowerCase()}
              onChange={(event) => {
                setExplicitSelection(palette.name);
                onChange({
                  primaryColorHex: currentPrimary,
                  buttonColorHex: event.target.value,
                });
              }}
            />
          </div>
        );
      })}
      <Label>
        <input
          type="radio"
          name="color-palette"
          checked={selected === 'custom'}
          onChange={() => {
            setExplicitSelection('custom');
            onChange({ primaryColorHex, buttonColorHex });
          }}
        />
        Avançado
      </Label>
      {selected === 'custom' && (
        <div>
          <Label htmlFor="custom-primary-color">Cor primária (avançado)</Label>
          <input
            id="custom-primary-color"
            type="color"
            value={(primaryColorHex || '#000000').toLowerCase()}
            onChange={(event) =>
              onChange({
                primaryColorHex: event.target.value,
                buttonColorHex,
              })
            }
          />
          <Label htmlFor="custom-button-color">Cor do botão (avançado)</Label>
          <input
            id="custom-button-color"
            type="color"
            value={(buttonColorHex || '#000000').toLowerCase()}
            onChange={(event) =>
              onChange({
                primaryColorHex,
                buttonColorHex: event.target.value,
              })
            }
          />
        </div>
      )}
    </fieldset>
  );
}
