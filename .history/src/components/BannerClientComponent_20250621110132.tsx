"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";

const DEFAULT_BANNER_IMAGE = "/images/image1.jpg";
const SCROLL_ANIMATION_DURATION = 700;

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
        priority={idx === 0}
        loading={idx === 0 ? "eager" : "lazy"}
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


export default function BannerClientComponent({ initialBanners }: BannerClientComponentProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [banners] = useState(initialBanners);
  const [isScrolling, setIsScrolling] = useState(false);
  const router = useRouter();

  const handleScroll = useCallback((e: WheelEvent) => {
      if (isScrolling || banners.length < 2) return;
      
      e.preventDefault();
      
      const delta = Math.sign(e.deltaY);
      const newIdx = currentImage + delta;

      if (newIdx < 0 || newIdx >= banners.length) {
        return;
      }
      
      setIsScrolling(true);
      
      const targetElement = document.getElementById(`banner-section-${newIdx}`);
      if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
      }

      // We need a way to know when scrolling is finished to set isScrolling to false.
      // A timeout is a simple way, but IntersectionObserver would be more robust.
      setTimeout(() => {
          setCurrentImage(newIdx);
          setIsScrolling(false)
      }, SCROLL_ANIMATION_DURATION + 100); // Allow some buffer
      
    }, [banners.length, currentImage, isScrolling]);
  
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
        if(!isScrolling) {
            handleScroll(e);
        } else {
            e.preventDefault();
        }
    }
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [handleScroll, isScrolling]);

  const bannerItems = useMemo(() => {
    return banners.map((banner, idx) => (
        <section
            id={`banner-section-${idx}`}
            key={banner._id || idx}
            className="h-screen w-full snap-start"
        >
            <BannerItem
                banner={banner}
                idx={idx}
            />
        </section>
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
    <div className="relative w-full bg-black overflow-hidden snap-y snap-mandatory h-screen">
      {bannerItems}
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