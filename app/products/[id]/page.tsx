// =============================================================================
// WHY: Product detail page with deep linking (app/products/[id]/page.tsx)
// Shows comprehensive product information and launches chat
// Uses Next.js dynamic routes
// =============================================================================

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChatSheet } from '@/components/ui/ChatSheet';
import { Badges } from '@/components/ui/Badges';
import { ArrowLeft, MessageCircle, Share2, ExternalLink } from 'lucide-react';
import type { Product } from '@/types';

// =============================================================================
// WHY: Product detail page component
// Fetches single product by ID from URL params
// In production: fetches from GET /api/products/[id]
// =============================================================================

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // WHY: Fetch product on mount
  useEffect(() => {
    fetchProduct();
  }, [productId]);

  // =============================================================================
  // WHY: Fetch single product by ID
  // Production: calls GET /api/products/[id]
  // =============================================================================

  async function fetchProduct() {
    try {
      setIsLoading(true);
      
      // WHY: In production:
      // const response = await fetch(`/api/products/${productId}`);
      // if (!response.ok) throw new Error('Product not found');
      // const data = await response.json();
      // setProduct(data.product);

      // Mock data for demonstration
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockProduct: Product = {
        id: productId,
        name: 'Quick Personal Loan',
        bank: 'HDFC Bank',
        type: 'personal',
        rate_apr: 8.9,
        min_income: 20000,
        min_credit_score: 700,
        tenure_min_months: 12,
        tenure_max_months: 60,
        processing_fee_pct: 2,
        prepayment_allowed: false,
        disbursal_speed: 'fast',
        docs_level: 'minimal',
        summary: 'Low interest personal loan with fast approval and no prepayment penalty. Perfect for urgent financial needs with minimal documentation.',
        faq: [
          { q: 'What documents are needed?', a: 'ID proof (Aadhaar/PAN), last 3 months salary slips, and 6 months bank statements.' },
          { q: 'How fast is disbursal?', a: 'Funds are disbursed within 24 hours of approval.' },
          { q: 'Can I prepay without penalty?', a: 'Yes, this loan has no prepayment penalties.' },
          { q: 'What is the maximum loan amount?', a: 'Up to 40 lakhs based on your income and credit score.' }
        ],
        terms: {
          late_payment_fee: '2% per month',
          bounce_charges: '₹500 per instance',
          foreclosure_charges: 'NIL'
        }
      };

      setProduct(mockProduct);
      
    } catch (err) {
      setError('Failed to load product details');
      console.error('Error fetching product:', err);
    } finally {
      setIsLoading(false);
    }
  }

  // WHY: Share product handler
  const handleShare = async () => {
    const shareData = {
      title: product?.name || 'Loan Product',
      text: `Check out ${product?.name} from ${product?.bank}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-white rounded-lg" />
            <div className="h-96 bg-white rounded-lg" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The product you\'re looking for doesn\'t exist.'}</p>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* WHY: Header with navigation */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => router.back()}
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{product.name}</h1>
                <p className="text-sm text-gray-600">{product.bank}</p>
              </div>
            </div>
            
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* WHY: Key details card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{product.name}</CardTitle>
                <p className="text-gray-600">{product.bank} • {formatLoanType(product.type)}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">{product.rate_apr}%</div>
                <div className="text-sm text-gray-600">Interest Rate</div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* WHY: Badges */}
            <Badges product={product} />

            {/* WHY: Summary */}
            {product.summary && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <p className="text-gray-800">{product.summary}</p>
              </div>
            )}

            {/* WHY: Key metrics grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <MetricCard label="Min. Income" value={`₹${formatNumber(product.min_income)}`} />
              <MetricCard label="Credit Score" value={product.min_credit_score.toString()} />
              <MetricCard label="Tenure" value={`${product.tenure_min_months}-${product.tenure_max_months}mo`} />
              <MetricCard label="Processing Fee" value={product.processing_fee_pct ? `${product.processing_fee_pct}%` : 'N/A'} />
            </div>

            {/* WHY: CTA Buttons */}
            <div className="flex gap-3">
              <Button 
                size="lg" 
                className="flex-1"
                onClick={() => setIsChatOpen(true)}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Ask Questions
              </Button>
              <Button variant="outline" size="lg" className="flex-1">
                <ExternalLink className="w-5 h-5 mr-2" />
                Apply on Bank Website
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* WHY: FAQs section */}
        {product.faq && product.faq.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {product.faq.map((faq, index) => (
                  <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                    <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                    <p className="text-gray-600">{faq.a}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* WHY: Terms & Conditions */}
        {product.terms && (
          <Card>
            <CardHeader>
              <CardTitle>Terms & Charges</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(product.terms).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-sm font-medium text-gray-600 mb-1">
                      {formatTermKey(key)}
                    </dt>
                    <dd className="text-gray-900">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        )}
      </main>

      {/* WHY: Chat Sheet */}
      <ChatSheet
        product={product}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
}

// =============================================================================
// WHY: Helper components and functions
// =============================================================================

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center p-3 bg-gray-50 rounded-lg">
      <div className="text-xs text-gray-600 mb-1">{label}</div>
      <div className="text-lg font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
  return num.toLocaleString('en-IN');
}

function formatLoanType(type: string): string {
  const typeMap: Record<string, string> = {
    personal: 'Personal Loan',
    education: 'Education Loan',
    vehicle: 'Vehicle Loan',
    home: 'Home Loan',
    credit_line: 'Credit Line',
    debt_consolidation: 'Debt Consolidation'
  };
  return typeMap[type] || type;
}

function formatTermKey(key: string): string {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}