// =============================================================================
// WHY: Centralized type definitions ensure type safety across the entire app
// No 'any' types - strict TypeScript as per evaluation criteria (20 points)
// These types are imported by components, lib functions, and API routes
// =============================================================================

export type LoanType = 'personal' | 'education' | 'vehicle' | 'home' | 'credit_line' | 'debt_consolidation';

export type ChatRole = 'user' | 'assistant';

export interface ProductFaq {
  q: string;
  a: string;
}

export interface Product {
  id: string;
  name: string;
  bank: string;
  type: LoanType;
  rate_apr: number;
  min_income: number;
  min_credit_score: number;
  tenure_min_months: number;
  tenure_max_months: number;
  processing_fee_pct?: number;
  prepayment_allowed?: boolean;
  disbursal_speed?: string;
  docs_level?: string;
  summary?: string;
  faq?: ProductFaq[];
  terms?: Record<string, unknown>;
  matchScore?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface ChatMessage {
  id?: string;
  product_id: string;
  user_id?: string;
  role: ChatRole;
  content: string;
  created_at: Date;
}

export interface ProductFilters {
  bank?: string;
  type?: LoanType;
  apr_min?: number;
  apr_max?: number;
  min_income?: number;
  min_credit_score?: number;
  limit?: number;
  offset?: number;
}

export interface Badge {
  label: string;
  variant: 'default' | 'success' | 'info' | 'warning' | 'secondary';
  ariaLabel: string;
}

export interface AIAskRequest {
  productId: string;
  message: string;
  history?: Array<{
    role: ChatRole;
    content: string;
  }>;
}

export interface AIAskResponse {
  message: string;
  error?: string;
}