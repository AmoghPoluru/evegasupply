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
import { InquiriesTable } from './components/InquiriesTable';

export default function BuyerInquiriesPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<'all' | 'new' | 'replied' | 'closed'>('all');
  const limit = 20;

  const { data, isLoading, error } = trpc.buyers.inquiries.list.useQuery({
    limit,
    page,
    status,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Inquiries</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your inquiries to vendors
          </p>
        </div>
        <Link href="/buyer/inquiries/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Send Inquiry
          </Button>
        </Link>
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
            <SelectItem value="all">All Inquiries</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="replied">Replied</SelectItem>
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
              <p>Error loading inquiries: {error.message}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <InquiriesTable
          inquiries={data?.inquiries || []}
          totalDocs={data?.totalDocs || 0}
          page={page}
          totalPages={data?.totalPages || 0}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
