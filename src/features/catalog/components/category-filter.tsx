'use client';

import type { PublicCategory } from '@/lib/api/adapters/public-catalog';

type CategoryFilterProps = {
  categories: PublicCategory[];
  activeCategoryId: string | null;
  onSelect: (categoryId: string | null) => void;
};

export function CategoryFilter({
  categories,
  activeCategoryId,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div
      role="group"
      aria-label="Filtrar por categoria"
      className="flex gap-2 overflow-x-auto px-4 pb-1"
    >
      <button
        type="button"
        aria-pressed={activeCategoryId === null}
        onClick={() => onSelect(null)}
        className="border-border text-foreground aria-pressed:text-primary-foreground shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors aria-pressed:border-transparent aria-pressed:bg-[var(--tenant-primary)]"
      >
        Todos
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          aria-pressed={activeCategoryId === category.id}
          onClick={() => onSelect(category.id)}
          className="border-border text-foreground aria-pressed:text-primary-foreground shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors aria-pressed:border-transparent aria-pressed:bg-[var(--tenant-primary)]"
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
