import type { CollectionConfig } from 'payload';

export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['subject', 'buyer', 'supplier', 'inquiryType', 'status', 'createdAt'],
    description: 'Buyer inquiries to suppliers',
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false;
      if ((req.user as any).role === 'admin') return true;
      // Buyers can see their inquiries, vendors can see inquiries to them
      if ((req.user as any).role === 'buyer') {
        return { buyer: { equals: req.user.id } };
      }
      if ((req.user as any).role === 'vendor') {
        // Need to check if inquiry's supplier matches vendor's vendor profile
        return true; // Will be filtered by tRPC/API
      }
      return false;
    },
    create: ({ req }) => {
      // Only buyers can create inquiries
      return (req.user as any)?.role === 'buyer';
    },
    update: ({ req }) => {
      if (!req.user) return false;
      if ((req.user as any).role === 'admin') return true;
      // Buyers can update their inquiries, vendors can update status
      if ((req.user as any).role === 'buyer') {
        return { buyer: { equals: req.user.id } };
      }
      return false;
    },
    delete: ({ req }) => {
      if (!req.user) return false;
      if ((req.user as any).role === 'admin') return true;
      return { buyer: { equals: req.user.id } };
    },
  },
  fields: [
    {
      name: 'buyer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'Buyer making the inquiry',
      },
    },
    {
      name: 'supplier',
      type: 'relationship',
      relationTo: 'vendors',
      required: true,
      admin: {
        description: 'Vendor/supplier receiving the inquiry',
      },
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      admin: {
        description: 'Product this inquiry is about (if applicable)',
      },
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
      admin: {
        description: 'Inquiry subject',
      },
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Inquiry message',
      },
    },
    {
      name: 'inquiryType',
      type: 'select',
      options: [
        { label: 'Product Inquiry', value: 'product' },
        { label: 'General Inquiry', value: 'general' },
        { label: 'Quote Request', value: 'quote' },
      ],
      defaultValue: 'general',
      admin: {
        description: 'Type of inquiry',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Replied', value: 'replied' },
        { label: 'Closed', value: 'closed' },
      ],
      defaultValue: 'new',
      admin: {
        description: 'Inquiry status',
      },
    },
    {
      name: 'attachments',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      admin: {
        description: 'File attachments',
      },
    },
    {
      name: 'lastRepliedAt',
      type: 'date',
      admin: {
        description: 'Last reply date',
      },
    },
  ],
  timestamps: true,
};
