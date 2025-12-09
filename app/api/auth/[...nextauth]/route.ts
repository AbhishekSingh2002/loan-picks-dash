// =============================================================================
// WHY: NextAuth.js API route configuration
// Implements OAuth-based authentication with Google and GitHub providers
// Secure session management with HttpOnly cookies
// =============================================================================

import NextAuth from 'next-auth';
import { authOptions } from '@/auth';

// Export the handler using the centralized auth configuration
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
