import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import AnnouncementBanner from "@/components/AnnouncementBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AISH",
  description: "AISH - Your Fashion Destination",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          <Providers>
            <Navbar />
            <AnnouncementBanner />
            <main className="flex-grow">{children}</main>
            <Footer />
          </Providers>
        </LanguageProvider>
      </body>
    </html>
  );
} 