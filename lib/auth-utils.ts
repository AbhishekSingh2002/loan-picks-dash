import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { User } from '@prisma/client';
import { verify } from 'jsonwebtoken';

export async function getCurrentUser(): Promise<User | null> {
  try {
    const session = await getServerSession(authOptions);
    return session?.user as User | null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Not authenticated');
  }
  return user;
}

// Note: Admin checks require a 'role' field on the User model in Prisma schema
// export async function requireAdmin() {
//   const user = await requireAuth();
//   if (user.role !== 'ADMIN') {
//     throw new Error('Not authorized');
//   }
//   return user;
// }

export function verifyAuthToken(token: string): { userId: string; email: string } | null {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const decoded = verify(token, JWT_SECRET) as any;
    return {
      userId: decoded.userId,
      email: decoded.email
    };
  } catch {
    return null;
  }
}
