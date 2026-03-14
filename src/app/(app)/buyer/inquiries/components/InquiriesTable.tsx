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
import { Eye } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface Inquiry {
  id: string;
  product?: any;
  supplier?: any;
  subject?: string;
  status?: string;
  lastRepliedAt?: string;
  createdAt?: string;
}

interface InquiriesTableProps {
  inquiries: Inquiry[];
  totalDocs: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function InquiriesTable({
  inquiries,
  totalDocs,
  page,
  totalPages,
  onPageChange,
}: InquiriesTableProps) {
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="default">New</Badge>;
      case 'replied':
        return <Badge variant="default">Replied</Badge>;
      case 'closed':
        return <Badge variant="secondary">Closed</Badge>;
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  const getProductName = (product: any) => {
    if (!product) return 'General Inquiry';
    if (typeof product === 'string') return product;
    return product?.title || product?.name || 'Product';
  };

  const getSupplierName = (supplier: any) => {
    if (!supplier) return 'N/A';
    if (typeof supplier === 'string') return supplier;
    return supplier?.companyName || 'Supplier';
  };

  if (inquiries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No inquiries found.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product/Vendor</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Reply</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inquiries.map((inquiry) => (
              <TableRow key={inquiry.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{getProductName(inquiry.product)}</div>
                    <div className="text-sm text-gray-500">{getSupplierName(inquiry.supplier)}</div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {inquiry.subject || 'No subject'}
                </TableCell>
                <TableCell>{getStatusBadge(inquiry.status)}</TableCell>
                <TableCell>
                  {inquiry.lastRepliedAt
                    ? format(new Date(inquiry.lastRepliedAt), 'MMM dd, yyyy')
                    : '-'}
                </TableCell>
                <TableCell>
                  {inquiry.createdAt
                    ? format(new Date(inquiry.createdAt), 'MMM dd, yyyy')
                    : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/buyer/inquiries/${inquiry.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-600">
            Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, totalDocs)} of {totalDocs} inquiries
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
