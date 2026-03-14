'use client';

import { notFound } from 'next/navigation';
import { trpc } from '@/trpc/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Loader2, 
  AlertCircle, 
  ShoppingCart, 
  MessageSquare, 
  MapPin, 
  CheckCircle2, 
  Star,
  Package,
  Clock,
  Globe,
  FileText,
  Award
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, use } from 'react';

interface ProductDetailPageProps {
  params: Promise<{
    productId: string;
  }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  // Unwrap the Promise using React.use()
  const { productId } = use(params);
  
  const { data: product, isLoading, error } = trpc.products.getById.useQuery({
    id: productId,
  });

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading product...</span>
          </div>
        </main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-5 h-5" />
                <div>
                  <p className="font-semibold">Error loading product</p>
                  <p className="text-sm">{error?.message || 'Product not found'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Get product images
  const getImageUrls = () => {
    if (!product.images || !Array.isArray(product.images) || product.images.length === 0) {
      return [];
    }
    return product.images.map((img) => {
      if (typeof img === 'string') return img;
      if (typeof img === 'object' && img !== null && 'url' in img) {
        return (img as any).url;
      }
      return null;
    }).filter(Boolean) as string[];
  };

  const imageUrls = getImageUrls();
  const mainImage = imageUrls[selectedImageIndex] || imageUrls[0];

  // Get supplier info
  const supplier = typeof product.supplier === 'object' && product.supplier !== null 
    ? product.supplier as any 
    : null;

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            {supplier && (
              <>
                <Link href={`/vendors/${supplier.id}`} className="hover:text-foreground transition-colors">
                  {supplier.companyName || 'Vendor'}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-foreground">{product.title}</span>
          </div>
        </nav>

        {/* Product Detail Layout - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column - Image Gallery */}
          <div>
            {/* Main Image */}
            <Card className="border-2 border-blue-100/50 dark:border-blue-900/30 mb-4">
              <CardContent className="p-0">
                <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2 border-blue-100 dark:border-blue-900/50 overflow-hidden flex items-center justify-center relative">
                  {mainImage ? (
                    <Image
                      src={mainImage}
                      alt={product.title || 'Product'}
                      width={800}
                      height={800}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-muted-foreground">No Image</span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Thumbnails */}
            {imageUrls.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {imageUrls.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-all ${
                      selectedImageIndex === index
                        ? 'border-primary ring-2 ring-primary ring-offset-2'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
                      <Image
                        src={url}
                        alt={`${product.title} ${index + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Product Info */}
          <div className="flex flex-col gap-6">
            {/* Product Title */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
                {product.title}
              </h1>
              {product.category && (
                <Badge variant="secondary" className="mt-2">
                  {product.category}
                </Badge>
              )}
            </div>

            {/* Price Display */}
            {product.unitPrice && (
              <div>
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-3xl font-bold text-red-600 dark:text-red-400">
                    ${Number(product.unitPrice).toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground">per unit</span>
                </div>
                {product.moq && (
                  <p className="text-sm text-muted-foreground">
                    Minimum Order Quantity: <span className="font-semibold text-foreground">{product.moq}</span>
                  </p>
                )}
              </div>
            )}

            {/* Bulk Pricing Table */}
            {product.bulkPricingTiers && 
             Array.isArray(product.bulkPricingTiers) && 
             product.bulkPricingTiers.length > 0 && (
              <Card className="border-blue-100/50 dark:border-blue-900/30">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">Bulk Pricing</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Unit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {product.bulkPricingTiers.map((tier: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{tier.minQuantity || 'N/A'}</TableCell>
                          <TableCell className="font-semibold text-red-600 dark:text-red-400">
                            ${Number(tier.price || 0).toFixed(2)}
                          </TableCell>
                          <TableCell>{tier.unit || 'unit'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="flex-1">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button variant="outline" size="lg" className="flex-1">
                <MessageSquare className="w-5 h-5 mr-2" />
                Request Quote
              </Button>
            </div>

            {/* Product Description */}
            {product.description && (
              <Card className="border-blue-100/50 dark:border-blue-900/30">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-3">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{product.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Supplier Information */}
            {supplier && (
              <Card className="border-blue-100/50 dark:border-blue-900/30 bg-gradient-to-r from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-pink-950/20">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-3">Supplier</h3>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1">
                      <Link 
                        href={`/vendors/${supplier.id}`}
                        className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                      >
                        {supplier.companyName}
                      </Link>
                      {supplier.factoryLocation && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                          <MapPin className="w-4 h-4" />
                          <span>{supplier.factoryLocation}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {supplier.verifiedSupplier && (
                        <Badge variant="default" className="gap-1.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 rounded-full px-3 py-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verified
                        </Badge>
                      )}
                      {supplier.goldSupplier && (
                        <Badge variant="secondary" className="gap-1.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-white border-0 rounded-full px-3 py-1">
                          <Star className="w-3.5 h-3.5 fill-white" />
                          Gold
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Link href={`/vendors/${supplier.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      View Supplier Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Specifications Table */}
        <Card className="mb-8 border-blue-100/50 dark:border-blue-900/30">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Specifications
            </h2>
            <Table>
              <TableBody>
                {product.moq && (
                  <TableRow>
                    <TableCell className="font-medium w-1/3">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        Minimum Order Quantity (MOQ)
                      </div>
                    </TableCell>
                    <TableCell>{product.moq}</TableCell>
                  </TableRow>
                )}
                {product.leadTime && (
                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        Lead Time
                      </div>
                    </TableCell>
                    <TableCell>{product.leadTime}</TableCell>
                  </TableRow>
                )}
                {product.originCountry && (
                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-green-600 dark:text-green-400" />
                        Country of Origin
                      </div>
                    </TableCell>
                    <TableCell>{product.originCountry}</TableCell>
                  </TableRow>
                )}
                {product.hsCode && (
                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                        HS Code
                      </div>
                    </TableCell>
                    <TableCell>{product.hsCode}</TableCell>
                  </TableRow>
                )}
                {product.productCertifications && 
                 Array.isArray(product.productCertifications) && 
                 product.productCertifications.length > 0 && (
                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        Certifications
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {product.productCertifications.map((cert: any, index: number) => (
                          <Badge key={index} variant="outline">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {product.sampleAvailable !== undefined && (
                  <TableRow>
                    <TableCell className="font-medium">Sample Available</TableCell>
                    <TableCell>
                      {product.sampleAvailable ? (
                        <Badge variant="default" className="bg-green-600">Yes</Badge>
                      ) : (
                        <Badge variant="secondary">No</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                )}
                {product.samplePrice && (
                  <TableRow>
                    <TableCell className="font-medium">Sample Price</TableCell>
                    <TableCell>${Number(product.samplePrice).toFixed(2)}</TableCell>
                  </TableRow>
                )}
                {product.customizationAvailable !== undefined && (
                  <TableRow>
                    <TableCell className="font-medium">Customization Available</TableCell>
                    <TableCell>
                      {product.customizationAvailable ? (
                        <Badge variant="default" className="bg-blue-600">Yes</Badge>
                      ) : (
                        <Badge variant="secondary">No</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
