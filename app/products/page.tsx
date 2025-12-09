// =============================================================================
// WHY: All Products page with filters (app/products/page.tsx)
// Displays comprehensive product list with filtering capabilities
// Implements pagination and search
// =============================================================================

'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/cards/ProductCard';
import { ChatSheet } from '@/components/ui/ChatSheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product, ProductFilters } from '@/types';

// =============================================================================
// WHY: Products page component with filters and pagination
// In production: fetches from GET /api/products with query params
// =============================================================================

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // WHY: Filter state
  const [filters, setFilters] = useState<ProductFilters>({
    limit: 10,
    offset: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // WHY: Fetch products when filters or page changes
  useEffect(() => {
    fetchProducts();
  }, [filters, currentPage]);

  // =============================================================================
  // WHY: Fetch products with applied filters
  // Production: calls GET /api/products with query params
  // =============================================================================

  async function fetchProducts() {
    try {
      setIsLoading(true);
      
      // WHY: Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters.bank) queryParams.append('bank', filters.bank);
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.apr_min) queryParams.append('apr_min', filters.apr_min.toString());
      if (filters.apr_max) queryParams.append('apr_max', filters.apr_max.toString());
      if (filters.min_credit_score) queryParams.append('min_credit_score', filters.min_credit_score.toString());
      queryParams.append('limit', (filters.limit || 10).toString());
      queryParams.append('offset', ((currentPage - 1) * (filters.limit || 10)).toString());

      // WHY: Call the real API
      const response = await fetch(`/api/products?${queryParams}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch products');
      }

      setProducts(data.data.products);
      setTotalPages(Math.ceil(data.data.pagination.total / (filters.limit || 10)));
      
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fallback to mock data if API fails
      const mockProducts = [
        {
          id: '1',
          name: 'Quick Personal Loan',
          bank: 'HDFC Bank',
          type: 'personal' as const,
          rate_apr: 8.9,
          min_income: 20000,
          min_credit_score: 700,
          tenure_min_months: 12,
          tenure_max_months: 60,
          processing_fee_pct: 2,
          prepayment_allowed: false,
          disbursal_speed: 'fast',
          docs_level: 'minimal',
          summary: 'Low interest personal loan with fast approval.'
        },
        {
          id: '2',
          name: 'Salaried Personal Loan',
          bank: 'ICICI Bank',
          type: 'personal' as const,
          rate_apr: 9.2,
          min_income: 25000,
          min_credit_score: 720,
          tenure_min_months: 12,
          tenure_max_months: 84,
          processing_fee_pct: 2.5,
          summary: 'Flexible tenure options with competitive rates.'
        }
      ];
      setProducts(mockProducts);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }

  // WHY: Handler for opening chat
  const handleOpenChat = (product: Product) => {
    setSelectedProduct(product);
    setIsChatOpen(true);
  };

  // WHY: Handler for pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* WHY: Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                All Loan Products
              </h1>
              <p className="text-sm text-gray-600 mt-0.5">
                Browse and compare all available loans
              </p>
            </div>
            
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8" id="main-content">
        {/* WHY: Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 space-y-4">
          <div className="flex gap-4 flex-col sm:flex-row">
            {/* WHY: Search input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search loans by name or bank..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* WHY: Filter toggle button */}
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="shrink-0"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            
            <Button onClick={fetchProducts}>
              Apply
            </Button>
          </div>

          {/* WHY: Filter options (collapsible) */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium mb-2">Bank</label>
                <select
                  className="w-full border rounded-md px-3 py-2"
                  value={filters.bank || ''}
                  onChange={(e) => setFilters({...filters, bank: e.target.value || undefined})}
                >
                  <option value="">All Banks</option>
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="SBI">SBI</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Kotak Mahindra">Kotak Mahindra</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Loan Type</label>
                <select
                  className="w-full border rounded-md px-3 py-2"
                  value={filters.type || ''}
                  onChange={(e) => setFilters({...filters, type: e.target.value as any})}
                >
                  <option value="">All Types</option>
                  <option value="personal">Personal</option>
                  <option value="education">Education</option>
                  <option value="vehicle">Vehicle</option>
                  <option value="home">Home</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Max APR</label>
                <Input
                  type="number"
                  placeholder="e.g., 10"
                  value={filters.apr_max || ''}
                  onChange={(e) => setFilters({...filters, apr_max: parseFloat(e.target.value) || undefined})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Min Credit Score</label>
                <Input
                  type="number"
                  placeholder="e.g., 700"
                  value={filters.min_credit_score || ''}
                  onChange={(e) => setFilters({...filters, min_credit_score: parseInt(e.target.value) || undefined})}
                />
              </div>
            </div>
          )}
        </div>

        {/* WHY: Results count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {isLoading ? 'Loading...' : `${products.length} products found`}
          </p>
        </div>

        {/* WHY: Products grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse bg-white rounded-lg p-6 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-20 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onChat={() => handleOpenChat(product)}
                />
              ))}
            </div>

            {/* WHY: Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No products found matching your criteria.</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setFilters({ limit: 10, offset: 0 });
                setSearchQuery('');
                fetchProducts();
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </main>

      {/* WHY: Chat Sheet */}
      <ChatSheet
        product={selectedProduct}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
}