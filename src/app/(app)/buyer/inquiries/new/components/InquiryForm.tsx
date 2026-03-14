'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUpload } from '@/components/ui/image-upload';
import { trpc } from '@/trpc/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const inquiryFormSchema = z.object({
  productId: z.string().optional(),
  supplierId: z.string().min(1, 'Supplier is required if no product selected'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
  inquiryType: z.enum(['product', 'general', 'quote']).default('general'),
  attachments: z.array(z.string()).optional(),
}).refine((data) => data.productId || data.supplierId, {
  message: 'Either product or supplier must be selected',
  path: ['supplierId'],
});

type InquiryFormValues = z.infer<typeof inquiryFormSchema>;

interface InquiryFormProps {
  productId?: string;
  supplierId?: string;
}

export function InquiryForm({ productId, supplierId }: InquiryFormProps) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const form = useForm<InquiryFormValues>({
    resolver: zodResolver(inquiryFormSchema) as any,
    defaultValues: {
      productId: productId || '',
      supplierId: supplierId || '',
      subject: '',
      message: '',
      inquiryType: 'general',
      attachments: [],
    },
  });

  // Load product if productId provided
  const { data: product } = trpc.products.getById.useQuery(
    { id: productId! },
    { enabled: !!productId }
  );

  useEffect(() => {
    if (product) {
      // Pre-fill supplier from product
      const supplierId = typeof product.supplier === 'string'
        ? product.supplier
        : (product.supplier as any)?.id;
      
      form.setValue('supplierId', supplierId || '');
      form.setValue('subject', `Inquiry about ${product.title || 'product'}`);
    }
  }, [product, form]);

  const createMutation = trpc.buyers.inquiries.create.useMutation({
    onSuccess: (inquiry) => {
      toast.success('Inquiry sent successfully!');
      utils.buyers.inquiries.list.invalidate();
      router.push(`/buyer/inquiries/${inquiry.id}`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send inquiry');
    },
  });

  const onSubmit = async (data: InquiryFormValues) => {
    try {
      await createMutation.mutateAsync({
        productId: data.productId || undefined,
        supplierId: data.supplierId || undefined,
        subject: data.subject,
        message: data.message,
        inquiryType: data.inquiryType,
        attachments: data.attachments,
      });
    } catch (error: any) {
      // Error handled by mutation callbacks
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inquiry Details</CardTitle>
        <CardDescription>Send an inquiry to a vendor</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="inquiryType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inquiry Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select inquiry type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="product">Product Inquiry</SelectItem>
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="quote">Quote Request</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {product && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium">Product: {product.title}</p>
                <p className="text-xs text-gray-600">Supplier will be automatically selected</p>
              </div>
            )}

            {!product && (
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter supplier ID" {...field} />
                    </FormControl>
                    <FormDescription>
                      Select the supplier you want to contact
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter inquiry subject" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your inquiry message..."
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="attachments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Attachments</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      maxImages={5}
                      maxSize={10 * 1024 * 1024} // 10MB
                    />
                  </FormControl>
                  <FormDescription>
                    Upload files (images, PDFs, documents) - max 10MB each
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Link href="/buyer/inquiries">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Send Inquiry
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
