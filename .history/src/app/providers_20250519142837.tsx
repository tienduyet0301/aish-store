'use client';

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { WishlistProvider } from '../context/WishlistContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <WishlistProvider>{children}</WishlistProvider>
    </SessionProvider>
  );
}