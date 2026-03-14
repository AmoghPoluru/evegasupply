import { requireVendor } from '@/lib/middleware/vendor-auth';
import { getPayload } from 'payload';
import config from '@payload-config';
import { notFound } from 'next/navigation';
import { ProductForm } from '../../components/ProductForm';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const vendor = await requireVendor();
  const { id } = await params;
  const payload = await getPayload({ config });

  try {
    const product = await payload.findByID({
      collection: 'products',
      id,
    });

    // Verify product belongs to vendor
    const supplierId = typeof product.supplier === 'string'
      ? product.supplier
      : (product.supplier as any)?.id;

    if (supplierId !== vendor.id) {
      notFound();
    }

    // Prepare initial values
    const images = product.images
      ? (Array.isArray(product.images)
          ? product.images.map((img: any) => (typeof img === 'string' ? img : img.id))
          : [])
      : [];

    const initialValues = {
      id: product.id,
      title: product.title || '',
      description: product.description || '',
      category: product.category || '',
      unitPrice: product.unitPrice || 0,
      moq: product.moq || 1,
      sku: (product as any).sku || '',
      images,
    };

    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Edit Product</h1>
          <p className="text-sm text-gray-600 mt-1">
            Update your product information
          </p>
        </div>

        <ProductForm initialValues={initialValues} mode="edit" />
      </div>
    );
  } catch (error) {
    notFound();
  }
}
