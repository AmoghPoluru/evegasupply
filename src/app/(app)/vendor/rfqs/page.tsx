'use client';

import { useState } from 'react';
import { trpc } from '@/trpc/client';
import { RFQsTable } from './components/RFQsTable';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, AlertCircle } from 'lucide-react';

export default function VendorRFQsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'matched' | 'my_quotes'>('all');
  const limit = 20;

  const { data, isLoading, error } = trpc.vendors.rfqs.list.useQuery({
    limit,
    page,
    filter,
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">RFQs</h1>
        <p className="text-sm text-gray-600 mt-1">
          View and respond to Request for Quotations
        </p>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <Select
          value={filter}
          onValueChange={(value) => {
            setFilter(value as 'all' | 'matched' | 'my_quotes');
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter RFQs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All RFQs</SelectItem>
            <SelectItem value="matched">Matched RFQs</SelectItem>
            <SelectItem value="my_quotes">My Quotes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <p>Error loading RFQs: {error.message}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <RFQsTable
          rfqs={data?.rfqs || []}
          totalDocs={data?.totalDocs || 0}
          page={page}
          totalPages={data?.totalPages || 0}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
