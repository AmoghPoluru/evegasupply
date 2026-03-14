import type { CollectionConfig } from 'payload';

export const RFQs: CollectionConfig = {
  slug: 'rfqs',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'buyer', 'category', 'status', 'createdAt'],
    description: 'Request for Quotations from buyers',
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false;
      // Buyers can see their own RFQs, vendors can see public RFQs, admins see all
      if ((req.user as any).role === 'admin') return true;
      if ((req.user as any).role === 'buyer') {
        return { buyer: { equals: req.user.id } } as any;
      }
      // Vendors can see public RFQs
      return { isPublic: { equals: true } } as any;
    },
    create: ({ req }) => {
      // Only buyers can create RFQs
      return (req.user as any)?.role === 'buyer';
    },
    update: ({ req }) => {
      if (!req.user) return false;
      if ((req.user as any).role === 'admin') return true;
      // Only the buyer who created the RFQ can update it
      return { buyer: { equals: req.user.id } } as any;
    },
    delete: ({ req }) => {
      if (!req.user) return false;
      if ((req.user as any).role === 'admin') return true;
      return { buyer: { equals: req.user.id } } as any;
    },
  },
  fields: [
    {
      name: 'buyer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'Buyer who created this RFQ',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'RFQ title',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Detailed RFQ description',
      },
    },
    {
      name: 'category',
      type: 'text',
      admin: {
        description: 'Product category',
      },
    },
    {
      name: 'products',
      type: 'array',
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
        },
        {
          name: 'quantity',
          type: 'number',
          min: 1,
        },
        {
          name: 'specifications',
          type: 'textarea',
        },
      ],
      admin: {
        description: 'Products requested in this RFQ',
      },
    },
    {
      name: 'quantity',
      type: 'number',
      min: 1,
      admin: {
        description: 'Total quantity needed',
      },
    },
    {
      name: 'targetPrice',
      type: 'number',
      min: 0,
      admin: {
        description: 'Target price per unit',
      },
    },
    {
      name: 'deliveryDate',
      type: 'date',
      admin: {
        description: 'Required delivery date',
      },
    },
    {
      name: 'deliveryLocation',
      type: 'text',
      admin: {
        description: 'Delivery address/location',
      },
    },
    {
      name: 'paymentTerms',
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
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Open', value: 'open' },
        { label: 'Closed', value: 'closed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      defaultValue: 'draft',
      admin: {
        description: 'RFQ status',
      },
    },
    {
      name: 'quotes',
      type: 'relationship',
      relationTo: 'quotes',
      hasMany: true,
      admin: {
        description: 'Quotes submitted for this RFQ',
      },
    },
    {
      name: 'selectedQuote',
      type: 'relationship',
      relationTo: 'quotes',
      admin: {
        description: 'Selected quote (if any)',
      },
    },
    {
      name: 'expiryDate',
      type: 'date',
      admin: {
        description: 'RFQ expiry date',
      },
    },
    {
      name: 'isPublic',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Make this RFQ visible to all vendors',
      },
    },
    {
      name: 'specifications',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'value',
          type: 'text',
          required: true,
        },
        {
          name: 'unit',
          type: 'text',
        },
        {
          name: 'notes',
          type: 'text',
        },
      ],
      admin: {
        description: 'Product specifications',
      },
    },
    {
      name: 'specificationImages',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      admin: {
        description: 'Reference images for product specifications',
      },
    },
  ],
};
