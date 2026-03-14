'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Package, MapPin, CreditCard, Truck } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface OrderDetailClientProps {
  order: any;
}

export function OrderDetailClient({ order }: OrderDetailClientProps) {
  const getSupplierName = (supplier: any) => {
    if (typeof supplier === 'string') return supplier;
    return supplier?.companyName || 'Unknown Supplier';
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'processing':
        return <Badge variant="default">Processing</Badge>;
      case 'shipped':
        return <Badge variant="default">Shipped</Badge>;
      case 'delivered':
        return <Badge variant="default">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/buyer/orders"
          className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Orders
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">
          Order #{order.orderNumber || order.id.slice(0, 8)}
        </h1>
        <p className="text-sm text-gray-600 mt-1">Order details and tracking</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableHead className="w-[150px]">Order Number</TableHead>
                    <TableCell>{order.orderNumber || order.id.slice(0, 8)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Total Amount</TableHead>
                    <TableCell className="font-semibold">
                      ${order.totalAmount?.toFixed(2) || '0.00'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Order Date</TableHead>
                    <TableCell>
                      {order.createdAt
                        ? format(new Date(order.createdAt), 'MMM dd, yyyy')
                        : '-'}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Products */}
          {order.products && Array.isArray(order.products) && order.products.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.products.map((item: any, index: number) => {
                      const product = typeof item.product === 'object' ? item.product : null;
                      return (
                        <TableRow key={index}>
                          <TableCell>{product?.title || product?.name || 'Product'}</TableCell>
                          <TableCell>{item.quantity || '-'}</TableCell>
                          <TableCell>${item.unitPrice?.toFixed(2) || '-'}</TableCell>
                          <TableCell>${item.totalPrice?.toFixed(2) || '-'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Vendor Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{getSupplierName(order.supplier)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Status:</span>{' '}
                  <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'outline'}>
                    {order.paymentStatus || 'Pending'}
                  </Badge>
                </div>
                {order.paymentMethod && (
                  <div>
                    <span className="text-gray-600">Method:</span> {order.paymentMethod}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Shipping
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.shippingAddress ? (
                <div className="text-sm space-y-2">
                  <div>{order.shippingAddress}</div>
                  {order.trackingNumber && (
                    <div>
                      <span className="text-gray-600">Tracking:</span>{' '}
                      <a href="#" className="text-blue-600 hover:underline">
                        {order.trackingNumber}
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No shipping information</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download Invoice
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                Contact Vendor
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
