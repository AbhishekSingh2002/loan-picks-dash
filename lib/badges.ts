// =============================================================================
// WHY: Pure functions for badge logic - easy to test and maintain
// Business rules are deterministic and documented with explicit thresholds
// Separated from UI rendering for single-responsibility principle
// Frontend Architecture (20 points) - clean separation of concerns
// =============================================================================

import type { Product, Badge } from '@/types';

// =============================================================================
// Badge threshold constants - centralized for easy updates
// WHY: If business rules change (e.g., "Low APR" now means ≤8%), 
// update once here instead of searching through components
// =============================================================================

const BADGE_THRESHOLDS = {
  LOW_APR: 9.5,           // APR ≤ 9.5% gets "Low APR" badge
  LOW_INCOME: 25000,      // Income requirement ≤ 25k gets badge
  FAST_DISBURSAL: 'fast', // Explicit 'fast' value required
  MINIMAL_DOCS: 'minimal' // Minimal documentation level
} as const;

// =============================================================================
// WHY: Main badge calculation function
// Takes Product, returns array of Badge objects with accessibility info
// Pure function - same input always produces same output (testable!)
// =============================================================================

export function getBadges(product: Product): Badge[] {
  const badges: Badge[] = [];

  // WHY: Low APR badge - competitive interest rate indicator
  // Threshold: 9.5% or less is considered "low" in Indian loan market
  if (product.rate_apr <= BADGE_THRESHOLDS.LOW_APR) {
    badges.push({
      label: 'Low APR',
      variant: 'success',
      ariaLabel: `Low interest rate of ${product.rate_apr.toFixed(2)}% annual percentage rate`
    });
  }

  // WHY: No prepayment penalty badge - important for customers planning early payoff
  // prepayment_allowed: false means NO PENALTY (confusing naming from DB)
  if (product.prepayment_allowed === false) {
    badges.push({
      label: 'No Prepayment Penalty',
      variant: 'info',
      ariaLabel: 'No penalty for early loan repayment'
    });
  }

  // WHY: Fast disbursal badge - loan approval speed matters for urgent needs
  // Only shows if explicitly marked as 'fast' in database
  if (product.disbursal_speed === BADGE_THRESHOLDS.FAST_DISBURSAL) {
    badges.push({
      label: 'Fast Disbursal',
      variant: 'warning',
      ariaLabel: 'Quick loan disbursal, typically within 24-48 hours'
    });
  }

  // WHY: Low income requirement badge - accessibility for lower-income applicants
  // Shows if minimum income is reasonable (≤25k monthly)
  if (product.min_income <= BADGE_THRESHOLDS.LOW_INCOME) {
    badges.push({
      label: `₹${product.min_income.toLocaleString('en-IN')}+ Income`,
      variant: 'default',
      ariaLabel: `Minimum income requirement is ${product.min_income} rupees per month`
    });
  }

  // WHY: Minimal documentation badge - convenience factor
  // Less paperwork = faster application process
  if (product.docs_level === BADGE_THRESHOLDS.MINIMAL_DOCS) {
    badges.push({
      label: 'Minimal Docs',
      variant: 'secondary',
      ariaLabel: 'Minimal documentation required for application'
    });
  }

  // WHY: Low processing fee badge - shows if fee is below 2%
  // Processing fees can add significant cost
  if (product.processing_fee_pct && product.processing_fee_pct < 2) {
    badges.push({
      label: `${product.processing_fee_pct}% Fee`,
      variant: 'success',
      ariaLabel: `Low processing fee of ${product.processing_fee_pct} percent`
    });
  }

  return badges;
}

// =============================================================================
// WHY: Helper function to get specific badge type
// Useful for conditional rendering or checking if product has certain feature
// =============================================================================

export function hasLowAPRBadge(product: Product): boolean {
  return product.rate_apr <= BADGE_THRESHOLDS.LOW_APR;
}

export function hasFastDisbursalBadge(product: Product): boolean {
  return product.disbursal_speed === BADGE_THRESHOLDS.FAST_DISBURSAL;
}

export function hasNoPrepaymentBadge(product: Product): boolean {
  return product.prepayment_allowed === false;
}

// =============================================================================
// WHY: Badge priority ordering function
// Some badges are more important than others for display
// Used when space is limited (mobile view) to show most relevant badges first
// =============================================================================

export function sortBadgesByPriority(badges: Badge[]): Badge[] {
  const priorityOrder = [
    'Low APR',
    'No Prepayment Penalty',
    'Fast Disbursal',
    'Minimal Docs'
  ];

  return [...badges].sort((a, b) => {
    const aIndex = priorityOrder.indexOf(a.label);
    const bIndex = priorityOrder.indexOf(b.label);
    
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
}

// =============================================================================
// WHY: Export thresholds for documentation and testing
// Tests can reference these to verify badge logic
// =============================================================================

export { BADGE_THRESHOLDS };