import type { CollectionConfig } from 'payload';

export const Quotes: CollectionConfig = {
  slug: 'quotes',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['rfq', 'supplier', 'totalPrice', 'status', 'submittedAt'],
    description: 'Quotes submitted by suppliers for RFQs',
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false;
      if ((req.user as any).role === 'admin') return true;
      // Buyers can see quotes for their RFQs, vendors can see their own quotes
      if ((req.user as any).role === 'buyer') {
        // Need to check if quote's RFQ belongs to this buyer
        return true; // Will be filtered by tRPC/API
      }
      if ((req.user as any).role === 'vendor') {
        return { supplier: { equals: req.user.id } };
      }
      return false;
    },
    create: ({ req }) => {
      // Only vendors can create quotes
      return (req.user as any)?.role === 'vendor';
    },
    update: ({ req }) => {
      if (!req.user) return false;
      if ((req.user as any).role === 'admin') return true;
      // Only the vendor who created the quote can update it (before it's accepted)
      return { supplier: { equals: req.user.id } };
    },
    delete: ({ req }) => {
      if (!req.user) return false;
      if ((req.user as any).role === 'admin') return true;
      return { supplier: { equals: req.user.id } };
    },
  },
  fields: [
    {
      name: 'rfq',
      type: 'relationship',
      relationTo: 'rfqs',
      required: true,
      admin: {
        description: 'RFQ this quote is for',
      },
    },
    {
      name: 'supplier',
      type: 'relationship',
      relationTo: 'vendors',
      required: true,
      admin: {
        description: 'Vendor/supplier submitting this quote',
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
          name: 'unitPrice',
          type: 'number',
          min: 0,
        },
      ],
      admin: {
        description: 'Products in this quote',
      },
    },
    {
      name: 'totalPrice',
      type: 'number',
      min: 0,
      required: true,
      admin: {
        description: 'Total quote price',
      },
    },
    {
      name: 'unitPrice',
      type: 'number',
      min: 0,
      admin: {
        description: 'Price per unit',
      },
    },
    {
      name: 'quantity',
      type: 'number',
      min: 1,
      admin: {
        description: 'Total quantity',
      },
    },
    {
      name: 'leadTime',
      type: 'text',
      admin: {
        description: 'Production/delivery lead time',
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
        description: 'Payment terms offered',
      },
    },
    {
      name: 'shippingTerms',
      type: 'array',
      fields: [
        {
          name: 'term',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description: 'Shipping terms (FOB, CIF, etc.)',
      },
    },
    {
      name: 'validityPeriod',
      type: 'text',
      admin: {
        description: 'Quote validity period (e.g., 30 days)',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Additional notes or conditions',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Submitted', value: 'submitted' },
        { label: 'Accepted', value: 'accepted' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Withdrawn', value: 'withdrawn' },
      ],
      defaultValue: 'pending',
      admin: {
        description: 'Quote status',
      },
    },
    {
      name: 'submittedAt',
      type: 'date',
      admin: {
        description: 'Date quote was submitted',
      },
    },
  ],
};
