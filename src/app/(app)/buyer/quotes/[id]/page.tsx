import { requireBuyer } from '@/lib/middleware/buyer-auth';
import { getPayload } from 'payload';
import config from '@payload-config';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { QuoteDetailClient } from './QuoteDetailClient';

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireBuyer();
  const { id } = await params;
  const payload = await getPayload({ config });

  try {
    const quote = await payload.findByID({
      collection: 'quotes',
      id,
      depth: 2,
    });

    // Verify quote's RFQ belongs to buyer
    const headersList = await headers();
    const { user } = await payload.auth({ headers: headersList });

    if (!user) {
      notFound();
    }

    const rfqId = typeof quote.rfq === 'string' ? quote.rfq : (quote.rfq as any)?.id;
    const rfq = await payload.findByID({
      collection: 'rfqs',
      id: rfqId,
    });

    const rfqBuyerId = typeof rfq.buyer === 'string' ? rfq.buyer : (rfq.buyer as any)?.id;

    if (rfqBuyerId !== user.id) {
      notFound();
    }

    return <QuoteDetailClient quote={quote} />;
  } catch (error) {
    notFound();
  }
}
