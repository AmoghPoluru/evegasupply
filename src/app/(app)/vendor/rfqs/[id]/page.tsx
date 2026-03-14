import { requireVendor } from '@/lib/middleware/vendor-auth';
import { getPayload } from 'payload';
import config from '@payload-config';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { RFQDetailClient } from './RFQDetailClient';

export default async function RFQDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireVendor();
  const { id } = await params;
  const payload = await getPayload({ config });

  try {
    const rfq = await payload.findByID({
      collection: 'rfqs',
      id,
      depth: 2,
    });

    // Check if vendor has quoted (will be done client-side via tRPC)
    return <RFQDetailClient rfqId={id} initialRFQ={rfq} />;
  } catch (error) {
    notFound();
  }
}
