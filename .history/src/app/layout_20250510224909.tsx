"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "../context/CartContext";
import { WishlistProvider } from "../context/WishlistContext";
import { OrderProvider } from "../context/OrderContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          <WishlistProvider>
            <OrderProvider>
              {children}
              <Toaster position="top-center" />
            </OrderProvider>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
} 