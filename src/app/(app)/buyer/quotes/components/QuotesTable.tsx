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
import { Eye, Check, X } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { trpc } from '@/trpc/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';

interface Quote {
  id: string;
  rfq?: any;
  supplier?: any;
  totalPrice?: number;
  status?: string;
  submittedAt?: string;
  createdAt?: string;
}

interface QuotesTableProps {
  quotes: Quote[];
  totalDocs: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function QuotesTable({
  quotes,
  totalDocs,
  page,
  totalPages,
  onPageChange,
}: QuotesTableProps) {
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const utils = trpc.useUtils();

  const acceptMutation = trpc.buyers.quotes.accept.useMutation({
    onSuccess: () => {
      toast.success('Quote accepted successfully!');
      utils.buyers.quotes.list.invalidate();
      setAcceptDialogOpen(false);
      setSelectedQuote(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to accept quote');
    },
  });

  const rejectMutation = trpc.buyers.quotes.reject.useMutation({
    onSuccess: () => {
      toast.success('Quote rejected');
      utils.buyers.quotes.list.invalidate();
      setRejectDialogOpen(false);
      setSelectedQuote(null);
      setRejectReason('');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reject quote');
    },
  });

  const handleAcceptClick = (quote: Quote) => {
    setSelectedQuote(quote);
    setAcceptDialogOpen(true);
  };

  const handleRejectClick = (quote: Quote) => {
    setSelectedQuote(quote);
    setRejectDialogOpen(true);
  };

  const handleAcceptConfirm = () => {
    if (selectedQuote) {
      acceptMutation.mutate({ quoteId: selectedQuote.id });
    }
  };

  const handleRejectConfirm = () => {
    if (selectedQuote) {
      rejectMutation.mutate({
        quoteId: selectedQuote.id,
        reason: rejectReason || undefined,
      });
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'accepted':
        return <Badge variant="default">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  const getRFQTitle = (rfq: any) => {
    if (!rfq) return 'Unknown RFQ';
    if (typeof rfq === 'string') return rfq;
    return rfq?.title || 'Untitled RFQ';
  };

  const getSupplierName = (supplier: any) => {
    if (!supplier) return 'Unknown Supplier';
    if (typeof supplier === 'string') return supplier;
    return supplier?.companyName || 'Supplier';
  };

  if (quotes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No quotes found.</p>
      </div>
    );
  }

  return (
    <>
      <div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>RFQ Title</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Quote Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">
                    {getRFQTitle(quote.rfq)}
                  </TableCell>
                  <TableCell>{getSupplierName(quote.supplier)}</TableCell>
                  <TableCell>
                    {quote.totalPrice
                      ? `$${quote.totalPrice.toFixed(2)}`
                      : '-'}
                  </TableCell>
                  <TableCell>{getStatusBadge(quote.status)}</TableCell>
                  <TableCell>
                    {quote.submittedAt
                      ? format(new Date(quote.submittedAt), 'MMM dd, yyyy')
                      : quote.createdAt
                      ? format(new Date(quote.createdAt), 'MMM dd, yyyy')
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/buyer/quotes/${quote.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </Link>
                      {quote.status === 'pending' && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleAcceptClick(quote)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRejectClick(quote)}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
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
              Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, totalDocs)} of {totalDocs} quotes
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

      {/* Accept Dialog */}
      <Dialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Quote</DialogTitle>
            <DialogDescription>
              Are you sure you want to accept this quote? This action will create an order and notify the vendor.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAcceptDialogOpen(false);
                setSelectedQuote(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAcceptConfirm}
              disabled={acceptMutation.isPending}
            >
              {acceptMutation.isPending ? 'Accepting...' : 'Accept Quote'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Quote</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this quote? You can optionally provide a reason.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <textarea
              placeholder="Rejection reason (optional)"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full border rounded-md p-2 text-sm"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setSelectedQuote(null);
                setRejectReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? 'Rejecting...' : 'Reject Quote'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
