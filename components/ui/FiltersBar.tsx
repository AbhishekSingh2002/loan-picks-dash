// =============================================================================
// WHY: FiltersBar component for All Products page
// Provides UI for filtering products by various criteria
// Implements debounced search and form validation
// =============================================================================

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Filter, X, Search } from 'lucide-react';
import { debounce } from '@/lib/util';
import type { ProductFilters, LoanType } from '@/types';

interface FiltersBarProps {
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  onSearch?: (query: string) => void;
  availableBanks?: string[];
  className?: string;
}

// =============================================================================
// WHY: Main FiltersBar component
// Collapsible on mobile, always visible on desktop
// =============================================================================

export function FiltersBar({
  filters,
  onFiltersChange,
  onSearch,
  availableBanks = ['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak Mahindra', 'Bajaj Finance'],
  className = ''
}: FiltersBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [localFilters, setLocalFilters] = useState<ProductFilters>(filters);

  // WHY: Debounced search to avoid excessive API calls
  const debouncedSearch = React.useCallback(
    debounce((query: string) => {
      onSearch?.(query);
    }, 300),
    [onSearch]
  );

  // WHY: Handle search input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // WHY: Update local filters
  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  // WHY: Apply filters
  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    setIsExpanded(false);
  };

  // WHY: Clear all filters
  const handleClearFilters = () => {
    const clearedFilters: ProductFilters = {
      limit: filters.limit || 10,
      offset: 0
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    setSearchQuery('');
    onSearch?.('');
  };

  // WHY: Check if any filters are active
  const hasActiveFilters = 
    localFilters.bank || 
    localFilters.type || 
    localFilters.apr_min !== undefined || 
    localFilters.apr_max !== undefined ||
    localFilters.min_income !== undefined ||
    localFilters.min_credit_score !== undefined;

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
      {/* WHY: Search and Filter Toggle Row */}
      <div className="flex gap-3 flex-col sm:flex-row">
        {/* WHY: Search input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
          <Input
            type="text"
            placeholder="Search by loan name or bank..."
            value={searchQuery}
            onChange={handleInputChange}
            className="pl-10"
            aria-label="Search products"
          />
        </div>

        {/* WHY: Filter toggle button */}
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2 shrink-0"
          aria-expanded={isExpanded}
          aria-label="Toggle filters"
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-blue-600 rounded-full" aria-label="Filters active" />
          )}
        </Button>

        {/* WHY: Clear filters button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearFilters}
            aria-label="Clear all filters"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* WHY: Expandable filters section */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* WHY: Bank filter */}
            <div>
              <label htmlFor="filter-bank" className="block text-sm font-medium text-gray-700 mb-2">
                Bank
              </label>
              <select
                id="filter-bank"
                value={localFilters.bank || ''}
                onChange={(e) => handleFilterChange('bank', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Banks</option>
                {availableBanks.map(bank => (
                  <option key={bank} value={bank}>{bank}</option>
                ))}
              </select>
            </div>

            {/* WHY: Loan type filter */}
            <div>
              <label htmlFor="filter-type" className="block text-sm font-medium text-gray-700 mb-2">
                Loan Type
              </label>
              <select
                id="filter-type"
                value={localFilters.type || ''}
                onChange={(e) => handleFilterChange('type', e.target.value as LoanType)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="personal">Personal</option>
                <option value="education">Education</option>
                <option value="vehicle">Vehicle</option>
                <option value="home">Home</option>
                <option value="credit_line">Credit Line</option>
                <option value="debt_consolidation">Debt Consolidation</option>
              </select>
            </div>

            {/* WHY: APR min filter */}
            <div>
              <label htmlFor="filter-apr-min" className="block text-sm font-medium text-gray-700 mb-2">
                Min APR (%)
              </label>
              <Input
                id="filter-apr-min"
                type="number"
                placeholder="e.g., 7.5"
                value={localFilters.apr_min ?? ''}
                onChange={(e) => handleFilterChange('apr_min', e.target.value ? parseFloat(e.target.value) : undefined)}
                min="0"
                max="50"
                step="0.1"
              />
            </div>

            {/* WHY: APR max filter */}
            <div>
              <label htmlFor="filter-apr-max" className="block text-sm font-medium text-gray-700 mb-2">
                Max APR (%)
              </label>
              <Input
                id="filter-apr-max"
                type="number"
                placeholder="e.g., 12.0"
                value={localFilters.apr_max ?? ''}
                onChange={(e) => handleFilterChange('apr_max', e.target.value ? parseFloat(e.target.value) : undefined)}
                min="0"
                max="50"
                step="0.1"
              />
            </div>

            {/* WHY: Min income filter */}
            <div>
              <label htmlFor="filter-income" className="block text-sm font-medium text-gray-700 mb-2">
                Max Income Requirement (₹)
              </label>
              <Input
                id="filter-income"
                type="number"
                placeholder="e.g., 30000"
                value={localFilters.min_income ?? ''}
                onChange={(e) => handleFilterChange('min_income', e.target.value ? parseInt(e.target.value) : undefined)}
                min="0"
                step="1000"
              />
            </div>

            {/* WHY: Credit score filter */}
            <div>
              <label htmlFor="filter-credit" className="block text-sm font-medium text-gray-700 mb-2">
                Max Credit Score Requirement
              </label>
              <Input
                id="filter-credit"
                type="number"
                placeholder="e.g., 750"
                value={localFilters.min_credit_score ?? ''}
                onChange={(e) => handleFilterChange('min_credit_score', e.target.value ? parseInt(e.target.value) : undefined)}
                min="300"
                max="900"
                step="10"
              />
            </div>
          </div>

          {/* WHY: Action buttons */}
          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              disabled={!hasActiveFilters}
            >
              Clear All
            </Button>
            <Button onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FiltersBar; 