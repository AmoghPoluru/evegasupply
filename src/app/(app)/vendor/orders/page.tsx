import { requireVendor } from '@/lib/middleware/vendor-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function VendorOrdersPage() {
  await requireVendor();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage orders containing your products
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
          <CardDescription>
            Order listing and status management functionality coming soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            This section will display orders that contain your products.
            You'll be able to view order details, update status, and manage shipping.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
