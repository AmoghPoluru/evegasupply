import { requireVendor } from '@/lib/middleware/vendor-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function ProductImportPage() {
  await requireVendor();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Import Products</h1>
        <p className="text-sm text-gray-600 mt-1">
          Bulk import products from CSV file
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>CSV Import</CardTitle>
          <CardDescription>
            Bulk product import functionality coming soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            This section will allow you to upload a CSV file to bulk import products.
            Products will be automatically assigned to your vendor account.
          </p>
          <p className="text-xs text-gray-500">
            CSV format: name, price, category, moq, description, sku
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
