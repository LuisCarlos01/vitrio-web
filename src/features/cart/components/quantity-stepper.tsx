import { MinusIcon, PlusIcon } from 'lucide-react';

type QuantityStepperProps = {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
};

export function QuantityStepper({
  quantity,
  onChange,
  min = 1,
  max,
  disabled = false,
}: QuantityStepperProps) {
  return (
    <div className="border-border inline-flex items-center rounded-lg border">
      <button
        type="button"
        aria-label="Diminuir quantidade"
        disabled={disabled || quantity <= min}
        onClick={() => onChange(quantity - 1)}
        className="text-foreground flex size-7 items-center justify-center rounded-l-lg disabled:pointer-events-none disabled:opacity-40"
      >
        <MinusIcon className="size-3.5" />
      </button>
      <span className="w-6 text-center text-sm font-medium tabular-nums">
        {quantity}
      </span>
      <button
        type="button"
        aria-label="Aumentar quantidade"
        disabled={disabled || (max !== undefined && quantity >= max)}
        onClick={() => onChange(quantity + 1)}
        className="text-foreground flex size-7 items-center justify-center rounded-r-lg disabled:pointer-events-none disabled:opacity-40"
      >
        <PlusIcon className="size-3.5" />
      </button>
    </div>
  );
}
