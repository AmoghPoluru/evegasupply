'use client';

import { useState } from 'react';
import { trpc } from '@/trpc/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, AlertCircle, Eye, Edit, X } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function VendorQuotesPage() {
  const [page, setPage] = useState(1);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [quoteToWithdraw, setQuoteToWithdraw] = useState<any>(null);
  const limit = 20;
  const utils = trpc.useUtils();

  const { data, isLoading, error } = trpc.vendors.rfqs.getQuotes.useQuery({
    limit,
    page,
  });

  const withdrawMutation = trpc.vendors.rfqs.withdrawQuote.useMutation({
    onSuccess: () => {
      toast.success('Quote withdrawn successfully');
      utils.vendors.rfqs.getQuotes.invalidate();
      setWithdrawDialogOpen(false);
      setQuoteToWithdraw(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to withdraw quote');
    },
  });

  const handleWithdrawClick = (quote: any) => {
    setQuoteToWithdraw(quote);
    setWithdrawDialogOpen(true);
  };

  const handleWithdrawConfirm = () => {
    if (quoteToWithdraw) {
      withdrawMutation.mutate({ quoteId: quoteToWithdraw.id });
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
      case 'withdrawn':
        return <Badge variant="secondary">Withdrawn</Badge>;
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  const getRFQTitle = (quote: any) => {
    const rfq = typeof quote.rfq === 'object' ? quote.rfq : null;
    return rfq?.title || 'Unknown RFQ';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <p>Error loading quotes: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">My Quotes</h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage your submitted quotes
        </p>
      </div>

      {!data || data.quotes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">No quotes found. Submit quotes for RFQs to see them here.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>RFQ Title</TableHead>
                  <TableHead>Quote Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.quotes.map((quote: any) => {
                  const rfq = typeof quote.rfq === 'object' ? quote.rfq : null;
                  const canEdit = rfq?.status === 'open' && quote.status === 'pending';
                  const canWithdraw = quote.status === 'pending' || quote.status === 'rejected';

                  return (
                    <TableRow key={quote.id}>
                      <TableCell className="font-medium">
                        {getRFQTitle(quote)}
                      </TableCell>
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
                          {rfq && (
                            <Link href={`/vendor/rfqs/${rfq.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                View RFQ
                              </Button>
                            </Link>
                          )}
                          {canEdit && (
                            <Link href={`/vendor/rfqs/${rfq?.id}/quote?edit=true`}>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                            </Link>
                          )}
                          {canWithdraw && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600"
                              onClick={() => handleWithdrawClick(quote)}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Withdraw
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, data.totalDocs)} of {data.totalDocs} quotes
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= data.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw Quote</DialogTitle>
            <DialogDescription>
              Are you sure you want to withdraw this quote? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setWithdrawDialogOpen(false);
                setQuoteToWithdraw(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleWithdrawConfirm}
              disabled={withdrawMutation.isPending}
            >
              {withdrawMutation.isPending ? 'Withdrawing...' : 'Withdraw Quote'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
