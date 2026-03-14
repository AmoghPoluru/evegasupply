'use client';

import { useState } from 'react';
import { trpc } from '@/trpc/client';
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
import { QuotesTable } from './components/QuotesTable';

export default function BuyerQuotesPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const limit = 20;

  const { data, isLoading, error } = trpc.buyers.quotes.list.useQuery({
    limit,
    page,
    status,
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Quotes</h1>
        <p className="text-sm text-gray-600 mt-1">
          Review quotes for your RFQs
        </p>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value as typeof status);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Quotes</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
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
              <p>Error loading quotes: {error.message}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <QuotesTable
          quotes={data?.quotes || []}
          totalDocs={data?.totalDocs || 0}
          page={page}
          totalPages={data?.totalPages || 0}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
