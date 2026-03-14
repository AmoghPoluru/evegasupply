'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Check, X, FileText } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { trpc } from '@/trpc/client';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface QuoteDetailClientProps {
  quote: any;
}

export function QuoteDetailClient({ quote }: QuoteDetailClientProps) {
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const utils = trpc.useUtils();

  const acceptMutation = trpc.buyers.quotes.accept.useMutation({
    onSuccess: () => {
      toast.success('Quote accepted successfully!');
      utils.buyers.quotes.list.invalidate();
      setAcceptDialogOpen(false);
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
      setRejectReason('');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reject quote');
    },
  });

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

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/buyer/quotes"
          className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Quotes
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Quote Details</h1>
        <p className="text-sm text-gray-600 mt-1">Review quote details and take action</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quote Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Quote Information</CardTitle>
                {getStatusBadge(quote.status)}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableHead className="w-[150px]">RFQ</TableHead>
                    <TableCell>{getRFQTitle(quote.rfq)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableCell>{getSupplierName(quote.supplier)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Total Price</TableHead>
                    <TableCell className="font-semibold text-lg">
                      ${quote.totalPrice?.toFixed(2) || '0.00'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Unit Price</TableHead>
                    <TableCell>${quote.unitPrice?.toFixed(2) || '-'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>MOQ</TableHead>
                    <TableCell>{quote.moq || '-'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Lead Time</TableHead>
                    <TableCell>{quote.leadTime || '-'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Submitted</TableHead>
                    <TableCell>
                      {quote.submittedAt
                        ? format(new Date(quote.submittedAt), 'MMM dd, yyyy')
                        : quote.createdAt
                        ? format(new Date(quote.createdAt), 'MMM dd, yyyy')
                        : '-'}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {quote.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{quote.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quote.status === 'pending' && (
                <>
                  <Button
                    className="w-full"
                    onClick={() => setAcceptDialogOpen(true)}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Accept Quote
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setRejectDialogOpen(true)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject Quote
                  </Button>
                </>
              )}
              <Link href={`/buyer/rfqs/${quote.rfq?.id || ''}`}>
                <Button variant="outline" className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  View RFQ
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vendor Info</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{getSupplierName(quote.supplier)}</p>
              {quote.supplier && typeof quote.supplier === 'object' && (
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  {quote.supplier.factoryLocation && (
                    <p>Location: {quote.supplier.factoryLocation}</p>
                  )}
                  {quote.supplier.verifiedSupplier && (
                    <Badge variant="default" className="mt-2">Verified Supplier</Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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
              onClick={() => setAcceptDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => acceptMutation.mutate({ quoteId: quote.id })}
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
            <Textarea
              placeholder="Rejection reason (optional)"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => rejectMutation.mutate({
                quoteId: quote.id,
                reason: rejectReason || undefined,
              })}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? 'Rejecting...' : 'Reject Quote'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
