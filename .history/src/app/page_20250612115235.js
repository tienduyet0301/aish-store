"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { FiMessageCircle } from "react-icons/fi";
import Head from 'next/head';
import React from "react";

const DEFAULT_BANNER_IMAGE = "/images/image1.jpg";
const SCROLL_ANIMATION_DURATION = 700;

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
  <div className="animate-pulse">
    <div className="h-screen bg-gray-200"></div>
  </div>
);

const BannerItem = React.memo(({ banner, idx, isFirst }) => (
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
        priority={isFirst}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
        quality={isFirst ? 98 : 75}
        loading={isFirst ? "eager" : "lazy"}
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

  // Fetch banners only once
  useEffect(() => {
    let ignore = false;
    async function fetchBanners() {
      try {
        const response = await fetch("/api/banners");
        const data = await response.json();
        if (!ignore) {
          // Lọc banner active và phân loại desktop/mobile
          const activeBanners = Array.isArray(data)
            ? data.filter(b => b && b.imageUrl && b.isActive)
            : [];

          // Chỉ xử lý banner đầu tiên ngay lập tức
          if (activeBanners.length > 0) {
            const firstBanner = activeBanners[0];
            const isMobile = await new Promise((resolve) => {
              const img = new window.Image();
              img.onload = () => {
                resolve(img.height > img.width);
              };
              img.src = firstBanner.imageUrl;
            });
            setBanners([{ ...firstBanner, isMobile }]);

            // Xử lý các banner còn lại sau
            if (activeBanners.length > 1) {
              setTimeout(async () => {
                const remainingBanners = await Promise.all(
                  activeBanners.slice(1).map(async (banner) => {
                    const isMobile = await new Promise((resolve) => {
                      const img = new window.Image();
                      img.onload = () => {
                        resolve(img.height > img.width);
                      };
                      img.src = banner.imageUrl;
                    });
                    return { ...banner, isMobile };
                  })
                );
                setBanners(prev => [...prev, ...remainingBanners]);
              }, 1000);
            }
          }
        }
      } catch (error) {
        if (!ignore) setBanners([]);
      }
    }
    fetchBanners();
    return () => {
      ignore = true;
    };
  }, []);

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

  // Tối ưu scroll handler
  const handleScroll = useCallback(
    debounce((e) => {
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
        // Sử dụng transform thay vì scrollTo
        const translateY = start + (end - start) * easeInOutCubic(progress);
        document.body.style.transform = `translateY(-${translateY}px)`;
        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        } else {
          setIsScrolling(false);
          document.body.style.transform = '';
          window.scrollTo(0, end);
        }
      }
      requestAnimationFrame(animateScroll);
    }, 16), // 60fps
    [filteredBanners.length, currentImage, isScrolling]
  );

  useEffect(() => {
    window.addEventListener("wheel", handleScroll, { passive: false });
    return () => window.removeEventListener("wheel", handleScroll);
  }, [handleScroll]);

  // Memoize banner items to prevent unnecessary re-renders
  const bannerItems = useMemo(() => {
    return filteredBanners.map((banner, idx) => (
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
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
            quality={idx === 0 ? 98 : 75}
            loading={idx === 0 ? "eager" : "lazy"}
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
  }, [filteredBanners]);

  // Render fallback if no banners
  if (!filteredBanners.length) {
    return <LoadingSkeleton />;
  }

  return (
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
  );
}
