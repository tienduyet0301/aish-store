"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";

const DEFAULT_BANNER_IMAGE = "/images/image1.jpg";
const SCROLL_ANIMATION_DURATION = 700;

function easeInOutCubic(t) {
  return t < 0.5
    ? 4 * t * t * t
    : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

const BannerItem = React.memo(({ banner, idx }) => (
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
        priority={idx === 0} // Only prioritize the first image
        loading={idx === 0 ? "eager" : "lazy"} // Eager load the first, lazy load the rest
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
          e.currentTarget.src = DEFAULT_BANNER_IMAGE;
        }}
      />
    </div>
  </div>
));
BannerItem.displayName = 'BannerItem';


export default function BannerClientComponent({ initialBanners }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [banners, setBanners] = useState(initialBanners);
  const [isScrolling, setIsScrolling] = useState(false);
  const router = useRouter();

  // Scroll handler
  const handleScroll = useCallback(
    (e) => {
      if (isScrolling || banners.length < 2) return;
      
      e.preventDefault();
      
      const delta = Math.sign(e.deltaY);
      const newIdx = currentImage + delta;

      if (newIdx < 0 || newIdx >= banners.length) {
        return;
      }
      
      setIsScrolling(true);
      setCurrentImage(newIdx);

      const winH = window.innerHeight;
      const start = window.scrollY;
      const end = newIdx * winH;
      const startTime = performance.now();

      function animateScroll(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / SCROLL_ANIMATION_DURATION, 1);
        window.scrollTo(0, start + (end - start) * easeInOutCubic(progress));
        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        } else {
          // A short delay to prevent immediate re-triggering
          setTimeout(() => setIsScrolling(false), 100); 
        }
      }
      requestAnimationFrame(animateScroll);
    },
    [banners.length, currentImage, isScrolling]
  );
  
  // Attach scroll listener
  useEffect(() => {
    // Set scroll to top on mount
    window.scrollTo(0, 0);

    const debouncedScroll = (e) => {
        // Simple debounce, main logic is in handleScroll
        if (!isScrolling) {
            handleScroll(e);
        }
    };

    window.addEventListener("wheel", debouncedScroll, { passive: false });
    return () => window.removeEventListener("wheel", debouncedScroll);
  }, [handleScroll, isScrolling]);


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
    <div className="relative w-full bg-black overflow-hidden">
        <div className="flex flex-col" style={{ height: `${banners.length * 100}vh` }}>
            <div className="sticky top-0 h-screen">
                 {bannerItems[currentImage]}
            </div>
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
  );
} 