import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import MyChatBot from "@/components/ChatBot";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AISH",
  description: "AISH - Your Fashion Destination",
  openGraph: {
    images: [
      {
        url: "https://i.ibb.co/Fk8htk0p/BANNER0-1.jpg",
        width: 1200,
        height: 630,
        alt: "AISH - Your Fashion Destination",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <Providers>
            <Navbar />
            <AnnouncementBanner />
            <main className="flex-grow">{children}</main>
            <Footer />
          </Providers>
          <MyChatBot />
        </div>
      </body>
    </html>
  );
} 