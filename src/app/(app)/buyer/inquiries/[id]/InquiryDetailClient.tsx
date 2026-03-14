'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useState } from 'react';
import { trpc } from '@/trpc/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface InquiryDetailClientProps {
  inquiry: any;
}

export function InquiryDetailClient({ inquiry }: InquiryDetailClientProps) {
  const [replyMessage, setReplyMessage] = useState('');
  const utils = trpc.useUtils();

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

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/buyer/inquiries"
          className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Inquiries
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">
          {inquiry.subject || 'Inquiry Details'}
        </h1>
        <p className="text-sm text-gray-600 mt-1">View and manage inquiry thread</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inquiry Thread */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Inquiry Thread</CardTitle>
                {getStatusBadge(inquiry.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Original Message */}
              <div className="border-l-4 border-blue-600 pl-4 py-2">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium">You</p>
                    <p className="text-xs text-gray-500">
                      {inquiry.createdAt
                        ? format(new Date(inquiry.createdAt), 'MMM dd, yyyy HH:mm')
                        : '-'}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {inquiry.message || '-'}
                </p>
                {inquiry.attachments && Array.isArray(inquiry.attachments) && inquiry.attachments.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 mb-1">Attachments:</p>
                    <div className="flex gap-2">
                      {inquiry.attachments.map((att: any, index: number) => {
                        const attId = typeof att === 'string' ? att : att.id;
                        return (
                          <a
                            key={index}
                            href={`/media/${attId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Attachment {index + 1}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Reply Form */}
              {inquiry.status !== 'closed' && (
                <div className="border-t pt-4">
                  <Textarea
                    placeholder="Type your reply..."
                    rows={4}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="mb-2"
                  />
                  <Button size="sm">
                    <Send className="w-4 h-4 mr-2" />
                    Send Reply
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inquiry Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Type:</span>{' '}
                <Badge variant="outline">{inquiry.inquiryType || 'general'}</Badge>
              </div>
              <div>
                <span className="text-gray-600">Product:</span>{' '}
                {getProductName(inquiry.product)}
              </div>
              <div>
                <span className="text-gray-600">Supplier:</span>{' '}
                {getSupplierName(inquiry.supplier)}
              </div>
              <div>
                <span className="text-gray-600">Status:</span>{' '}
                {getStatusBadge(inquiry.status)}
              </div>
              <div>
                <span className="text-gray-600">Created:</span>{' '}
                {inquiry.createdAt
                  ? format(new Date(inquiry.createdAt), 'MMM dd, yyyy')
                  : '-'}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
