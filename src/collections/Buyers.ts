import type { CollectionConfig } from 'payload';

export const Buyers: CollectionConfig = {
  slug: 'buyers',
  admin: {
    useAsTitle: 'companyName',
    defaultColumns: ['companyName', 'companyType', 'verifiedBuyer', 'createdAt'],
    description: 'B2B buyer/company profiles',
  },
  access: {
    read: () => true, // Public read for marketplace
    create: ({ req }) => !!req.user,
    update: ({ req }) => {
      if (!req.user) return false;
      if ((req.user as any).role === 'admin') return true;
      return { user: { equals: req.user!.id } };
    },
    delete: ({ req }) => {
      if (!req.user) return false;
      if ((req.user as any).role === 'admin') return true;
      return { user: { equals: req.user!.id } };
    },
  },
  fields: [
    // Owner / User link
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true,
      admin: {
        description: 'User account linked to this buyer profile',
      },
    },
    {
      name: 'companyName',
      type: 'text',
      required: true,
      admin: {
        description: 'Legal or trading name of the company',
      },
    },
    {
      name: 'companyType',
      type: 'select',
      options: [
        { label: 'Retailer', value: 'retailer' },
        { label: 'Wholesaler', value: 'wholesaler' },
        { label: 'Distributor', value: 'distributor' },
        { label: 'Manufacturer', value: 'manufacturer' },
        { label: 'E-commerce', value: 'ecommerce' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        description: 'Type of business entity',
      },
    },
    {
      name: 'businessRegistrationNumber',
      type: 'text',
      admin: {
        description: 'Business registration number',
      },
    },
    {
      name: 'taxId',
      type: 'text',
      admin: {
        description: 'Tax identification number',
      },
    },
    {
      name: 'companyWebsite',
      type: 'text',
      admin: {
        description: 'Company website URL',
      },
    },
    {
      name: 'annualPurchaseVolume',
      type: 'select',
      options: [
        { label: 'Under $100K', value: 'under_100k' },
        { label: '$100K - $500K', value: '100k_500k' },
        { label: '$500K - $1M', value: '500k_1m' },
        { label: '$1M - $5M', value: '1m_5m' },
        { label: '$5M - $10M', value: '5m_10m' },
        { label: 'Over $10M', value: 'over_10m' },
      ],
      admin: {
        description: 'Annual purchase volume range',
      },
    },
    {
      name: 'mainBusiness',
      type: 'text',
      admin: {
        description: 'Main business description',
      },
    },
    {
      name: 'targetMarkets',
      type: 'array',
      fields: [
        {
          name: 'market',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description: 'Target markets served',
      },
    },
    {
      name: 'verifiedBuyer',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Platform-verified buyer',
      },
    },
    {
      name: 'preferredPaymentTerms',
      type: 'array',
      fields: [
        {
          name: 'term',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description: 'Preferred payment terms',
      },
    },
    {
      name: 'shippingPreferences',
      type: 'array',
      fields: [
        {
          name: 'preference',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description: 'Shipping preferences',
      },
    },
    {
      name: 'companyAddress',
      type: 'textarea',
      admin: {
        description: 'Company address',
      },
    },
    {
      name: 'companyPhone',
      type: 'text',
      admin: {
        description: 'Company phone number',
      },
    },
    {
      name: 'companyEmail',
      type: 'email',
      admin: {
        description: 'Company email address',
      },
    },
    {
      name: 'companyLogo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Company logo',
      },
    },
    {
      name: 'companyDescription',
      type: 'textarea',
      admin: {
        description: 'Company description',
      },
    },
    {
      name: 'numberOfEmployees',
      type: 'select',
      options: [
        { label: '1-10', value: '1_10' },
        { label: '11-50', value: '11_50' },
        { label: '51-200', value: '51_200' },
        { label: '201-500', value: '201_500' },
        { label: '501-1000', value: '501_1000' },
        { label: 'Over 1000', value: 'over_1000' },
      ],
      admin: {
        description: 'Number of employees',
      },
    },
    {
      name: 'yearEstablished',
      type: 'number',
      min: 1900,
      max: new Date().getFullYear(),
      admin: {
        description: 'Year the company was established',
      },
    },
    {
      name: 'businessLicense',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Business license document',
      },
    },
    {
      name: 'taxDocuments',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      admin: {
        description: 'Tax documents',
      },
    },
    {
      name: 'verificationStatus',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Verified', value: 'verified' },
        { label: 'Rejected', value: 'rejected' },
      ],
      defaultValue: 'pending',
      admin: {
        description: 'Verification status',
      },
    },
    {
      name: 'verificationDocuments',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      admin: {
        description: 'Verification documents',
      },
    },
    {
      name: 'isArchived',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Archive this buyer profile',
      },
    },
  ],
  timestamps: true,
};
