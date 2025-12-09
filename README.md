# Loan Picks Dashboard

AI-powered personalized loan recommendation platform with real-time chat assistance.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Dashboard  │  │  All Products │  │  Product Detail  │   │
│  │   (Top 5)   │  │   (Filters)   │  │  (Deep Link)     │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
│           │               │                    │             │
│           └───────────────┴────────────────────┘             │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
┌───────────────────────────┼──────────────────────────────────┐
│                    API Routes (Next.js)                       │
│  ┌──────────────────┐         ┌─────────────────────────┐   │
│  │  /api/products   │         │    /api/ai/ask          │   │
│  │  (Filters, Page) │         │  (AI Chat Grounding)    │   │
│  └──────────────────┘         └─────────────────────────┘   │
│           │                              │                   │
└───────────┼──────────────────────────────┼───────────────────┘
            │                              │
┌───────────┼──────────────────────────────┼───────────────────┐
│           │          Backend Logic       │                   │
│  ┌────────▼────────┐          ┌─────────▼────────────┐      │
│  │   lib/db.ts     │          │     lib/ai.ts        │      │
│  │  (DB Helpers)   │          │  (Prompt Building)   │      │
│  └─────────────────┘          └──────────────────────┘      │
│           │                              │                   │
└───────────┼──────────────────────────────┼───────────────────┘
            │                              │
    ┌───────▼────────┐           ┌────────▼────────┐
    │   PostgreSQL   │           │  OpenAI/Gemini  │
    │   (Supabase)   │           │   (LLM API)     │
    └────────────────┘           └─────────────────┘
```

## 📁 Directory Structure

```
loan-picks-dashboard/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Dashboard (Top 5 + Best Match)
│   ├── products/
│   │   ├── page.tsx            # All Products with filters
│   │   └── [id]/page.tsx       # Product detail page
│   └── api/
│       ├── products/route.ts   # GET /api/products
│       └── ai/ask/route.ts     # POST /api/ai/ask
├── components/
│   ├── cards/
│   │   ├── ProductCard.tsx     # Reusable product card
│   │   └── BestMatchCard.tsx   # Enhanced best match card
│   └── ui/
│       ├── ChatSheet.tsx       # AI chat interface
│       ├── Badges.tsx          # Badge rendering
│       └── [shadcn-ui]/        # shadcn/ui components
├── lib/
│   ├── db.ts                   # Database helpers (Supabase/Prisma)
│   ├── ai.ts                   # AI grounding logic
│   ├── badges.ts               # Badge calculation (pure functions)
│   └── validators/
│       └── schemas.ts          # Zod validation schemas
├── types/
│   └── index.ts                # TypeScript interfaces
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Seed 10+ products
└── .env.example                # Environment variables template
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database (or Supabase account)
- OpenAI/Gemini API key (for production AI)

### Installation

```bash
# Clone repository
git clone <repo-url>
cd loan-picks-dashboard

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Set up database
pnpm prisma migrate dev
pnpm prisma db seed

# Run development server
pnpm dev
```

Visit `http://localhost:3000`

## 🎯 Key Features

### 1. Dashboard (Top 5 + Best Match)
- **Best Match Card**: Enhanced visual design with match reasons
- **Top 5 Products**: Personalized recommendations
- **Responsive Grid**: 1 column mobile, 2 columns desktop
- **Loading Skeletons**: Better perceived performance

### 2. AI Chat Integration ⭐
- **Grounded Responses**: Only uses product data
- **Field Citation**: References specific product fields
- **Safe Fallbacks**: Returns helpful message when info unavailable
- **Persistent History**: Saves messages to database

### 3. Badge System
- **Low APR**: rate_apr ≤ 9.5%
- **No Prepayment Penalty**: prepayment_allowed = false
- **Fast Disbursal**: disbursal_speed = 'fast'
- **Low Income Requirement**: min_income ≤ ₹25,000
- **Accessibility**: Proper ARIA labels on all badges

### 4. Filters & Search
- Bank filter
- Loan type filter
- APR range (min/max)
- Income filter
- Credit score filter
- Server-side pagination

## 🤖 AI Grounding Strategy

### How It Works

1. **Request Validation** (Zod schema)
   ```typescript
   { productId: UUID, message: string, history?: ChatMessage[] }
   ```

2. **Product Data Loading**
   ```typescript
   const product = await getProductById(productId);
   // Includes: name, bank, rate_apr, faq[], etc.
   ```

