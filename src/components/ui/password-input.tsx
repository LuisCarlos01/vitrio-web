'use client';

import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from 'cn';
import { Input } from './input';

type PasswordInputProps = Omit<React.ComponentProps<typeof Input>, 'type'>;

function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative">
      <Input
        type={visible ? 'text' : 'password'}
        className={cn('pr-8', className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center px-2"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

export { PasswordInput };
