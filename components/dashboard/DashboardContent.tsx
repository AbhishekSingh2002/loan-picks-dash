// =============================================================================
// WHY: DashboardContent component displays top 5 loan products
// Shows best match prominently and other recommendations
// Handles empty state when no products available
// =============================================================================

'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, TrendingUp, ArrowRight } from 'lucide-react';
import { ChatSheet } from '@/components/ui/ChatSheet';
import ProductCard from '@/components/cards/ProductCard';
import type { Product } from '@/types';

interface DashboardContentProps {
  products: Product[];
}

export default function DashboardContent({ products }: DashboardContentProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <TrendingUp className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No recommendations yet</h3>
        <p className="text-muted-foreground mb-6">
          We're analyzing your profile to find the best loan matches for you.
        </p>
        <Button asChild>
          <a href="/products">
            View All Products
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>
    );
  }

  const bestMatch = products[0];
  const otherProducts = products.slice(1);

  return (
    <div className="space-y-8">
      {/* WHY: Best Match Section - Prominently display top recommendation */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Star className="h-5 w-5 text-yellow-500" />
          <h2 className="text-2xl font-semibold">Best Match</h2>
          <Badge variant="secondary" className="ml-2">
            {bestMatch?.matchScore || 95}% Match
          </Badge>
        </div>
        
        {bestMatch && (
          <div className="border-2 border-primary rounded-lg p-1 bg-primary/5">
            <ProductCard 
              product={bestMatch} 
              onChat={() => setSelectedProduct(bestMatch)}
              showMatchScore={true}
              className="border-0"
            />
          </div>
        )}
      </section>

      {/* WHY: Other Matches Section - Display remaining recommendations */}
      {otherProducts.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Other Great Matches</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {otherProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onChat={() => setSelectedProduct(product)}
                showMatchScore={product.matchScore !== undefined}
              />
            ))}
          </div>
        </section>
      )}

      {/* WHY: View More CTA - Link to all products */}
      <section className="text-center pt-8 border-t">
        <h3 className="text-lg font-semibold mb-2">Explore More Options</h3>
        <p className="text-muted-foreground mb-6">
          Browse our complete catalog of loan products with advanced filtering
        </p>
        <Button asChild size="lg">
          <a href="/products">
            View All Products
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </section>

      {/* WHY: Chat Interface - Use ChatSheet component */}
      <ChatSheet
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
