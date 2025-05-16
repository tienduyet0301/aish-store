import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
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
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <Providers>
            <Navbar />
            <AnnouncementBanner />
            <main className="flex-grow">{children}</main>
            <Footer />
          </Providers>
        </div>
      </body>
    </html>
  );
} 