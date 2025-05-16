import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Providers from "../components/Providers";
import AnnouncementBanner from "../components/AnnouncementBanner";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white text-black flex flex-col min-h-screen">
        <Providers>
          <Navbar />
          <AnnouncementBanner />
          <main className="flex-grow">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}