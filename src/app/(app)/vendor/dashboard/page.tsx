import { requireVendor } from '@/lib/middleware/vendor-auth';
import { StatsCards } from './components/StatsCards';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function VendorDashboardPage() {
  const vendor = await requireVendor();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">
          Welcome back, {vendor.companyName || 'Vendor'}!
        </p>
      </div>

      <StatsCards vendorId={vendor.id} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest activities and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">No recent activity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <a
                href="/vendor/products/new"
                className="block text-sm text-blue-600 hover:underline"
              >
                Add New Product
              </a>
              <a
                href="/vendor/rfqs"
                className="block text-sm text-blue-600 hover:underline"
              >
                View RFQs
              </a>
              <a
                href="/vendor/orders"
                className="block text-sm text-blue-600 hover:underline"
              >
                View Orders
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
