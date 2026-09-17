'use client';

import { useRef } from 'react';
import { Button } from './button';

type FileInputProps = React.ComponentProps<'input'> & {
  fileName?: string | null;
  buttonLabel?: string;
};

function FileInput({
  fileName,
  buttonLabel = 'Escolher arquivo',
  ...props
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        disabled={props.disabled}
        onClick={() => inputRef.current?.click()}
      >
        {buttonLabel}
      </Button>
      <span className="text-muted-foreground truncate text-sm">
        {fileName || 'Nenhum arquivo selecionado'}
      </span>
      <input ref={inputRef} type="file" className="sr-only" {...props} />
    </div>
  );
}

export { FileInput };
