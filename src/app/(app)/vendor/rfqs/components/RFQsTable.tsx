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
import { Eye, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface RFQ {
  id: string;
  title?: string;
  buyer?: any;
  category?: string;
  quantity?: number;
  budgetRange?: {
    min?: number;
    max?: number;
  };
  deadline?: string;
  status?: string;
  hasQuoted?: boolean;
  quote?: any;
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
      case 'new':
        return <Badge variant="default">New</Badge>;
      case 'open':
        return <Badge variant="default">Open</Badge>;
      case 'closed':
        return <Badge variant="secondary">Closed</Badge>;
      case 'awarded':
        return <Badge variant="default">Awarded</Badge>;
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  const getBuyerName = (buyer: any) => {
    if (typeof buyer === 'string') return buyer;
    return buyer?.name || buyer?.email || 'Unknown Buyer';
  };

  const getBudgetDisplay = (budgetRange?: { min?: number; max?: number }) => {
    if (!budgetRange) return '-';
    if (budgetRange.min && budgetRange.max) {
      return `$${budgetRange.min.toLocaleString()} - $${budgetRange.max.toLocaleString()}`;
    }
    if (budgetRange.min) {
      return `$${budgetRange.min.toLocaleString()}+`;
    }
    return '-';
  };

  if (rfqs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No RFQs found.</p>
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
              <TableHead>Buyer</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Quote Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rfqs.map((rfq) => (
              <TableRow key={rfq.id}>
                <TableCell className="font-medium">
                  {rfq.title || 'Untitled RFQ'}
                </TableCell>
                <TableCell>{getBuyerName(rfq.buyer)}</TableCell>
                <TableCell>
                  {rfq.category ? (
                    <Badge variant="outline">{rfq.category}</Badge>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>{rfq.quantity?.toLocaleString() || '-'}</TableCell>
                <TableCell>{getBudgetDisplay(rfq.budgetRange)}</TableCell>
                <TableCell>
                  {rfq.deadline
                    ? format(new Date(rfq.deadline), 'MMM dd, yyyy')
                    : '-'}
                </TableCell>
                <TableCell>{getStatusBadge(rfq.status)}</TableCell>
                <TableCell>
                  {rfq.hasQuoted ? (
                    <Badge variant="default">Quoted</Badge>
                  ) : (
                    <Badge variant="outline">Not Quoted</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/vendor/rfqs/${rfq.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    {!rfq.hasQuoted && (
                      <Link href={`/vendor/rfqs/${rfq.id}/quote`}>
                        <Button variant="default" size="sm">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Quote
                        </Button>
                      </Link>
                    )}
                    {rfq.hasQuoted && rfq.quote && (
                      <Link href={`/vendor/quotes/${rfq.quote.id}`}>
                        <Button variant="outline" size="sm">
                          View Quote
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
            Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, totalDocs)} of {totalDocs} RFQs
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
