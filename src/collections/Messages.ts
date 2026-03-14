import type { CollectionConfig } from 'payload';

export const Messages: CollectionConfig = {
  slug: 'messages',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['inquiry', 'sender', 'receiver', 'read', 'createdAt'],
    description: 'Messages within inquiries',
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false;
      if ((req.user as any).role === 'admin') return true;
      // Users can see messages where they are sender or receiver
      const userId = req.user.id;
      return {
        or: [
          { sender: { equals: userId } },
          { receiver: { equals: userId } },
        ],
      } as any;
    },
    create: ({ req }) => {
      // Authenticated users can create messages
      return !!req.user;
    },
    update: ({ req }) => {
      if (!req.user) return false;
      if ((req.user as any).role === 'admin') return true;
      // Only sender can update (e.g., mark as read)
      return { sender: { equals: req.user.id } };
    },
    delete: ({ req }) => {
      if (!req.user) return false;
      if ((req.user as any).role === 'admin') return true;
      return { sender: { equals: req.user.id } };
    },
  },
  fields: [
    {
      name: 'inquiry',
      type: 'relationship',
      relationTo: 'inquiries',
      required: true,
      admin: {
        description: 'Inquiry this message belongs to',
      },
    },
    {
      name: 'sender',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'User who sent this message',
      },
    },
    {
      name: 'receiver',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'User who receives this message',
      },
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Message content',
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
      name: 'read',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether message has been read',
      },
    },
    {
      name: 'readAt',
      type: 'date',
      admin: {
        description: 'Date message was read',
      },
    },
  ],
  timestamps: true,
};
