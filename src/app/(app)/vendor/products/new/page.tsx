import { requireVendor } from '@/lib/middleware/vendor-auth';
import { ProductForm } from '../components/ProductForm';

export default async function NewProductPage() {
  await requireVendor();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Add New Product</h1>
        <p className="text-sm text-gray-600 mt-1">
          Create a new product for your catalog
        </p>
      </div>

      <ProductForm />
    </div>
  );
}
