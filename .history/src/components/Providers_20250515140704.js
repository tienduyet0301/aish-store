"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from '../context/CartContext';
import { OrderProvider } from '../context/OrderContext';
import { WishlistProvider } from '../context/WishlistContext';
import { LanguageProvider } from "@/context/LanguageContext";

export default function Providers({ children }) {
  return (
    <SessionProvider refetchInterval={0}>
      <OrderProvider>
        <CartProvider>
          <WishlistProvider>
            <LanguageProvider>
              {children}
            </LanguageProvider>
          </WishlistProvider>
        </CartProvider>
      </OrderProvider>
    </SessionProvider>
  );
} 