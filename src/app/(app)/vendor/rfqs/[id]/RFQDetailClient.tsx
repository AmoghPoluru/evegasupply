'use client';

import { trpc } from '@/trpc/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface RFQDetailClientProps {
  rfqId: string;
  initialRFQ: any;
}

export function RFQDetailClient({ rfqId, initialRFQ }: RFQDetailClientProps) {
  const { data, isLoading } = trpc.vendors.rfqs.getById.useQuery(
    { id: rfqId },
    { initialData: { ...initialRFQ, hasQuoted: false, quote: null } }
  );

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const rfq = data || initialRFQ;
  const buyer = typeof rfq.buyer === 'object' ? rfq.buyer : null;
  const buyerName = buyer?.name || buyer?.email || 'Unknown Buyer';

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/vendor/rfqs"
          className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to RFQs
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">
          {rfq.title || 'RFQ Details'}
        </h1>
        <p className="text-sm text-gray-600 mt-1">View RFQ details and submit a quote</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RFQ Information */}
        <Card>
          <CardHeader>
            <CardTitle>RFQ Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableHead className="w-[150px]">Title</TableHead>
                  <TableCell>{rfq.title || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHead>Buyer</TableHead>
                  <TableCell>{buyerName}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableCell>
                    {rfq.category ? (
                      <Badge variant="outline">{rfq.category}</Badge>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableHead>Quantity</TableHead>
                  <TableCell>{rfq.quantity?.toLocaleString() || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHead>Budget Range</TableHead>
                  <TableCell>
                    {rfq.budgetRange?.min && rfq.budgetRange?.max
                      ? `$${rfq.budgetRange.min.toLocaleString()} - $${rfq.budgetRange.max.toLocaleString()}`
                      : rfq.budgetRange?.min
                      ? `$${rfq.budgetRange.min.toLocaleString()}+`
                      : '-'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableHead>Deadline</TableHead>
                  <TableCell>
                    {rfq.deadline
                      ? format(new Date(rfq.deadline), 'MMM dd, yyyy')
                      : '-'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableCell>
                    <Badge
                      variant={
                        rfq.status === 'open'
                          ? 'default'
                          : rfq.status === 'closed'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {rfq.status || 'Unknown'}
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Description & Specifications */}
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {rfq.description || 'No description provided'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Specifications */}
      {rfq.specifications && Array.isArray(rfq.specifications) && rfq.specifications.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {rfq.specifications.map((spec: any, index: number) => (
                  <TableRow key={index}>
                    <TableHead className="w-[200px]">{spec.key || 'Specification'}</TableHead>
                    <TableCell>{spec.value || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Quote Status & Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quote Status</CardTitle>
        </CardHeader>
        <CardContent>
          {rfq.hasQuoted && rfq.quote ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="default">Quote Submitted</Badge>
                  <p className="text-sm text-gray-600 mt-2">
                    You have already submitted a quote for this RFQ.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/vendor/rfqs/${rfqId}/quote?edit=true`}>
                    <Button variant="outline">Edit Quote</Button>
                  </Link>
                  <Link href={`/vendor/quotes/${rfq.quote.id}`}>
                    <Button>View Quote</Button>
                  </Link>
                </div>
              </div>
              {rfq.quote.totalPrice && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">Your Quote Price</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${rfq.quote.totalPrice.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <Badge variant="outline">Not Quoted</Badge>
                <p className="text-sm text-gray-600 mt-2">
                  Submit a quote to respond to this RFQ.
                </p>
              </div>
              <Link href={`/vendor/rfqs/${rfqId}/quote`}>
                <Button>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Submit Quote
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
