import 'dotenv/config';
import { getPayload } from 'payload';
import config from '@payload-config';

const seedDressSuppliers = async () => {
  try {
    console.log('🌱 Seeding dress suppliers and products...');
    const payload = await getPayload({ config });

    // Check if already seeded
    const existing = await payload.find({
      collection: 'vendors',
      where: { companyName: { equals: 'Silk Road Garments Co.' } },
      limit: 1,
    });
    if (existing.docs.length > 0) {
      console.log('✓ Dress suppliers already seeded. Skipping.');
      return;
    }

    // Create vendor users (dress suppliers)
    const vendor1User = await payload.create({
      collection: 'users',
      data: {
        email: 'silkroad@dresssupply.com',
        password: 'vendor123',
        name: 'Silk Road Garments',
        role: 'vendor',
      },
      overrideAccess: true,
    });

    const vendor2User = await payload.create({
      collection: 'users',
      data: {
        email: 'elegance@fashionwholesale.com',
        password: 'vendor123',
        name: 'Elegance Fashion Wholesale',
        role: 'vendor',
      },
      overrideAccess: true,
    });

    console.log('✅ Created 2 vendor users');

    // Create vendors (dress supplier profiles)
    const vendor1 = await payload.create({
      collection: 'vendors',
      data: {
        user: vendor1User.id,
        companyName: 'Silk Road Garments Co.',
        companyType: 'manufacturer',
        yearEstablished: 2010,
        annualRevenue: '10m_50m',
        employeeCount: '51_200',
        mainMarkets: [{ market: 'North America' }, { market: 'Europe' }],
        mainProducts: [{ product: 'Evening Dresses' }, { product: 'Bridal Wear' }],
        factoryLocation: 'Guangzhou, China',
        factorySize: '10000_50000',
        verifiedSupplier: true,
        goldSupplier: true,
        responseTime: '12h',
        acceptSampleOrders: true,
        acceptCustomOrders: true,
        companyWebsite: 'https://silkroadgarments.com',
        companyHistory: 'Leading manufacturer of premium evening and bridal dresses since 2010.',
      },
      overrideAccess: true,
    });

    const vendor2 = await payload.create({
      collection: 'vendors',
      data: {
        user: vendor2User.id,
        companyName: 'Elegance Fashion Wholesale Ltd.',
        companyType: 'trading',
        yearEstablished: 2015,
        annualRevenue: '5m_10m',
        employeeCount: '11_50',
        mainMarkets: [{ market: 'Europe' }, { market: 'Australia' }],
        mainProducts: [{ product: 'Cocktail Dresses' }, { product: 'Party Wear' }],
        factoryLocation: 'Shenzhen, China',
        factorySize: '5000_10000',
        verifiedSupplier: true,
        responseTime: '24h',
        acceptSampleOrders: true,
        acceptCustomOrders: true,
        companyWebsite: 'https://elegancefashionwholesale.com',
        companyHistory: 'B2B wholesale specialist in cocktail and party dresses for retailers worldwide.',
      },
      overrideAccess: true,
    });

    console.log('✅ Created 2 dress supplier vendors');

    // Create 3 dress products
    await payload.create({
      collection: 'products',
      data: {
        title: 'A-Line Evening Gown - Satin',
        description:
          'Elegant A-line evening gown in premium satin. Perfect for formal events, galas, and red carpet. Available in 12 colors. Custom sizing available.',
        supplier: vendor1.id,
        moq: 50,
        unitPrice: 45.99,
        sampleAvailable: true,
        samplePrice: 89.99,
        customizationAvailable: true,
        leadTime: '14-21 days',
        category: 'Evening Dresses',
        bulkPricingTiers: [
          { minQuantity: 50, price: 45.99, unit: 'USD' },
          { minQuantity: 100, price: 42.99, unit: 'USD' },
          { minQuantity: 500, price: 38.99, unit: 'USD' },
        ],
        paymentTerms: [{ term: 'T/T 30% deposit' }, { term: 'L/C' }],
        shippingTerms: [{ term: 'FOB' }, { term: 'CIF' }],
        originCountry: 'China',
      },
      overrideAccess: true,
    });

    await payload.create({
      collection: 'products',
      data: {
        title: 'Lace Bridal Maxi Dress',
        description:
          'Stunning lace bridal maxi dress with delicate embroidery. Ideal for bridesmaids, destination weddings, and special occasions. MOQ 30 pieces.',
        supplier: vendor1.id,
        moq: 30,
        unitPrice: 62.5,
        sampleAvailable: true,
        samplePrice: 125.0,
        customizationAvailable: true,
        leadTime: '21-28 days',
        category: 'Bridal Wear',
        bulkPricingTiers: [
          { minQuantity: 30, price: 62.5, unit: 'USD' },
          { minQuantity: 100, price: 55.0, unit: 'USD' },
        ],
        paymentTerms: [{ term: 'T/T 50% deposit' }],
        originCountry: 'China',
      },
      overrideAccess: true,
    });

    await payload.create({
      collection: 'products',
      data: {
        title: 'Cocktail Dress - Sequin Midi',
        description:
          'Trendy sequin midi cocktail dress. Best seller for parties, NYE, and special events. Quick turnaround available. 20+ color options.',
        supplier: vendor2.id,
        moq: 40,
        unitPrice: 28.99,
        sampleAvailable: true,
        samplePrice: 49.99,
        customizationAvailable: true,
        leadTime: '10-14 days',
        category: 'Cocktail Dresses',
        bulkPricingTiers: [
          { minQuantity: 40, price: 28.99, unit: 'USD' },
          { minQuantity: 200, price: 24.99, unit: 'USD' },
          { minQuantity: 500, price: 21.99, unit: 'USD' },
        ],
        paymentTerms: [{ term: 'T/T' }, { term: 'PayPal' }],
        shippingTerms: [{ term: 'FOB' }],
        originCountry: 'China',
      },
      overrideAccess: true,
    });

    console.log('✅ Created 3 dress products');
    console.log('');
    console.log('🎉 Seed complete! Dress suppliers and products:');
    console.log('   Vendors: Silk Road Garments Co., Elegance Fashion Wholesale Ltd.');
    console.log('   Products: A-Line Evening Gown, Lace Bridal Maxi Dress, Cocktail Sequin Midi');
    console.log('');
    console.log('   Vendor login: silkroad@dresssupply.com / vendor123');
    console.log('   Vendor login: elegance@fashionwholesale.com / vendor123');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDressSuppliers();
