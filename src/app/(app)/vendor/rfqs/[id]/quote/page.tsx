import { requireVendor } from '@/lib/middleware/vendor-auth';
import { getPayload } from 'payload';
import config from '@payload-config';
import { notFound } from 'next/navigation';
import { QuoteForm } from './QuoteForm';

export default async function QuoteSubmissionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  await requireVendor();
  const { id } = await params;
  const { edit } = await searchParams;
  const payload = await getPayload({ config });

  try {
    const rfq = await payload.findByID({
      collection: 'rfqs',
      id,
      depth: 2,
    });

    // If editing, get existing quote
    let existingQuote = null;
    if (edit === 'true') {
      const vendor = await requireVendor();
      const quotes = await payload.find({
        collection: 'quotes',
        where: {
          rfq: { equals: id },
          supplier: { equals: vendor.id },
        },
        limit: 1,
      });
      existingQuote = quotes.docs[0] || null;
    }

    return <QuoteForm rfq={rfq} existingQuote={existingQuote} />;
  } catch (error) {
    notFound();
  }
}
