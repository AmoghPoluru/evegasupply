'use client';

import { useState, useEffect } from 'react';
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
import { Loader2, ArrowLeft, ChevronRight, ChevronLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const specificationSchema = z.object({
  name: z.string().min(1, 'Specification name is required'),
  value: z.string().min(1, 'Value is required'),
  unit: z.string().optional(),
  notes: z.string().optional(),
});

const rfqFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').optional(),
  targetPrice: z.number().min(0, 'Target price must be positive').optional(),
  deliveryDate: z.string().optional(),
  deliveryLocation: z.string().optional(),
  paymentTerms: z.array(z.string()).optional(),
  specifications: z.array(specificationSchema).optional(),
  specificationImages: z.array(z.string()).optional(),
});

type RFQFormValues = z.infer<typeof rfqFormSchema>;

interface RFQFormProps {
  draftId?: string;
}

const STEPS = [
  { id: 1, name: 'Basic Info', description: 'Title, category, description' },
  { id: 2, name: 'Specifications', description: 'Product specifications' },
  { id: 3, name: 'Quantity & Delivery', description: 'Quantity, budget, delivery' },
  { id: 4, name: 'Review & Submit', description: 'Review and submit RFQ' },
];

export function RFQForm({ draftId }: RFQFormProps) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [currentStep, setCurrentStep] = useState(1);
  const [specifications, setSpecifications] = useState<Array<{ name: string; value: string; unit?: string; notes?: string }>>([]);

  const form = useForm<RFQFormValues>({
    resolver: zodResolver(rfqFormSchema),
    defaultValues: {
      title: '',
      category: '',
      description: '',
      quantity: undefined,
      targetPrice: undefined,
      deliveryDate: '',
      deliveryLocation: '',
      paymentTerms: [],
      specifications: [],
      specificationImages: [],
    },
  });

  // Load draft if draftId provided
  // Note: getById is not available in buyers.rfqs router, skipping draft loading
  const draftRFQ: any = null;
  const loadingDraft = false;

  useEffect(() => {
    if (draftRFQ) {
      form.reset({
        title: draftRFQ.title || '',
        category: draftRFQ.category || '',
        description: draftRFQ.description || '',
        quantity: draftRFQ.quantity || undefined,
        targetPrice: draftRFQ.targetPrice || undefined,
        deliveryDate: draftRFQ.deliveryDate || '',
        deliveryLocation: draftRFQ.deliveryLocation || '',
        paymentTerms: Array.isArray(draftRFQ.paymentTerms) 
          ? draftRFQ.paymentTerms.map((p: any) => p.term || p)
          : [],
        specifications: draftRFQ.specifications || [],
        specificationImages: Array.isArray(draftRFQ.specificationImages)
          ? draftRFQ.specificationImages.map((img: any) => typeof img === 'string' ? img : img.id)
          : [],
      });
      if (draftRFQ.specifications) {
        setSpecifications(draftRFQ.specifications);
      }
    }
  }, [draftRFQ, form]);

  const createMutation = trpc.buyers.rfqs.create.useMutation({
    onSuccess: (rfq) => {
      toast.success('RFQ created successfully!');
      utils.buyers.rfqs.list.invalidate();
      router.push(`/buyer/rfqs/${rfq.id}`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create RFQ');
    },
  });

  const saveDraftMutation = trpc.buyers.rfqs.saveDraft.useMutation({
    onSuccess: () => {
      toast.success('Draft saved successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save draft');
    },
  });

  const onSubmit = async (data: RFQFormValues) => {
    try {
      await createMutation.mutateAsync({
        ...data,
        specifications: specifications.length > 0 ? specifications : undefined,
        status: 'new',
      });
    } catch (error: any) {
      // Error handled by mutation callbacks
    }
  };

  const handleSaveDraft = async () => {
    const data = form.getValues();
    try {
      await saveDraftMutation.mutateAsync({
        ...data,
        specifications: specifications.length > 0 ? specifications : undefined,
        rfqId: draftId,
      });
    } catch (error: any) {
      // Error handled by mutation callbacks
    }
  };

  const handleNext = async () => {
    const isValid = await form.trigger();
    if (isValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addSpecification = () => {
    setSpecifications([...specifications, { name: '', value: '' }]);
  };

  const removeSpecification = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const updateSpecification = (index: number, field: string, value: string) => {
    const updated = [...specifications];
    updated[index] = { ...updated[index], [field]: value };
    setSpecifications(updated);
  };

  if (loadingDraft) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      {/* Step Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2
                    ${currentStep >= step.id
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-300 text-gray-500'
                    }
                  `}
                >
                  {step.id}
                </div>
                <div className="mt-2 text-xs text-center">
                  <div className="font-medium">{step.name}</div>
                  <div className="text-gray-500">{step.description}</div>
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Provide basic details about your RFQ</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RFQ Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter RFQ title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Electronics">Electronics</SelectItem>
                          <SelectItem value="Textiles">Textiles</SelectItem>
                          <SelectItem value="Machinery">Machinery</SelectItem>
                          <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                          <SelectItem value="Chemicals">Chemicals</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter detailed description..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 2: Specifications */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Product Specifications</CardTitle>
                <CardDescription>Add product specifications and reference images</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <FormLabel>Specifications</FormLabel>
                    <Button type="button" variant="outline" size="sm" onClick={addSpecification}>
                      Add Specification
                    </Button>
                  </div>

                  {specifications.length === 0 ? (
                    <p className="text-sm text-gray-500">No specifications added yet</p>
                  ) : (
                    <div className="space-y-3">
                      {specifications.map((spec, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 items-start p-3 border rounded-lg">
                          <div className="col-span-4">
                            <Input
                              placeholder="Spec name"
                              value={spec.name}
                              onChange={(e) => updateSpecification(index, 'name', e.target.value)}
                            />
                          </div>
                          <div className="col-span-3">
                            <Input
                              placeholder="Value"
                              value={spec.value}
                              onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                            />
                          </div>
                          <div className="col-span-2">
                            <Input
                              placeholder="Unit"
                              value={spec.unit || ''}
                              onChange={(e) => updateSpecification(index, 'unit', e.target.value)}
                            />
                          </div>
                          <div className="col-span-2">
                            <Input
                              placeholder="Notes"
                              value={spec.notes || ''}
                              onChange={(e) => updateSpecification(index, 'notes', e.target.value)}
                            />
                          </div>
                          <div className="col-span-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSpecification(index)}
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="specificationImages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference Images</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value}
                          onChange={field.onChange}
                          maxImages={5}
                          maxSize={5 * 1024 * 1024}
                        />
                      </FormControl>
                      <FormDescription>
                        Upload reference images for product specifications (max 5 images)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 3: Quantity & Delivery */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Quantity & Delivery</CardTitle>
                <CardDescription>Specify quantity, budget, and delivery requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="Enter quantity"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="targetPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Price (per unit)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="deliveryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Required Delivery Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deliveryLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter delivery address" {...field} />
                      </FormControl>
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
                        <Textarea
                          placeholder="e.g., 30% deposit, 70% before shipment"
                          rows={2}
                          value={field.value?.join(', ') || ''}
                          onChange={(e) => {
                            const terms = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                            field.onChange(terms);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter payment terms separated by commas
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Review & Submit</CardTitle>
                <CardDescription>Review your RFQ before submitting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Basic Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Title:</strong> {form.watch('title') || '-'}</div>
                    <div><strong>Category:</strong> {form.watch('category') || '-'}</div>
                    <div><strong>Description:</strong> {form.watch('description') || '-'}</div>
                  </div>
                </div>

                {specifications.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Specifications</h3>
                    <div className="space-y-2">
                      {specifications.map((spec, index) => (
                        <div key={index} className="text-sm border-l-2 pl-3">
                          <strong>{spec.name}:</strong> {spec.value} {spec.unit && `(${spec.unit})`}
                          {spec.notes && <div className="text-gray-500">{spec.notes}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">Quantity & Delivery</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Quantity:</strong> {form.watch('quantity')?.toLocaleString() || '-'}</div>
                    <div><strong>Target Price:</strong> ${form.watch('targetPrice')?.toFixed(2) || '-'}</div>
                    <div><strong>Delivery Date:</strong> {form.watch('deliveryDate') || '-'}</div>
                    <div><strong>Delivery Location:</strong> {form.watch('deliveryLocation') || '-'}</div>
                    <div><strong>Payment Terms:</strong> {form.watch('paymentTerms')?.join(', ') || '-'}</div>
                  </div>
                </div>

                {form.watch('specificationImages') && form.watch('specificationImages')!.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Reference Images</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {form.watch('specificationImages')!.map((imgId, index) => (
                        <div key={index} className="aspect-square border rounded overflow-hidden">
                          <img src={`/media/${imgId}`} alt={`Reference ${index + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={handlePrevious}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={saveDraftMutation.isPending}
              >
                {saveDraftMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
            </div>

            <div className="flex gap-2">
              <Link href="/buyer/rfqs">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              {currentStep < STEPS.length ? (
                <Button type="button" onClick={handleNext}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Submit RFQ
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
