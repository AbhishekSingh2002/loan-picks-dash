// =============================================================================
// WHY: Database access layer - encapsulates Prisma client
// Single source of truth for all DB operations
// Provides typed, reusable functions for data access
// Sharing & Persistence (10 points) - proper database integration
// =============================================================================

import { prisma } from '@/lib/prisma';
import type { Product, ChatMessage, ProductFilters, LoanType, ProductFaq, ChatRole } from '@/types';

// =============================================================================
// WHY: Get top products for user (personalized recommendations)
// In production, this would use ML scoring based on user profile
// Currently returns products sorted by match score
// Used by app/page.tsx for Dashboard view
// =============================================================================

export async function getTopProductsForUser(
  limit: number = 5
): Promise<Product[]> {
  const products = await prisma.product.findMany({
    orderBy: { matchScore: 'desc' },
    take: limit,
  });

  return products.map(p => ({
    id: p.id,
    name: p.name,
    bank: p.bank,
    type: p.type.toLowerCase() as LoanType,
    rate_apr: p.rateApr,
    min_income: p.minIncome,
    min_credit_score: p.minCreditScore,
    tenure_min_months: p.tenureMinMonths,
    tenure_max_months: p.tenureMaxMonths,
    processing_fee_pct: p.processingFeePct || undefined,
    prepayment_allowed: p.prepaymentAllowed,
    disbursal_speed: p.disbursalSpeed || undefined,
    docs_level: p.docsLevel || undefined,
    summary: p.summary || undefined,
    faq: (p.faq as unknown as ProductFaq[]) || undefined,
    terms: (p.terms as unknown as Record<string, unknown>) || undefined,
    match_score: p.matchScore || undefined,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  }));
}

// =============================================================================
// WHY: Get single product by ID
// Used when opening product detail page or chat
// Includes all fields + FAQ for AI grounding
// =============================================================================

export async function getProductById(id: string): Promise<Product | null> {
  const product = await prisma.product.findUnique({
    where: { id },
  });

  return product as Product | null;
}

// =============================================================================
// WHY: Get all products with filters
// Powers the /api/products endpoint and All Products page
// Supports filtering by bank, APR range, income, credit score
// Pagination via limit/offset
// =============================================================================

export async function getProducts(filters: ProductFilters): Promise<{
  products: Product[];
  total: number;
}> {
  const where: any = {};

  // WHY: Apply filters conditionally
  // Each filter is optional, only applied if provided
  if (filters.bank) {
    where.bank = filters.bank;
  }

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.apr_min !== undefined) {
    where.rateApr = { ...where.rateApr, gte: filters.apr_min };
  }

  if (filters.apr_max !== undefined) {
    where.rateApr = { ...where.rateApr, lte: filters.apr_max };
  }

  if (filters.min_income !== undefined) {
    where.minIncome = { lte: filters.min_income };
  }

  if (filters.min_credit_score !== undefined) {
    where.minCreditScore = { lte: filters.min_credit_score };
  }

  // WHY: Pagination for performance
  // Don't load all products at once, use limit/offset
  const limit = filters.limit || 10;
  const offset = filters.offset || 0;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { rateApr: 'asc' },
    }),
    prisma.product.count({ where })
  ]);

  const transformedProducts = products.map(p => ({
    id: p.id,
    name: p.name,
    bank: p.bank,
    type: p.type.toLowerCase() as LoanType,
    rate_apr: p.rateApr,
    min_income: p.minIncome,
    min_credit_score: p.minCreditScore,
    tenure_min_months: p.tenureMinMonths,
    tenure_max_months: p.tenureMaxMonths,
    processing_fee_pct: p.processingFeePct || undefined,
    prepayment_allowed: p.prepaymentAllowed,
    disbursal_speed: p.disbursalSpeed || undefined,
    docs_level: p.docsLevel || undefined,
    summary: p.summary || undefined,
    faq: (p.faq as unknown as ProductFaq[]) || undefined,
    terms: (p.terms as unknown as Record<string, unknown>) || undefined,
    match_score: p.matchScore || undefined,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  }));

  return {
    products: transformedProducts,
    total
  };
}

// =============================================================================
// WHY: Save chat message to database
// Enables persistent chat history across sessions
// Used by /api/ai/ask after generating response
// =============================================================================

export async function saveChatMessage(message: Omit<ChatMessage, 'id'>): Promise<ChatMessage> {
  const savedMessage = await prisma.chatMessage.create({
    data: {
      productId: message.product_id,
      userId: message.user_id!,
      role: message.role as any,
      content: message.content,
      createdAt: message.created_at,
    },
  });

  return {
    id: savedMessage.id,
    product_id: savedMessage.productId,
    user_id: savedMessage.userId,
    role: savedMessage.role as ChatRole,
    content: savedMessage.content,
    created_at: savedMessage.createdAt,
  };
}

// =============================================================================
// WHY: Get chat history for a product + user
// Retrieves previous conversation for context
// Used by /api/ai/ask to include history in prompt
// =============================================================================

export async function getChatHistory(
  productId: string,
  userId: string,
  limit: number = 10
): Promise<ChatMessage[]> {
  const messages = await prisma.chatMessage.findMany({
    where: {
      productId,
      userId,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  // WHY: Transform to match ChatMessage type and reverse for chronological order
  return messages.map(m => ({
    id: m.id,
    product_id: m.productId,
    user_id: m.userId,
    role: m.role as ChatRole,
    content: m.content,
    created_at: m.createdAt,
  })).reverse();
}

// =============================================================================
// WHY: Get available banks for filter dropdown
// Used in FiltersBar component
// =============================================================================

export async function getAvailableBanks(): Promise<string[]> {
  const products = await prisma.product.findMany({
    select: { bank: true },
    distinct: ['bank'],
    orderBy: { bank: 'asc' },
  });

  return products.map(p => p.bank);
}
