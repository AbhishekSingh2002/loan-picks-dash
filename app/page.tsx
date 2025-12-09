'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BestMatchCard } from '@/components/cards/BestMatchCard';
import { ProductCard } from '@/components/cards/ProductCard';
import { ChatSheet } from '@/components/ui/ChatSheet';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import type { Product, LoanType } from '@/types';

// Define the API response type for better type safety
interface ApiResponse {
  success: boolean;
  data: {
    products: Array<{
      id: string;
      name: string;
      bank: string;
      type: string;
      rate_apr: number;
      min_income: number;
      min_credit_score: number;
      tenure_min_months: number;
      tenure_max_months: number;
      processing_fee_pct?: number;
      prepayment_allowed: boolean;
      disbursal_speed?: string;
      docs_level?: string;
      summary?: string;
      match_score?: number;
      faq?: Array<{ q: string; a: string }>;
      terms?: Record<string, any>;
    }>;
  };
}

export default function DashboardPage(): React.ReactElement {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchTopProducts = useCallback(async (isRefreshing = false) => {
    try {
      isRefreshing ? setIsRefreshing(true) : setIsLoading(true);
      setError(null);

      const response = await fetch('/api/products?limit=5&sort_by=match_score&order=desc');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      if (data.success && data.data.products.length > 0) {
        // Transform the API response to match our Product type
        const formattedProducts = data.data.products.map((product): Product => ({
          id: product.id,
          name: product.name,
          bank: product.bank,
          type: product.type.toLowerCase() as LoanType,
          rate_apr: product.rate_apr,
          min_income: product.min_income,
          min_credit_score: product.min_credit_score,
          tenure_min_months: product.tenure_min_months,
          tenure_max_months: product.tenure_max_months,
          processing_fee_pct: product.processing_fee_pct,
          prepayment_allowed: product.prepayment_allowed || false,
          disbursal_speed: product.disbursal_speed || 'standard',
          docs_level: product.docs_level || 'standard',
          summary: product.summary || '',
          matchScore: product.match_score || 0,
          faq: product.faq || [],
          terms: product.terms || {},
        }));
        
        setProducts(formattedProducts);
      } else {
        setError('No products found. Please check back later.');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(
        err instanceof Error 
          ? `Failed to load products: ${err.message}`
          : 'An unknown error occurred while loading products.'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Fetch products on component mount
  useEffect(() => {
    fetchTopProducts();
  }, [fetchTopProducts]);

  // Handle refresh action
  const handleRefresh = () => {
    fetchTopProducts(true);
  };

  // Handle opening chat with a product
  const handleOpenChat = useCallback((product: Product) => {
    setSelectedProduct(product);
    setIsChatOpen(true);
  }, []);

  // Handle closing chat
  const handleCloseChat = useCallback(() => {
    setIsChatOpen(false);
  }, []);

  // Memoize derived values
  const bestMatch = products[0] || null;
  const otherProducts = products.slice(1);
  const showEmptyState = !isLoading && !error && products.length === 0;
  const showProducts = !isLoading && !error && products.length > 0;

  // Add animation styles
  const styles = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out forwards;
    }
  `;

  // Add styles to the document head
  if (typeof document !== 'undefined') {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = styles;
    document.head.appendChild(styleElement);
  }

  // Render loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* Best Match Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </div>
                <Skeleton className="h-10 mt-4" />
              </div>
            </div>

            {/* Other Products Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-8 w-56" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white border rounded-lg p-6 space-y-4">
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-16" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8" id="main-content">
        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
              <span>{error}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="mt-2 self-start"
              >
                {isRefreshing ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Empty State */}
        {showEmptyState && (
          <div className="text-center py-12">
            <Alert className="max-w-md mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No products available</AlertTitle>
              <AlertDescription className="mt-2">
                <p className="text-gray-600 mb-4">
                  We couldn't find any loan recommendations for you at this time.
                </p>
                <Button 
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  {isRefreshing ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Refresh
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Products Display */}
        {showProducts && (
          <div className="space-y-8">
            {/* Best Match Section */}
            {bestMatch && (
              <section aria-labelledby="best-match-heading" className="animate-fade-in">
                <h2
                  id="best-match-heading"
                  className="text-2xl font-bold mb-6 text-gray-900"
                >
                  Your Best Match
                </h2>
                <BestMatchCard
                  product={bestMatch}
                  onChat={() => handleOpenChat(bestMatch)}
                />
              </section>
            )}

            {/* Other Products Grid */}
            {otherProducts.length > 0 && (
              <section aria-labelledby="other-picks-heading" className="animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                  <h2
                    id="other-picks-heading"
                    className="text-2xl font-bold text-gray-900"
                  >
                    Other Top Picks
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    {isRefreshing ? (
                      <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-3.5 w-3.5" />
                    )}
                    Refresh
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {otherProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onChat={() => handleOpenChat(product)}
                      showMatchScore={true}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* Chat Interface */}
      <ChatSheet
        product={selectedProduct}
        isOpen={isChatOpen}
        onClose={handleCloseChat}
      />
    </div>
  );
}