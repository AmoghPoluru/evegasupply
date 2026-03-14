import { requireVendor } from '@/lib/middleware/vendor-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function VendorSettingsPage() {
  await requireVendor();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage your vendor account settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vendor Settings</CardTitle>
          <CardDescription>
            Settings management functionality coming soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            This section will allow you to update your vendor profile,
            company information, and account preferences.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
