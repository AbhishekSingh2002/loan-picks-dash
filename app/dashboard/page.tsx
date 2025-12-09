// =============================================================================
// WHY: Dashboard page shows top 5 loan products for user
// Personalized recommendations based on user profile
// Main landing page after authentication
// Dashboard Page (Top 5 Products) - 15 points
// =============================================================================

import { Suspense } from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getTopProductsForUser } from '@/lib/db';
import DashboardContent from '@/components/dashboard/DashboardContent';
import { Loader2 } from 'lucide-react';

// =============================================================================
// WHY: Main Dashboard component
// Protected route - requires authentication
// Shows personalized top 5 loan recommendations
// =============================================================================

export default async function DashboardPage() {
  const session = await auth();
  
  // WHY: Redirect unauthenticated users
  if (!session?.user) {
    redirect('/auth/signin');
  }

  // WHY: Fetch top 5 products for user
  const topProducts = await getTopProductsForUser(5);

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Top Loan Matches</h1>
          <p className="text-muted-foreground mt-2">
            Personalized recommendations based on your profile
          </p>
        </div>
      </div>

      <Suspense 
        fallback={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading your recommendations...</span>
          </div>
        }
      >
        <DashboardContent products={topProducts} />
      </Suspense>
    </div>
  );
}
