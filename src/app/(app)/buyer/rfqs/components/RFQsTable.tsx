'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface RFQ {
  id: string;
  title?: string;
  category?: string;
  quantity?: number;
  status?: string;
  createdAt?: string;
}

interface RFQsTableProps {
  rfqs: RFQ[];
  totalDocs: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function RFQsTable({
  rfqs,
  totalDocs,
  page,
  totalPages,
  onPageChange,
}: RFQsTableProps) {
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'new':
        return <Badge variant="default">New</Badge>;
      case 'open':
        return <Badge variant="default">Open</Badge>;
      case 'closed':
        return <Badge variant="secondary">Closed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  if (rfqs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No RFQs found. Create your first RFQ to get started.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rfqs.map((rfq) => (
              <TableRow key={rfq.id}>
                <TableCell className="font-medium">
                  {rfq.title || 'Untitled RFQ'}
                </TableCell>
                <TableCell>
                  {rfq.category ? (
                    <Badge variant="outline">{rfq.category}</Badge>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>{rfq.quantity?.toLocaleString() || '-'}</TableCell>
                <TableCell>{getStatusBadge(rfq.status)}</TableCell>
                <TableCell>
                  {rfq.createdAt
                    ? format(new Date(rfq.createdAt), 'MMM dd, yyyy')
                    : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/buyer/rfqs/${rfq.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    {rfq.status === 'draft' && (
                      <Link href={`/buyer/rfqs/new?draftId=${rfq.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-600">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalDocs)} of {totalDocs} RFQs
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