3. **Prompt Construction**
   ```typescript
   const prompt = `
   You are a loan advisor. Use ONLY this data:
   - Product: ${product.name}
   - APR: ${product.rate_apr}%
   - FAQ: ${JSON.stringify(product.faq)}
   
   RULES:
   - Only use provided data
   - Cite field names when referencing
   - Say "I don't have that info" if outside data
   `;
   ```

4. **LLM Call** (OpenAI/Gemini)
   ```typescript
   const response = await callLLMAPI(prompt, apiKey);
   ```

5. **Response Validation**
   - Checks for hallucinated claims
   - Blocks suspicious patterns
   - Returns safe fallback if invalid

6. **Message Persistence**
   ```typescript
   await saveChatMessage({ role: 'user', content: message });
   await saveChatMessage({ role: 'assistant', content: response });
   ```

### Example Conversation

**User**: "What's the interest rate?"

**AI**: "The Quick Personal Loan has an annual percentage rate (APR) of 8.9%. This is considered a competitive low rate in the current market."

**User**: "Tell me about the founder of HDFC Bank"

**AI**: "I don't have specific information about that in our product database. However, I can help you with details about the Quick Personal Loan's interest rate (8.9% APR), eligibility criteria, or tenure options. What would you like to know?"

## 🎨 Badge Logic

### Thresholds

```typescript
const BADGE_THRESHOLDS = {
  LOW_APR: 9.5,           // ≤9.5% gets badge
  LOW_INCOME: 25000,      // ≤₹25k gets badge
  FAST_DISBURSAL: 'fast', // Explicit 'fast' value
  MINIMAL_DOCS: 'minimal' // Minimal docs badge
};
```

### Calculation Flow

```typescript
function getBadges(product: Product): Badge[] {
  const badges = [];
  
  if (product.rate_apr <= 9.5) {
    badges.push({ label: 'Low APR', variant: 'success' });
  }
  
  if (product.prepayment_allowed === false) {
    badges.push({ label: 'No Prepayment Penalty', variant: 'info' });
  }
  
  // ... more badge logic
  
  return badges;
}
```

## ♿ Accessibility Features

- ✅ Semantic HTML (`<header>`, `<main>`, `<section>`, `<article>`)
- ✅ ARIA labels on all interactive elements
- ✅ ARIA roles (`role="status"`, `role="log"`)
- ✅ Keyboard navigation (Tab, Enter, Shift+Enter)
- ✅ Focus management (Sheet traps focus when open)
- ✅ Color contrast (WCAG AA compliant)
- ✅ Screen reader announcements
- ✅ Skip links for main content

## 🔒 Security

### API Endpoint Protection
- Zod validation on all inputs
- Rate limiting (10 req/min per user)
- JWT authentication
- SQL injection prevention (Prisma parameterized queries)

### Environment Security
- API keys in environment variables
- Secrets rotation recommended every 90 days
- No sensitive data in client-side code
- HTTPS only in production

## 📊 Database Schema

### Products Table
```sql
- id: UUID (primary key)
- name: TEXT
- bank: TEXT
- type: ENUM (personal, education, vehicle, home, etc.)
- rate_apr: DECIMAL(5,2)
- min_income: INTEGER
- min_credit_score: INTEGER
- faq: JSONB (array of {q, a})
- match_score: INTEGER (for personalization)
```

### Chat Messages Table
```sql
- id: UUID (primary key)
- product_id: UUID (foreign key)
- user_id: UUID
- role: ENUM (user, assistant)
- content: TEXT
- created_at: TIMESTAMP
```

### Indexes
- `products(rate_apr)` - Fast APR filtering
- `products(min_credit_score)` - Credit score queries
- `chat_messages(product_id, user_id, created_at)` - Chat history

## 🧪 Testing

```bash
# Run type checking
pnpm tsc --noEmit

# Run linting
pnpm lint

# Run unit tests (badge logic, validation)
pnpm test

# Run E2E tests
pnpm test:e2e
```

## 📦 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Environment Variables (Production)
- `DATABASE_URL`: Supabase Postgres connection string
- `OPENAI_API_KEY`: For AI chat
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL`: Your production domain

## 📈 Performance

- **Initial Load**: < 2s (server-side rendering)
- **Time to Interactive**: < 3s
- **First Contentful Paint**: < 1s
- **Chat Response**: < 2s (with LLM API)

### Optimizations
- Server Components (Next.js App Router)
- Database indexes on filtered columns
- Pagination (10 products per page)
- Image optimization (next/image)
- Code splitting (dynamic imports)

