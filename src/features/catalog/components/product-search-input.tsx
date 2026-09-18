'use client';

import { forwardRef } from 'react';
import { SearchIcon } from 'lucide-react';

type ProductSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export const ProductSearchInput = forwardRef<
  HTMLInputElement,
  ProductSearchInputProps
>(function ProductSearchInput({ value, onChange }, ref) {
  return (
    <div className="border-border bg-background focus-within:ring-ring/50 flex items-center gap-2 rounded-lg border px-3 py-2 focus-within:ring-2">
      <SearchIcon className="text-muted-foreground size-4 shrink-0" />
      <input
        ref={ref}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar produto"
        aria-label="Buscar produto"
        className="text-foreground placeholder:text-muted-foreground w-full bg-transparent text-sm outline-none"
      />
    </div>
  );
});
