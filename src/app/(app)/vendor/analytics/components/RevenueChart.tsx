'use client';

import { trpc } from '@/trpc/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface RevenueChartProps {
  startDate: string;
  endDate: string;
}

export function RevenueChart({ startDate, endDate }: RevenueChartProps) {
  const { data, isLoading, error } = trpc.vendors.analytics.revenue.useQuery({
    startDate,
    endDate,
    groupBy: 'day',
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Over Time</CardTitle>
          <CardDescription>Daily revenue breakdown</CardDescription>
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
          <CardTitle>Revenue Over Time</CardTitle>
          <CardDescription>Daily revenue breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">Error loading revenue data: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data?.data.map((item) => ({
    date: format(new Date(item.date), 'MMM dd'),
    revenue: Number(item.revenue.toFixed(2)),
  })) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Over Time</CardTitle>
        <CardDescription>
          Total Revenue: ${data?.totalRevenue.toFixed(2) || '0.00'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} name="Revenue ($)" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
