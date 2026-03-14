import { requireBuyer } from '@/lib/middleware/buyer-auth';
import { getPayload } from 'payload';
import config from '@payload-config';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { OrderDetailClient } from './OrderDetailClient';

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireBuyer();
  const { id } = await params;
  const payload = await getPayload({ config });

  try {
    const order = await payload.findByID({
      collection: 'orders',
      id,
      depth: 2,
    });

    // Verify order belongs to buyer
    const headersList = await headers();
    const { user } = await payload.auth({ headers: headersList });

    if (!user) {
      notFound();
    }

    const orderBuyerId = typeof order.buyer === 'string' ? order.buyer : (order.buyer as any)?.id;
    if (orderBuyerId !== user.id) {
      notFound();
    }

    return <OrderDetailClient order={order} />;
  } catch (error) {
    notFound();
  }
}
