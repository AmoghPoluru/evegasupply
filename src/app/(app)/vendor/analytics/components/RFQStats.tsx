'use client';

import { trpc } from '@/trpc/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface RFQStatsProps {
  startDate: string;
  endDate: string;
}

export function RFQStats({ startDate, endDate }: RFQStatsProps) {
  const { data, isLoading, error } = trpc.vendors.analytics.rfqStats.useQuery({
    startDate,
    endDate,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>RFQ Statistics</CardTitle>
          <CardDescription>RFQ and quote performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>RFQ Statistics</CardTitle>
          <CardDescription>RFQ and quote performance</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">Error loading RFQ stats: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>RFQ Statistics</CardTitle>
        <CardDescription>RFQ and quote performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total RFQs</p>
            <p className="text-2xl font-bold">{data?.totalRFQs || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Quotes Submitted</p>
            <p className="text-2xl font-bold">{data?.quotesSubmitted || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Quotes Accepted</p>
            <p className="text-2xl font-bold text-green-600">{data?.quotesAccepted || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Acceptance Rate</p>
            <p className="text-2xl font-bold">
              {data?.quoteAcceptanceRate.toFixed(1) || '0.0'}%
            </p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600">Average Quote Value</p>
          <p className="text-2xl font-bold text-green-600">
            ${data?.averageQuoteValue.toFixed(2) || '0.00'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
