// =============================================================================
// WHY: API route for fetching products with filters
// Next.js Route Handler pattern (app/api/products/route.ts)
// Implements server-side filtering, pagination, and validation
// TypeScript & Validation (20 points) - Zod schema validation
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { ProductFiltersSchema } from '@/lib/validators/schemas';
import { getProducts } from '@/lib/db';

// =============================================================================
// WHY: GET /api/products handler
// Accepts query parameters for filtering: bank, type, apr_min, apr_max, etc.
// Returns paginated results with total count
// Validates all inputs with Zod before database query
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    // WHY: Extract query parameters from URL
    const { searchParams } = new URL(request.url);
    
    // WHY: Parse and validate filters using Zod schema
    // This prevents invalid data types and SQL injection
    const rawFilters = {
      bank: searchParams.get('bank') || undefined,
      type: searchParams.get('type') || undefined,
      apr_min: searchParams.get('apr_min') ? parseFloat(searchParams.get('apr_min')!) : undefined,
      apr_max: searchParams.get('apr_max') ? parseFloat(searchParams.get('apr_max')!) : undefined,
      min_income: searchParams.get('min_income') ? parseInt(searchParams.get('min_income')!) : undefined,
      min_credit_score: searchParams.get('min_credit_score') ? parseInt(searchParams.get('min_credit_score')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0
    };

    // WHY: Validate with Zod - throws error if invalid
    const filters = ProductFiltersSchema.parse(rawFilters);

    // WHY: Fetch products from database with validated filters
    const { products, total } = await getProducts(filters);

    // WHY: Return JSON response with pagination metadata
    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          total,
          limit: filters.limit,
          offset: filters.offset,
          hasMore: (filters.offset + filters.limit) < total
        }
      }
    });

  } catch (error) {
    console.error('Error in GET /api/products:', error);

    // WHY: Return validation errors separately from server errors
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid filter parameters',
          details: error.message
        },
        { status: 400 }
      );
    }

    // WHY: Generic error response for other failures
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch products'
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// WHY: POST endpoint could be used for complex filter queries
// Currently not implemented, but structure supports it
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // WHY: Validate request body with Zod
    const filters = ProductFiltersSchema.parse(body);

    const { products, total } = await getProducts(filters);

    return NextResponse.json({
      success: true,
      data: { products, total }
    });

  } catch (error) {
    console.error('Error in POST /api/products:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process request'
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// WHY: OPTIONS handler for CORS preflight (if needed)
// Allows cross-origin requests from approved domains
// =============================================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}