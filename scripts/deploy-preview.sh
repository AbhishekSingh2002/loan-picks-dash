#!/bin/bash

# =============================================================================
# WHY: Automated deployment script for preview environments
# Creates isolated preview deployments for each branch/PR
# Used in CI/CD pipeline (GitHub Actions, GitLab CI, etc.)
# =============================================================================

set -e  # Exit on error

echo "🚀 Starting deployment preview..."

# =============================================================================
# WHY: Environment variables validation
# Ensures all required variables are set before deployment
# =============================================================================

if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL is not set"
  exit 1
fi

if [ -z "$VERCEL_TOKEN" ]; then
  echo "⚠️  WARNING: VERCEL_TOKEN not set, skipping Vercel deployment"
fi

# =============================================================================
# WHY: Get branch/commit information
# Used to create unique preview URL and environment
# =============================================================================

BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)
COMMIT_SHA=$(git rev-parse --short HEAD)
PREVIEW_URL="https://${BRANCH_NAME}-${COMMIT_SHA}.preview.loanpicks.app"

echo "📦 Branch: $BRANCH_NAME"
echo "🔖 Commit: $COMMIT_SHA"
echo "🌐 Preview URL: $PREVIEW_URL"

# =============================================================================
# WHY: Install dependencies
# Uses pnpm for faster, more efficient installs
# =============================================================================

echo "📥 Installing dependencies..."
pnpm install --frozen-lockfile

# =============================================================================
# WHY: Run linting and type checking
# Catches errors before deployment
# =============================================================================

echo "🔍 Running linting..."
pnpm lint

echo "🔍 Type checking..."
pnpm type-check

# =============================================================================
# WHY: Run database migrations
# Creates preview database schema from Prisma schema
# Uses separate database URL for preview environment
# =============================================================================

echo "🗄️  Running database migrations..."

# Create preview database URL (append branch name)
PREVIEW_DATABASE_URL="${DATABASE_URL}_preview_${BRANCH_NAME/\//_}"

# Export for Prisma
export DATABASE_URL="$PREVIEW_DATABASE_URL"

# Run migrations
pnpm prisma migrate deploy

# =============================================================================
# WHY: Seed preview database
# Populates preview DB with test data for demonstration
# =============================================================================

echo "🌱 Seeding preview database..."
pnpm db:seed

# =============================================================================
# WHY: Build application
# Creates optimized production build
# =============================================================================

echo "🏗️  Building application..."
pnpm build

# =============================================================================
# WHY: Deploy to Vercel (if token provided)
# Creates preview deployment on Vercel platform
# =============================================================================

if [ -n "$VERCEL_TOKEN" ]; then
  echo "🚀 Deploying to Vercel..."
  
  # Install Vercel CLI if not present
  if ! command -v vercel &> /dev/null; then
    pnpm add -g vercel
  fi
  
  # Deploy with preview configuration
  vercel deploy \
    --token="$VERCEL_TOKEN" \
    --build-env DATABASE_URL="$PREVIEW_DATABASE_URL" \
    --build-env NEXT_PUBLIC_API_URL="$PREVIEW_URL" \
    --env DATABASE_URL="$PREVIEW_DATABASE_URL" \
    --env NEXT_PUBLIC_API_URL="$PREVIEW_URL"
  
  echo "✅ Deployment successful!"
  echo "🌐 Preview URL: $PREVIEW_URL"
else
  echo "⚠️  Skipping Vercel deployment (no token)"
fi

# =============================================================================
# WHY: Run smoke tests on preview deployment
# Validates deployment is working correctly
# =============================================================================

echo "🧪 Running smoke tests..."

# Wait for deployment to be ready
sleep 10

# Test homepage
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PREVIEW_URL" || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Homepage is accessible"
else
  echo "❌ Homepage returned HTTP $HTTP_CODE"
  exit 1
fi

# Test API endpoint
API_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PREVIEW_URL/api/products" || echo "000")

if [ "$API_CODE" = "200" ]; then
  echo "✅ API is accessible"
else
  echo "❌ API returned HTTP $API_CODE"
  exit 1
fi

# =============================================================================
# WHY: Post deployment summary
# Provides links and information for reviewers
# =============================================================================

echo ""
echo "═══════════════════════════════════════════════════════"
echo "✅ Preview Deployment Complete!"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "🌐 Preview URL:     $PREVIEW_URL"
echo "🗄️  Database:       $PREVIEW_DATABASE_URL"
echo "🌿 Branch:          $BRANCH_NAME"
echo "🔖 Commit:          $COMMIT_SHA"
echo ""
echo "📝 To view the preview:"
echo "   1. Open: $PREVIEW_URL"
echo "   2. Check logs: vercel logs $PREVIEW_URL"
echo "   3. View metrics: vercel inspect $PREVIEW_URL"
echo ""
echo "🧹 To cleanup preview:"
echo "   ./scripts/cleanup-preview.sh $BRANCH_NAME"
echo ""
echo "═══════════════════════════════════════════════════════"

# =============================================================================
# WHY: Exit successfully
# =============================================================================

exit 0