import 'dotenv/config';
import { getPayload } from 'payload';
import config from '@payload-config';

async function fixBuyerProfile() {
  const payload = await getPayload({ config });

  // Get user email from command line args
  const userEmail = process.argv[2];

  if (!userEmail) {
    console.error('Usage: npx tsx src/scripts/fix-buyer-profile.ts <user-email>');
    console.error('Example: npx tsx src/scripts/fix-buyer-profile.ts buyer@example.com');
    process.exit(1);
  }

  try {
    // Find user by email
    const usersResult = await payload.find({
      collection: 'users',
      where: { email: { equals: userEmail } },
      limit: 1,
    });

    if (usersResult.docs.length === 0) {
      console.error(`❌ User with email ${userEmail} not found.`);
      process.exit(1);
    }

    const user = usersResult.docs[0];
    console.log(`✓ Found user: ${user.email}`);

    // Update user role to buyer if not already
    if ((user as any).role !== 'buyer') {
      await payload.update({
        collection: 'users',
        id: user.id,
        data: { role: 'buyer' } as any,
      });
      console.log(`✓ Updated user role to 'buyer'`);
    } else {
      console.log(`✓ User role is already 'buyer'`);
    }

    // Check if buyer profile exists
    const buyersResult = await payload.find({
      collection: 'buyers' as any,
      where: { user: { equals: user.id } },
      limit: 1,
    });

    if (buyersResult.docs.length > 0) {
      // Update existing buyer profile
      const buyer = buyersResult.docs[0];
      console.log(`✓ Found existing buyer profile: ${buyer.companyName || buyer.id}`);

      await payload.update({
        collection: 'buyers' as any,
        id: buyer.id,
        data: {
          verifiedBuyer: true,
          isArchived: false,
          verificationStatus: 'verified',
        } as any,
      });

      console.log(`✓ Updated buyer profile:`);
      console.log(`  - verifiedBuyer: true`);
      console.log(`  - isArchived: false`);
      console.log(`  - verificationStatus: verified`);
    } else {
      // Create new buyer profile
      console.log(`⚠ No buyer profile found. Creating new one...`);

      const buyer = await payload.create({
        collection: 'buyers' as any,
        data: {
          user: user.id,
          companyName: `${user.name || user.email}'s Company`,
          verifiedBuyer: true,
          isArchived: false,
          companyType: 'other',
          verificationStatus: 'verified',
        } as any,
      });

      console.log(`✓ Created new buyer profile:`);
      console.log(`  - ID: ${buyer.id}`);
      console.log(`  - Company Name: ${buyer.companyName}`);
      console.log(`  - verifiedBuyer: true`);
      console.log(`  - isArchived: false`);
    }

    console.log(`\n✅ Buyer profile is now active!`);
    console.log(`\nYou can now access the buyer dashboard at:`);
    console.log(`http://localhost:3000/buyer/dashboard`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixBuyerProfile();
