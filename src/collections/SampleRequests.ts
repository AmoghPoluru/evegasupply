import type { CollectionConfig } from 'payload';

export const SampleRequests: CollectionConfig = {
  slug: 'sample-requests',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['product', 'buyer', 'supplier', 'status', 'createdAt'],
    description: 'Sample product requests from buyers',
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false;
      if ((req.user as any).role === 'admin') return true;
      // Buyers can see their requests, vendors can see requests for their products
      if ((req.user as any).role === 'buyer') {
        return { buyer: { equals: req.user.id } };
      }
      if ((req.user as any).role === 'vendor') {
        // Need to check if request's supplier matches vendor's vendor profile
        return true; // Will be filtered by tRPC/API
      }
      return false;
    },
    create: ({ req }) => {
      // Only buyers can create sample requests
      return (req.user as any)?.role === 'buyer';
    },
    update: ({ req }) => {
      if (!req.user) return false;
      if ((req.user as any).role === 'admin') return true;
      // Buyers can update their requests, vendors can update status
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
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      admin: {
        description: 'Product sample requested',
      },
    },
    {
      name: 'buyer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'Buyer requesting the sample',
      },
    },
    {
      name: 'supplier',
      type: 'relationship',
      relationTo: 'vendors',
      required: true,
      admin: {
        description: 'Vendor/supplier providing the sample',
      },
    },
    {
      name: 'quantity',
      type: 'number',
      min: 1,
      defaultValue: 1,
      admin: {
        description: 'Number of samples requested',
      },
    },
    {
      name: 'purpose',
      type: 'textarea',
      admin: {
        description: 'Purpose of the sample request',
      },
    },
    {
      name: 'shippingAddress',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Shipping address for sample',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      defaultValue: 'pending',
      admin: {
        description: 'Sample request status',
      },
    },
    {
      name: 'samplePrice',
      type: 'number',
      min: 0,
      admin: {
        description: 'Price for the sample',
      },
    },
    {
      name: 'paymentStatus',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
        { label: 'Free', value: 'free' },
      ],
      defaultValue: 'pending',
      admin: {
        description: 'Payment status for sample',
      },
    },
  ],
  timestamps: true,
};
