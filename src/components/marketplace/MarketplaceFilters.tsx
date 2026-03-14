'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

interface MarketplaceFiltersProps {
  search: string;
  verified: boolean | undefined;
  location: string;
  sort: 'newest' | 'verified' | 'name';
  onSearchChange: (value: string) => void;
  onVerifiedChange: (value: boolean | undefined) => void;
  onLocationChange: (value: string) => void;
  onSortChange: (value: 'newest' | 'verified' | 'name') => void;
}

export function MarketplaceFilters({
  search,
  verified,
  location,
  sort,
  onSearchChange,
  onVerifiedChange,
  onLocationChange,
  onSortChange,
}: MarketplaceFiltersProps) {
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 300);

  // Update parent when debounced search changes
  React.useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  return (
    <div className="space-y-4 mb-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          type="text"
          placeholder="Search suppliers by name..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchInput && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => {
              setSearchInput('');
              onSearchChange('');
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-4">
        {/* Verified Filter */}
        <Select
          value={verified === undefined ? 'all' : verified ? 'verified' : 'unverified'}
          onValueChange={(value) => {
            if (value === 'all') {
              onVerifiedChange(undefined);
            } else {
              onVerifiedChange(value === 'verified');
            }
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Verification" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Suppliers</SelectItem>
            <SelectItem value="verified">Verified Only</SelectItem>
            <SelectItem value="unverified">Unverified</SelectItem>
          </SelectContent>
        </Select>

        {/* Location Filter */}
        <Input
          type="text"
          placeholder="Filter by location..."
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          className="w-[180px]"
        />

        {/* Sort */}
        <Select
          value={sort}
          onValueChange={(value) => onSortChange(value as 'newest' | 'verified' | 'name')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="verified">Verified First</SelectItem>
            <SelectItem value="name">Name (A-Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
