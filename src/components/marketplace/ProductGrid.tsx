'use client';

import { ProductCard } from './ProductCard';
import type { Product } from '@/payload-types';

interface ProductGridProps {
  products: Product[];
}

/**
 * ProductGrid Component
 * 
 * Displays products in a responsive grid layout.
 * 3 columns on desktop, 2 on tablet, 1 on mobile.
 * 
 * @param products - Array of products to display
 */
export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
