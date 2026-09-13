type QuantityStepperProps = {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
  disabled?: boolean;
};

export function QuantityStepper({
  quantity,
  onChange,
  min = 1,
  disabled = false,
}: QuantityStepperProps) {
  return (
    <div>
      <button
        type="button"
        aria-label="Diminuir quantidade"
        disabled={disabled || quantity <= min}
        onClick={() => onChange(quantity - 1)}
      >
        −
      </button>
      <span>{quantity}</span>
      <button
        type="button"
        aria-label="Aumentar quantidade"
        disabled={disabled}
        onClick={() => onChange(quantity + 1)}
      >
        +
      </button>
    </div>
  );
}
