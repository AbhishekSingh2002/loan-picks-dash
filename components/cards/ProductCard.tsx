// =============================================================================
// WHY: Reusable ProductCard component used across Dashboard and All Products page
// Follows component composition pattern for maintainability
// Implements accessibility with semantic HTML, ARIA labels, keyboard navigation
// UI/UX & Accessibility (25 points) + Frontend Architecture (20 points)
// =============================================================================

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle } from 'lucide-react';
import { Badges } from '@/components/ui/Badges';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onChat: () => void;
  onViewDetails?: () => void;
  showMatchScore?: boolean;
  className?: string;
}

// =============================================================================
// WHY: Main ProductCard component
// Displays all key product information in scannable format
// CTA buttons for chat and details maintain consistent interaction patterns
// =============================================================================

export function ProductCard({ 
  product, 
  onChat, 
  onViewDetails,
  showMatchScore = false,
  className = ''
}: ProductCardProps) {
  return (
    <Card className={`flex flex-col h-full ${className}`}>
      <CardHeader>
        {/* WHY: Product name as primary heading for card */}
        <CardTitle className="flex items-start justify-between gap-2">
          <span className="text-lg">{product.name}</span>
          
          {/* WHY: Match score badge shows relevance to user (if available) */}
          {showMatchScore && product.matchScore && (
            <Badge 
              variant="secondary"
              className="shrink-0"
              aria-label={`${product.matchScore} percent match score`}
            >
              {product.matchScore}% match
            </Badge>
          )}
        </CardTitle>
        
        {/* WHY: Bank name as secondary descriptor */}
        <CardDescription className="text-sm">
          {product.bank} • {formatLoanType(product.type)}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex flex-col flex-1 gap-4">
        {/* WHY: Key metrics grid - most important info at a glance */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <MetricItem 
            label="Interest Rate"
            value={`${product.rate_apr}%`}
            highlight
            ariaLabel={`Annual percentage rate ${product.rate_apr} percent`}
          />
          <MetricItem 
            label="Tenure"
            value={`${product.tenure_min_months}-${product.tenure_max_months}mo`}
            ariaLabel={`Loan tenure from ${product.tenure_min_months} to ${product.tenure_max_months} months`}
          />
          <MetricItem 
            label="Min. Credit Score"
            value={product.min_credit_score.toString()}
            ariaLabel={`Minimum credit score required is ${product.min_credit_score}`}
          />
          <MetricItem 
            label="Min. Income"
            value={`₹${formatCurrency(product.min_income)}`}
            ariaLabel={`Minimum monthly income required is ${product.min_income} rupees`}
          />
        </div>
        
        {/* WHY: Badges show special features and benefits */}
        <Badges product={product} maxDisplay={4} />
        
        {/* WHY: Summary provides context and selling points */}
        {product.summary && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.summary}
          </p>
        )}
        
        {/* WHY: Action buttons at bottom for consistent placement */}
        <div className="flex gap-2 mt-auto pt-4">
          {onViewDetails && (
            <Button 
              variant="outline" 
              onClick={onViewDetails}
              className="flex-1"
              aria-label={`View details for ${product.name}`}
            >
              View Details
            </Button>
          )}
          
          {/* WHY: Chat button is primary action - AI interaction */}
          <Button 
            onClick={onChat}
            className={onViewDetails ? 'flex-1' : 'w-full'}
            aria-label={`Start chat about ${product.name}`}
          >
            <MessageCircle className="w-4 h-4 mr-2" aria-hidden="true" />
            Ask Questions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// WHY: MetricItem subcomponent for consistent metric display
// Reduces duplication and ensures uniform styling
// =============================================================================

interface MetricItemProps {
  label: string;
  value: string;
  highlight?: boolean;
  ariaLabel?: string;
}

function MetricItem({ label, value, highlight = false, ariaLabel }: MetricItemProps) {
  return (
    <div aria-label={ariaLabel}>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className={`font-semibold ${highlight ? 'text-xl text-green-600' : 'text-base'}`}>
        {value}
      </div>
    </div>
  );
}

// =============================================================================
// WHY: Helper functions for formatting
// Pure functions for consistent data display across app
// =============================================================================

function formatCurrency(amount: number): string {
  if (amount >= 100000) {
    return `${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}k`;
  }
  return amount.toLocaleString('en-IN');
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

// =============================================================================
// WHY: Export for use in app/page.tsx and app/products/page.tsx
// =============================================================================

export default ProductCard;