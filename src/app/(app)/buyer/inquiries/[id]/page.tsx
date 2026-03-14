import { requireBuyer } from '@/lib/middleware/buyer-auth';
import { getPayload } from 'payload';
import config from '@payload-config';
import { notFound, headers } from 'next/navigation';
import { InquiryDetailClient } from './InquiryDetailClient';

export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireBuyer();
  const { id } = await params;
  const payload = await getPayload({ config });

  try {
    const inquiry = await payload.findByID({
      collection: 'inquiries',
      id,
      depth: 2,
    });

    // Verify inquiry belongs to buyer
    const headersList = await headers();
    const { user } = await payload.auth({ headers: headersList });

    if (!user) {
      notFound();
    }

    const inquiryBuyerId = typeof inquiry.buyer === 'string' ? inquiry.buyer : (inquiry.buyer as any)?.id;
    if (inquiryBuyerId !== user.id) {
      notFound();
    }

    return <InquiryDetailClient inquiry={inquiry} />;
  } catch (error) {
    notFound();
  }
}
