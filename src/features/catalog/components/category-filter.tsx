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
    <div role="group" aria-label="Filtrar por categoria">
      <button
        type="button"
        aria-pressed={activeCategoryId === null}
        onClick={() => onSelect(null)}
      >
        Todos
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          aria-pressed={activeCategoryId === category.id}
          onClick={() => onSelect(category.id)}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
