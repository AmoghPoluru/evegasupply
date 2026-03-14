'use client';

import { useState, useMemo } from 'react';
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
import { trpc } from '@/trpc/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Calculator } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const quoteSchema = z.object({
  unitPrice: z.number().min(0, 'Unit price must be positive'),
  moq: z.number().int().min(1, 'MOQ must be at least 1').optional(),
  leadTime: z.string().optional(),
  paymentTerms: z.string().optional(),
  deliveryTerms: z.string().optional(),
  notes: z.string().optional(),
});

type QuoteFormValues = z.infer<typeof quoteSchema>;

interface QuoteFormProps {
  rfq: any;
  existingQuote?: any;
}

export function QuoteForm({ rfq, existingQuote }: QuoteFormProps) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [quantity, setQuantity] = useState(rfq.quantity || 1);

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      unitPrice: existingQuote?.unitPrice || 0,
      moq: existingQuote?.moq || rfq.quantity || 1,
      leadTime: existingQuote?.leadTime || '',
      paymentTerms: existingQuote?.paymentTerms || '',
      deliveryTerms: existingQuote?.deliveryTerms || '',
      notes: existingQuote?.notes || '',
    },
  });

  const unitPrice = form.watch('unitPrice');
  const moq = form.watch('moq') || 1;

  // Calculate total price
  const totalPrice = useMemo(() => {
    if (!unitPrice || !quantity) return 0;
    return unitPrice * Math.max(quantity, moq);
  }, [unitPrice, quantity, moq]);

  const createMutation = trpc.vendors.rfqs.submitQuote.useMutation({
    onSuccess: () => {
      toast.success('Quote submitted successfully!');
      utils.vendors.rfqs.list.invalidate();
      router.push(`/vendor/rfqs/${rfq.id}`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit quote');
    },
  });

  const updateMutation = trpc.vendors.rfqs.updateQuote.useMutation({
    onSuccess: () => {
      toast.success('Quote updated successfully!');
      utils.vendors.rfqs.list.invalidate();
      router.push(`/vendor/rfqs/${rfq.id}`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update quote');
    },
  });

  const onSubmit = async (data: QuoteFormValues) => {
    try {
      if (existingQuote) {
        await updateMutation.mutateAsync({
          quoteId: existingQuote.id,
          ...data,
          totalPrice,
        });
      } else {
        await createMutation.mutateAsync({
          rfqId: rfq.id,
          ...data,
          totalPrice,
        });
      }
    } catch (error: any) {
      // Error handled by mutation callbacks
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/vendor/rfqs/${rfq.id}`}
          className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to RFQ
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">
          {existingQuote ? 'Edit Quote' : 'Submit Quote'}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {existingQuote
            ? 'Update your quote for this RFQ'
            : 'Submit a quote for this RFQ'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quote Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Quote Details</CardTitle>
              <CardDescription>
                Provide pricing and terms for this RFQ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="unitPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit Price ($) *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="moq"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>MOQ (Minimum Order Quantity)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              placeholder="1"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="leadTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lead Time</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 2-4 weeks"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Estimated time to fulfill the order
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentTerms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Terms</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 30% deposit, 70% before shipment"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deliveryTerms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Terms</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., FOB, CIF, EXW"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any additional information or terms..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      {existingQuote ? 'Update Quote' : 'Submit Quote'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Calculator */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Pricing Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">RFQ Quantity</label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  min={moq}
                  className="mt-1"
                />
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Unit Price</span>
                  <span className="font-semibold">${unitPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Quantity</span>
                  <span className="font-semibold">{Math.max(quantity, moq).toLocaleString()}</span>
                </div>
                {quantity < moq && (
                  <p className="text-xs text-amber-600">
                    Quantity adjusted to MOQ: {moq}
                  </p>
                )}
                <div className="flex justify-between pt-2 border-t font-bold text-lg">
                  <span>Total Price</span>
                  <span className="text-green-600">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* RFQ Summary */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>RFQ Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Title:</span>
                <p className="font-medium">{rfq.title || '-'}</p>
              </div>
              <div>
                <span className="text-gray-600">Quantity:</span>
                <p className="font-medium">{rfq.quantity?.toLocaleString() || '-'}</p>
              </div>
              {rfq.budgetRange && (
                <div>
                  <span className="text-gray-600">Budget Range:</span>
                  <p className="font-medium">
                    {rfq.budgetRange.min && rfq.budgetRange.max
                      ? `$${rfq.budgetRange.min.toLocaleString()} - $${rfq.budgetRange.max.toLocaleString()}`
                      : rfq.budgetRange.min
                      ? `$${rfq.budgetRange.min.toLocaleString()}+`
                      : '-'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
