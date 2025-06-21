"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";
import Head from 'next/head';

// Type definitions
interface Banner {
  _id: string;
  imageUrl: string;
  title?: string;
  isMobile: boolean;
  blurDataURL?: string;
}

interface BannerItemProps {
  banner: Banner;
  idx: number;
}

interface BannerClientComponentProps {
  initialBanners: Banner[];
}


const DEFAULT_BANNER_IMAGE = "/images/image1.jpg";
const SCROLL_ANIMATION_DURATION = 700;

function easeInOutCubic(t: number) {
  return t < 0.5
    ? 4 * t * t * t
    : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

const BannerItem = React.memo(({ banner, idx }: BannerItemProps) => (
  <div
    key={banner._id || idx}
    className="relative w-full h-screen flex items-center justify-center m-0 p-0 overflow-hidden"
  >
    <div className="relative w-full h-full flex items-center justify-center bg-black m-0 p-0">
      <Image
        src={banner.imageUrl}
        alt={banner.title || `Banner ${idx + 1}`}
        fill
        className="object-cover"
        priority={idx === 0} // Prioritize first image
        loading={idx === 0 ? "eager" : "lazy"} // Eager load first, lazy the rest
        sizes="100vw"
        quality={90}
        placeholder="blur"
        blurDataURL={banner.blurDataURL || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"}
        style={{
          objectFit: 'cover',
          objectPosition: 'center',
          willChange: 'transform',
        }}
        onError={(e) => {
          (e.target as HTMLImageElement).src = DEFAULT_BANNER_IMAGE;
        }}
      />
    </div>
  </div>
));
BannerItem.displayName = 'BannerItem';


export default function BannerClientComponent({ initialBanners }: BannerClientComponentProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [banners] = useState(initialBanners); // Receive banners as prop
  const [isScrolling, setIsScrolling] = useState(false);
  const router = useRouter();

  // Preload images - This logic is preserved
  useEffect(() => {
    const preloadImages = (urls: string[]) => {
      urls.forEach(url => {
        const img = new (window as any).Image();
        img.src = url;
      });
    };

    if (banners.length > 0) {
      preloadImages(banners.map(b => b.imageUrl));
    }
  }, [banners]);

  // Scroll handler - This logic is IDENTICAL to the original page.js
  const handleScroll = useCallback(
    (e: WheelEvent) => {
      if (banners.length < 2) return;
      const scrollY = window.scrollY;
      const winH = window.innerHeight;
      const imageIdx = Math.floor(scrollY / winH);
      if (imageIdx === banners.length - 1 && e.deltaY > 0) return;
      e.preventDefault();
      if (isScrolling) return;
      const delta = Math.sign(e.deltaY);
      const newIdx = Math.max(0, Math.min(banners.length - 1, imageIdx + delta));
      if (newIdx === currentImage) return;
      setIsScrolling(true);
      setCurrentImage(newIdx);
      const start = scrollY;
      const end = newIdx * winH;
      const startTime = performance.now();
      function animateScroll(now: number) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / SCROLL_ANIMATION_DURATION, 1);
        window.scrollTo(0, start + (end - start) * easeInOutCubic(progress));
        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        } else {
          setIsScrolling(false);
        }
      }
      requestAnimationFrame(animateScroll);
    },
    [banners.length, currentImage, isScrolling]
  );

  useEffect(() => {
    window.addEventListener("wheel", handleScroll as EventListener, { passive: false });
    return () => window.removeEventListener("wheel", handleScroll as EventListener);
  }, [handleScroll]);

  // Memoize banner items to prevent unnecessary re-renders
  const bannerItems = useMemo(() => {
    return banners.map((banner, idx) => (
      <BannerItem
        key={banner._id || idx}
        banner={banner}
        idx={idx}
      />
    ));
  }, [banners]);

  if (!banners || banners.length === 0) {
    return (
       <div className="relative w-full h-screen flex items-center justify-center m-0 p-0 overflow-hidden bg-black">
          <div className="text-white text-center">
              <h2 className="text-2xl font-bold mb-4">Welcome to AISH</h2>
              <p>No active banners at the moment. Please check back later.</p>
          </div>
       </div>
    );
  }

  return (
    <>
      <Head>
        {banners.map((banner, idx) => (
          <link
            key={banner._id || idx}
            rel="preload"
            href={banner.imageUrl}
            as="image"
          />
        ))}
      </Head>
      <div className="relative w-full bg-black overflow-hidden">
        <div className="flex flex-col">
          {bannerItems}
        </div>

        {/* SHOP NOW text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          className="fixed top-24 left-8 z-20"
        >
          <button
            onClick={() => router.push("/products")}
            className="bg-white text-black px-4 py-1.5 md:px-6 md:py-2 text-xs md:text-sm font-semibold hover:bg-black hover:text-white transition-all duration-300"
          >
            SHOP NOW
          </button>
        </motion.div>
      </div>
    </>
  );
} 