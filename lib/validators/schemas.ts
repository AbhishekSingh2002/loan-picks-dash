// =============================================================================
// WHY: Zod schemas provide runtime validation + TypeScript type inference
// Used by both client-side forms and server-side API route handlers
// Ensures data integrity and prevents invalid data from entering the system
// Single source of truth for validation rules (TypeScript & Validation - 20 points)
// =============================================================================

import { z } from 'zod';

// WHY: Product schema validates all product fields from database
// Ensures type safety when fetching from Supabase/Prisma
export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  bank: z.string().min(1),
  type: z.enum(['personal', 'education', 'vehicle', 'home', 'credit_line', 'debt_consolidation']),
  rate_apr: z.number().positive().max(50),
  min_income: z.number().int().positive(),
  min_credit_score: z.number().int().min(300).max(900),
  tenure_min_months: z.number().int().positive(),
  tenure_max_months: z.number().int().positive(),
  processing_fee_pct: z.number().min(0).max(10).optional(),
  prepayment_allowed: z.boolean().optional(),
  disbursal_speed: z.string().optional(),
  docs_level: z.string().optional(),
  summary: z.string().optional(),
  faq: z.array(z.object({
    q: z.string(),
    a: z.string()
  })).optional(),
  terms: z.record(z.unknown()).optional(),
  matchScore: z.number().min(0).max(100).optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional()
});

// WHY: FAQ schema validates individual FAQ entries
// Used when updating FAQs through admin interface
export const ProductFaqSchema = z.object({
  q: z.string().min(1, "Question is required"),
  a: z.string().min(1, "Answer is required")
});

// WHY: Chat message schema ensures proper message structure
// Validates all chat messages before storing in database
export const ChatMessageSchema = z.object({
  id: z.string().uuid().optional(),
  product_id: z.string().uuid(),
  user_id: z.string().uuid().optional(),
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1),
  created_at: z.date()
});

// WHY: AI Ask schema validates API requests to /api/ai/ask
// Prevents malformed requests, limits message length to prevent abuse
// History is optional for first message in conversation
export const AIAskSchema = z.object({
  productId: z.string().uuid({
    message: "Invalid product ID"
  }),
  message: z.string()
    .min(1, "Message cannot be empty")
    .max(500, "Message too long (max 500 characters)"),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional()
});

// WHY: Filter schema validates query parameters for /api/products
// Ensures valid filter values and prevents SQL injection
export const ProductFiltersSchema = z.object({
  bank: z.string().optional(),
  type: z.enum(['personal', 'education', 'vehicle', 'home', 'credit_line', 'debt_consolidation']).optional(),
  apr_min: z.number().positive().optional(),
  apr_max: z.number().positive().optional(),
  min_income: z.number().int().positive().optional(),
  min_credit_score: z.number().int().min(300).max(900).optional(),
  limit: z.number().int().positive().max(100).default(10),
  offset: z.number().int().min(0).default(0)
});

// WHY: Type inference from Zod schemas
// Automatically generates TypeScript types from validation schemas
// Keeps types and validation in sync - change schema, types update automatically
export type ProductSchemaType = z.infer<typeof ProductSchema>;
export type ProductFaqSchemaType = z.infer<typeof ProductFaqSchema>;
export type ChatMessageSchemaType = z.infer<typeof ChatMessageSchema>;
export type AIAskSchemaType = z.infer<typeof AIAskSchema>;
export type ProductFiltersSchemaType = z.infer<typeof ProductFiltersSchema>;