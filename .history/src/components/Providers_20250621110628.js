"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from '../context/CartContext';
import { OrderProvider } from '../context/OrderContext';
import { WishlistProvider } from '../context/WishlistContext';
import { LanguageProvider } from "@/context/LanguageContext";
import { CheckoutProvider } from "@/context/CheckoutContext";

export default function Providers({ children }) {
  return (
    <SessionProvider refetchInterval={0}>
      <OrderProvider>
        <CartProvider>
          <WishlistProvider>
            <LanguageProvider>
              <CheckoutProvider>
              {children}
              </CheckoutProvider>
            </LanguageProvider>
          </WishlistProvider>
        </CartProvider>
      </OrderProvider>
    </SessionProvider>
  );
} 