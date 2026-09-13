import type { PublicProduct } from '@/lib/api/adapters/public-catalog';

function isOutOfStock(product: PublicProduct): boolean {
  return product.quantityAvailable === 0 || !product.isOrderable;
}

function ProductImage({ product }: { product: PublicProduct }) {
  if (!product.imageUrl) {
    return (
      <svg
        role="img"
        aria-label={product.name}
        data-placeholder="true"
        viewBox="0 0 24 24"
      >
        <rect width="24" height="24" fill="currentColor" opacity="0.1" />
      </svg>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element -- protótipo de vitrine, otimização de imagem fica pra depois
  return <img src={product.imageUrl} alt={product.name} />;
}

export function ProductGrid({ products }: { products: PublicProduct[] }) {
  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>
          <ProductImage product={product} />
          {isOutOfStock(product) && <span>Esgotado</span>}
          <p>{product.name}</p>
          {product.sku && <p>{product.sku}</p>}
          {product.description && <p>{product.description}</p>}
        </li>
      ))}
    </ul>
  );
}
