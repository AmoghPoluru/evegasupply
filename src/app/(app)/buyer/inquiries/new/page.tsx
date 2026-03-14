import { requireBuyer } from '@/lib/middleware/buyer-auth';
import { InquiryForm } from './components/InquiryForm';

export default async function SendInquiryPage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string; supplierId?: string }>;
}) {
  await requireBuyer();
  const { productId, supplierId } = await searchParams;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Send Inquiry</h1>
        <p className="text-sm text-gray-600 mt-1">
          Send an inquiry to a vendor
        </p>
      </div>

      <InquiryForm productId={productId} supplierId={supplierId} />
    </div>
  );
}
