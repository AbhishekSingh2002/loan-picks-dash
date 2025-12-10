'use client';

import { useSession, signOut } from 'next-auth/react';
import { Header } from '@/components/layout/Header';

export default function AuthHeader() {
  const { data: session } = useSession();

  const user = session?.user
    ? {
        name: session.user.name || session.user.email || 'User',
        email: session.user.email || '',
      }
    : undefined;

  return (
    <Header
      user={user}
      onLogout={() => signOut({ callbackUrl: '/auth/signin' })}
    />
  );
}
