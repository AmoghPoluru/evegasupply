import { requireVendor } from '@/lib/middleware/vendor-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function VendorInquiriesPage() {
  await requireVendor();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Inquiries</h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage product inquiries from buyers
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inquiry Management</CardTitle>
          <CardDescription>
            Inquiry listing and response functionality coming soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            This section will display inquiries about your products.
            You'll be able to view inquiry threads and respond to buyers.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
