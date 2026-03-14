import { getPayload } from 'payload';
import config from '@payload-config';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export interface VendorStatus {
  hasVendor: boolean;
  vendor: any | null;
  status: 'approved' | 'pending' | 'suspended' | null;
  isActive: boolean;
}

/**
 * Get vendor status for the current authenticated user
 * Used in server components to check vendor access
 */
export async function getVendorStatus(): Promise<VendorStatus> {
  const payload = await getPayload({ config });
  const headersList = await headers();
  
  // Get authenticated user from session
  const { user } = await payload.auth({ headers: headersList });
  
  if (!user) {
    return {
      hasVendor: false,
      vendor: null,
      status: null,
      isActive: false,
    };
  }

  // Find vendor associated with this user
  const vendorsResult = await payload.find({
    collection: 'vendors',
    where: { user: { equals: user.id } },
    limit: 1,
  });

  const vendor = vendorsResult.docs[0] ?? null;

  if (!vendor) {
    return {
      hasVendor: false,
      vendor: null,
      status: null,
      isActive: false,
    };
  }

  // Check vendor status
  // For now, we'll use verifiedSupplier as the approval status
  // You can add a custom status field later if needed
  const isVerified = vendor.verifiedSupplier === true;
  const isArchived = (vendor as any).isArchived === true;
  const isActive = !isArchived && isVerified;

  return {
    hasVendor: true,
    vendor,
    status: isVerified ? 'approved' : 'pending',
    isActive: isActive && isVerified,
  };
}

/**
 * Require vendor access - throws error or redirects if user doesn't have vendor
 * Use in server components to protect vendor routes
 */
export async function requireVendor(): Promise<any> {
  const status = await getVendorStatus();

  if (!status.hasVendor) {
    redirect('/vendor/pending');
  }

  if (status.status !== 'approved' || !status.isActive) {
    if (status.status === 'pending') {
      redirect('/vendor/pending');
    } else {
      redirect('/vendor/suspended');
    }
  }

  return status.vendor;
}
