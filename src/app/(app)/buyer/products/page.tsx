'use client';

import { useState } from 'react';
import { trpc } from '@/trpc/client';
import { ProductGrid } from '@/components/marketplace/ProductGrid';
import { ProductFilters } from './components/ProductFilters';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { Card, CardContent } from '@/components/ui/card';

export default function BuyerProductsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({
    moqMin: undefined as number | undefined,
    moqMax: undefined as number | undefined,
    priceMin: undefined as number | undefined,
    priceMax: undefined as number | undefined,
    category: undefined as string | undefined,
    supplierLocation: undefined as string | undefined,
    verifiedSupplier: undefined as boolean | undefined,
  });
  const limit = 20;
  const debouncedSearch = useDebounce(searchInput, 300);

  const { data, isLoading, error } = trpc.products.list.useQuery({
    limit,
    page,
    search: debouncedSearch || undefined,
    category: filters.category,
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Product Discovery</h1>
        <p className="text-sm text-gray-600 mt-1">
          Browse and search for products from verified suppliers
        </p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <ProductFilters filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="py-12 text-center text-red-600">
                Error loading products: {error.message}
              </CardContent>
            </Card>
          ) : (
            <ProductGrid
              products={data?.products || []}
            />
          )}
        </div>
      </div>
    </div>
  );
}
