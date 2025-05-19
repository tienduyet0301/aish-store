'use client';

import { SessionProvider } from 'next-auth/react';
import { WishlistProvider } from '../context/WishlistContext';

export function Providers({ children }) {
  return (
    <SessionProvider>
      <WishlistProvider>{children}</WishlistProvider>
    </SessionProvider>
  );
}