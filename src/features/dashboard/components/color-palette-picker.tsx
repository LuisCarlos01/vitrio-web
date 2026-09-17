import { useState } from 'react';
import { cn } from 'cn';
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

  const swatchInputClassName =
    'size-6 cursor-pointer rounded-full border border-border p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0';

  return (
    <fieldset className="flex flex-col gap-2">
      {/* "Cor da loja" já aparece como título da seção em CatalogForm — legenda
          fica só pra leitor de tela não anunciar o fieldset sem nome. */}
      <legend className="sr-only">Cor da loja</legend>
      {CURATED_PALETTES.map((palette) => {
        const isSelected = selected === palette.name;
        const currentPrimary = isSelected
          ? primaryColorHex
          : palette.primaryColorHex;
        const currentButton = isSelected
          ? buttonColorHex
          : palette.buttonColorHex;

        return (
          <Label
            key={palette.name}
            className={cn(
              'cursor-pointer justify-between rounded-lg border p-3 font-normal transition-colors',
              isSelected
                ? 'border-primary bg-accent'
                : 'border-border hover:bg-accent/50',
            )}
          >
            <span className="flex items-center gap-3">
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
            </span>
            <span className="flex items-center gap-2">
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
                className={swatchInputClassName}
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
                className={swatchInputClassName}
              />
            </span>
          </Label>
        );
      })}
      <Label
        className={cn(
          'cursor-pointer rounded-lg border p-3 font-normal transition-colors',
          selected === 'custom'
            ? 'border-primary bg-accent'
            : 'border-border hover:bg-accent/50',
        )}
      >
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
        <div className="border-border flex flex-col gap-3 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="custom-primary-color">
              Cor primária (avançado)
            </Label>
            <input
              id="custom-primary-color"
              type="color"
              value={primaryColorHex.toLowerCase()}
              onChange={(event) =>
                onChange({
                  primaryColorHex: event.target.value,
                  buttonColorHex,
                })
              }
              className={swatchInputClassName}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="custom-button-color">Cor do botão (avançado)</Label>
            <input
              id="custom-button-color"
              type="color"
              value={buttonColorHex.toLowerCase()}
              onChange={(event) =>
                onChange({
                  primaryColorHex,
                  buttonColorHex: event.target.value,
                })
              }
              className={swatchInputClassName}
            />
          </div>
        </div>
      )}
    </fieldset>
  );
}
