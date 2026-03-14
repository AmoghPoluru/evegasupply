'use client';

import { useState } from 'react';
import { trpc } from '@/trpc/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RevenueChart } from './RevenueChart';
import { OrderStats } from './OrderStats';
import { ProductPerformance } from './ProductPerformance';
import { RFQStats } from './RFQStats';
import { InquiryStats } from './InquiryStats';
import { Download } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');
  const [startDate, setStartDate] = useState<string>(
    format(startOfDay(subDays(new Date(), 30)), 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState<string>(
    format(endOfDay(new Date()), 'yyyy-MM-dd')
  );

  const handleDateRangeChange = (value: string) => {
    setDateRange(value as '7d' | '30d' | '90d' | 'custom');
    if (value !== 'custom') {
      const days = value === '7d' ? 7 : value === '30d' ? 30 : 90;
      setStartDate(format(startOfDay(subDays(new Date(), days)), 'yyyy-MM-dd'));
      setEndDate(format(endOfDay(new Date()), 'yyyy-MM-dd'));
    }
  };

  const revenueData = trpc.vendors.analytics.revenue.useQuery({ startDate, endDate });
  const orderStatsData = trpc.vendors.analytics.orderStats.useQuery({ startDate, endDate });
  const productData = trpc.vendors.analytics.productPerformance.useQuery({ startDate, endDate, limit: 1000 });
  const rfqData = trpc.vendors.analytics.rfqStats.useQuery({ startDate, endDate });
  const inquiryData = trpc.vendors.analytics.inquiryStats.useQuery({ startDate, endDate });

  const handleExport = (format: 'csv' | 'excel') => {
    try {
      let csvContent = '';
      
      // Revenue data
      if (revenueData.data) {
        csvContent += 'Revenue Data\n';
        csvContent += 'Date,Revenue\n';
        revenueData.data.data.forEach((item) => {
          csvContent += `${item.date},${item.revenue.toFixed(2)}\n`;
        });
        csvContent += `\nTotal Revenue,${revenueData.data.totalRevenue.toFixed(2)}\n\n`;
      }

      // Order stats
      if (orderStatsData.data) {
        csvContent += 'Order Statistics\n';
        csvContent += 'Metric,Value\n';
        csvContent += `Total Orders,${orderStatsData.data.totalOrders}\n`;
        csvContent += `Total Revenue,${orderStatsData.data.totalRevenue.toFixed(2)}\n`;
        csvContent += `Average Order Value,${orderStatsData.data.averageOrderValue.toFixed(2)}\n`;
        csvContent += '\nOrders by Status\n';
        csvContent += 'Status,Count\n';
        Object.entries(orderStatsData.data.ordersByStatus).forEach(([status, count]) => {
          csvContent += `${status},${count}\n`;
        });
        csvContent += '\n';
      }

      // Product performance
      if (productData.data) {
        csvContent += 'Product Performance\n';
        csvContent += 'Product Name,Sales Count,Revenue\n';
        productData.data.forEach((product) => {
          csvContent += `${product.name},${product.salesCount},${product.revenue.toFixed(2)}\n`;
        });
        csvContent += '\n';
      }

      // RFQ stats
      if (rfqData.data) {
        csvContent += 'RFQ Statistics\n';
        csvContent += 'Metric,Value\n';
        csvContent += `Total RFQs,${rfqData.data.totalRFQs}\n`;
        csvContent += `Quotes Submitted,${rfqData.data.quotesSubmitted}\n`;
        csvContent += `Quotes Accepted,${rfqData.data.quotesAccepted}\n`;
        csvContent += `Acceptance Rate,${rfqData.data.quoteAcceptanceRate.toFixed(2)}%\n`;
        csvContent += `Average Quote Value,${rfqData.data.averageQuoteValue.toFixed(2)}\n`;
        csvContent += '\n';
      }

      // Inquiry stats
      if (inquiryData.data) {
        csvContent += 'Inquiry Statistics\n';
        csvContent += 'Metric,Value\n';
        csvContent += `Total Inquiries,${inquiryData.data.totalInquiries}\n`;
        csvContent += `Average Response Time,${inquiryData.data.averageResponseTime ? inquiryData.data.averageResponseTime.toFixed(2) + ' hours' : 'N/A'}\n`;
        csvContent += '\nInquiries by Status\n';
        csvContent += 'Status,Count\n';
        Object.entries(inquiryData.data.inquiriesByStatus).forEach(([status, count]) => {
          csvContent += `${status},${count}\n`;
        });
      }

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `analytics-export-${format === 'csv' ? new Date().toISOString().split('T')[0] : 'data'}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert('Error exporting data. Please try again.');
      console.error('Export error:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>View your business performance metrics</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={dateRange} onValueChange={handleDateRangeChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="custom">Custom range</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('excel')}>
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Revenue Chart */}
      <RevenueChart startDate={startDate} endDate={endDate} />

      {/* Order Statistics */}
      <OrderStats startDate={startDate} endDate={endDate} />

      {/* Product Performance */}
      <ProductPerformance startDate={startDate} endDate={endDate} />

      {/* RFQ Statistics */}
      <RFQStats startDate={startDate} endDate={endDate} />

      {/* Inquiry Statistics */}
      <InquiryStats startDate={startDate} endDate={endDate} />
    </div>
  );
}
