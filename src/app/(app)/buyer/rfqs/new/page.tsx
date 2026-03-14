import { requireBuyer } from '@/lib/middleware/buyer-auth';
import { RFQForm } from './components/RFQForm';

export default async function CreateRFQPage({
  searchParams,
}: {
  searchParams: Promise<{ draftId?: string }>;
}) {
  await requireBuyer();
  const { draftId } = await searchParams;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Create RFQ</h1>
        <p className="text-sm text-gray-600 mt-1">
          Create a new Request for Quotation
        </p>
      </div>

      <RFQForm draftId={draftId} />
    </div>
  );
}
