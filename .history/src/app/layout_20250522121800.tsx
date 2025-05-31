import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { CartProvider } from "@/context/CartContext";
import { SessionProvider } from "next-auth/react";
import { AddressProvider } from "@/context/AddressContext";
import { CheckoutProvider } from "@/context/CheckoutContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AISH",
  description: "AISH - Thời trang nam",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <CartProvider>
            <AddressProvider>
              <CheckoutProvider>
                <div className="flex flex-col min-h-screen">
                  <Providers>
                    <Navbar />
                    <AnnouncementBanner />
                    <main className="flex-grow">{children}</main>
                    <Footer />
                  </Providers>
                </div>
              </CheckoutProvider>
            </AddressProvider>
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
} 