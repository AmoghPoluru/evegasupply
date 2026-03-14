'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface ProductFiltersProps {
  filters: {
    moqMin?: number;
    moqMax?: number;
    priceMin?: number;
    priceMax?: number;
    category?: string;
    supplierLocation?: string;
    verifiedSupplier?: boolean;
  };
  onFiltersChange: (filters: any) => void;
}

export function ProductFilters({ filters, onFiltersChange }: ProductFiltersProps) {
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      moqMin: undefined,
      moqMax: undefined,
      priceMin: undefined,
      priceMax: undefined,
      category: undefined,
      supplierLocation: undefined,
      verifiedSupplier: undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
        <CardDescription>Refine your product search</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* MOQ Range */}
        <div>
          <Label className="mb-2">MOQ Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.moqMin || ''}
              onChange={(e) => updateFilter('moqMin', e.target.value ? parseInt(e.target.value) : undefined)}
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.moqMax || ''}
              onChange={(e) => updateFilter('moqMax', e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>
        </div>

        {/* Price Range */}
        <div>
          <Label className="mb-2">Price Range ($)</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.priceMin || ''}
              onChange={(e) => updateFilter('priceMin', e.target.value ? parseFloat(e.target.value) : undefined)}
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.priceMax || ''}
              onChange={(e) => updateFilter('priceMax', e.target.value ? parseFloat(e.target.value) : undefined)}
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <Label className="mb-2">Category</Label>
          <Select
            value={filters.category || 'all'}
            onValueChange={(value) => updateFilter('category', value === 'all' ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Electronics">Electronics</SelectItem>
              <SelectItem value="Textiles">Textiles</SelectItem>
              <SelectItem value="Machinery">Machinery</SelectItem>
              <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
              <SelectItem value="Chemicals">Chemicals</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Supplier Location */}
        <div>
          <Label className="mb-2">Supplier Location</Label>
          <Input
            placeholder="Enter location"
            value={filters.supplierLocation || ''}
            onChange={(e) => updateFilter('supplierLocation', e.target.value || undefined)}
          />
        </div>

        {/* Verified Supplier */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="verified"
            checked={filters.verifiedSupplier || false}
            onCheckedChange={(checked) => updateFilter('verifiedSupplier', checked ? true : undefined)}
          />
          <Label htmlFor="verified" className="cursor-pointer">
            Verified Suppliers Only
          </Label>
        </div>

        <Button variant="outline" onClick={clearFilters} className="w-full">
          Clear Filters
        </Button>
      </CardContent>
    </Card>
  );
}
