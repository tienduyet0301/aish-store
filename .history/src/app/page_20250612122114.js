"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { FiMessageCircle } from "react-icons/fi";
import React from "react";
import Head from 'next/head';

const DEFAULT_BANNER_IMAGE = "/images/image1.jpg";
const SCROLL_ANIMATION_DURATION = 700;
const CACHE_KEY = 'banner_cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

function easeInOutCubic(t) {
  return t < 0.5
    ? 4 * t * t * t
    : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

// Thêm debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const LoadingSkeleton = () => (
  <div className="w-full h-screen bg-gradient-to-b from-gray-900 to-black animate-pulse">
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  </div>
);

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
        priority
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
        quality={98}
        loading="eager"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qLjg0PjU4Ojo7OjU4Ojo7Ojo7Ojo7Ojo7Ojo7Ojv/2wBDAR4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        style={{
          objectFit: 'cover',
          objectPosition: 'center',
          willChange: 'transform',
        }}
        onError={(e) => {
          e.target.src = DEFAULT_BANNER_IMAGE;
        }}
      />
    </div>
  </div>
));

BannerItem.displayName = 'BannerItem';

export default function Home() {
  const [currentImage, setCurrentImage] = useState(0);
  const [banners, setBanners] = useState([]);
  const [isScrolling, setIsScrolling] = useState(false);
  const router = useRouter();

  // Load banners from cache or API
  useEffect(() => {
    let ignore = false;

    const loadBanners = async () => {
      try {
        // Try to load from cache first
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          if (Date.now() - timestamp < CACHE_EXPIRY) {
            if (!ignore) {
              setBanners(data);
            }
          }
        }

        // Fetch fresh data from API
        const response = await fetch("/api/banners");
        const data = await response.json();
        
        if (!ignore && Array.isArray(data)) {
          const activeBanners = data.filter(b => b && b.imageUrl && b.isActive);
          
          // Process banners
          const processedBanners = await Promise.all(activeBanners.map(async (banner) => {
            const isMobile = await new Promise((resolve) => {
              const img = new window.Image();
              img.onload = () => {
                resolve(img.height > img.width);
              };
              img.src = banner.imageUrl;
            });
            return { ...banner, isMobile };
          }));

          // Update state and cache
          setBanners(processedBanners);
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            data: processedBanners,
            timestamp: Date.now()
          }));
        }
      } catch (error) {
        console.error('Error loading banners:', error);
        if (!ignore) {
          setBanners([]);
        }
      }
    };

    loadBanners();
    return () => {
      ignore = true;
    };
  }, []);

  // Preload images
  useEffect(() => {
    const preloadImages = async (urls) => {
      const promises = urls.map(url => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = url;
          img.onload = resolve;
          img.onerror = reject;
        });
      });
      await Promise.all(promises);
    };

    if (banners.length > 0) {
      preloadImages(banners.map(b => b.imageUrl));
    }
  }, [banners]);

  // Kiểm tra thiết bị
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileDevice(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Lọc banner theo thiết bị
  const filteredBanners = useMemo(() => {
    return banners.filter(banner => banner.isMobile === isMobileDevice);
  }, [banners, isMobileDevice]);

  // Scroll handler
  const handleScroll = useCallback(
    (e) => {
      if (filteredBanners.length < 2) return;
      const scrollY = window.scrollY;
      const winH = window.innerHeight;
      const imageIdx = Math.floor(scrollY / winH);
      if (imageIdx === filteredBanners.length - 1 && e.deltaY > 0) return;
      e.preventDefault();
      if (isScrolling) return;
      const delta = Math.sign(e.deltaY);
      const newIdx = Math.max(0, Math.min(filteredBanners.length - 1, imageIdx + delta));
      if (newIdx === currentImage) return;
      setIsScrolling(true);
      setCurrentImage(newIdx);
      const start = scrollY;
      const end = newIdx * winH;
      const startTime = performance.now();
      function animateScroll(now) {
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
    [filteredBanners.length, currentImage, isScrolling]
  );

  useEffect(() => {
    window.addEventListener("wheel", handleScroll, { passive: false });
    return () => window.removeEventListener("wheel", handleScroll);
  }, [handleScroll]);

  // Memoize banner items to prevent unnecessary re-renders
  const bannerItems = useMemo(() => {
    return filteredBanners.map((banner, idx) => (
      <BannerItem
        key={banner._id || idx}
        banner={banner}
        idx={idx}
      />
    ));
  }, [filteredBanners]);

  return (
    <>
      <Head>
        {filteredBanners.map((banner, idx) => (
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
