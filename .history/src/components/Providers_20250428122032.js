"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from '../context/CartContext';
import { OrderProvider } from '../context/OrderContext';
import { WishlistProvider } from '../context/WishlistContext';

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <OrderProvider>
        <CartProvider>
          <WishlistProvider>
            {children}
          </WishlistProvider>
        </CartProvider>
      </OrderProvider>
    </SessionProvider>
  );
} 