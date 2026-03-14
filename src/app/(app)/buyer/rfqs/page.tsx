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
import { Loader2, AlertCircle, Plus } from 'lucide-react';
import Link from 'next/link';
import { RFQsTable } from './components/RFQsTable';

export default function BuyerRFQsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<'all' | 'draft' | 'new' | 'open' | 'closed'>('all');
  const limit = 20;

  const { data, isLoading, error } = trpc.buyers.rfqs.list.useQuery({
    limit,
    page,
    status,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">RFQs</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your Request for Quotations
          </p>
        </div>
        <Link href="/buyer/rfqs/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create RFQ
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value as 'all' | 'draft' | 'new' | 'open' | 'closed');
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All RFQs</SelectItem>
            <SelectItem value="draft">Drafts</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
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
          rfqs={(data?.rfqs || []) as any}
          totalDocs={data?.totalDocs || 0}
          page={page}
          totalPages={data?.totalPages || 0}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
