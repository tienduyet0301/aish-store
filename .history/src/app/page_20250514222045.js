"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { FiMessageCircle } from "react-icons/fi";
import Link from 'next/link';

const DEFAULT_BANNER_IMAGE = "/images/image1.jpg";
const SCROLL_ANIMATION_DURATION = 700;

function easeInOutCubic(t) {
  return t < 0.5
    ? 4 * t * t * t
    : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

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
          setBanners(
            Array.isArray(data)
              ? data.filter(b => b && b.imageUrl && b.isActive)
              : []
          );
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

  // Scroll handler
  const handleScroll = useCallback(
    (e) => {
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
    [banners.length, currentImage, isScrolling]
  );

  useEffect(() => {
    window.addEventListener("wheel", handleScroll, { passive: false });
    return () => window.removeEventListener("wheel", handleScroll);
  }, [handleScroll]);

  // Memoize banner items to prevent unnecessary re-renders
  const bannerItems = useMemo(() => {
    return banners.map((banner, idx) => (
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
            }}
            onError={(e) => {
              e.target.src = DEFAULT_BANNER_IMAGE;
            }}
          />
        </div>
      </div>
    ));
  }, [banners]);

  // Render fallback if no banners
  if (!banners.length) {
    return (
      <div className="h-screen flex items-center justify-center overflow-hidden">
        <div className="relative w-full h-full">
          <Image
            src={DEFAULT_BANNER_IMAGE}
            alt="Default Banner"
            fill
            className="object-cover"
            priority
            quality={98}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qLjg0PjU4Ojo7OjU4Ojo7Ojo7Ojo7Ojo7Ojo7Ojv/2wBDAR4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-black overflow-hidden">
      {/* Menu items */}
      <div className="flex flex-wrap justify-center gap-4 p-4 bg-white">
        <Link href="/tshirt" className="text-gray-600 hover:text-gray-900">TSHIRT</Link>
        <Link href="/shirt" className="text-gray-600 hover:text-gray-900">SHIRT</Link>
        <Link href="/polo" className="text-gray-600 hover:text-gray-900">POLO</Link>
        <Link href="/sweater" className="text-gray-600 hover:text-gray-900">SWEATER</Link>
        <Link href="/hoodie" className="text-gray-600 hover:text-gray-900">HOODIE</Link>
        <Link href="/accept-the-problem" className="text-gray-600 hover:text-gray-900">ACCEPT THE PROBLEM</Link>
        <Link href="/back-to-summer" className="text-gray-600 hover:text-gray-900">BACK TO SUMMER</Link>
        <Link href="/chill-calm-down" className="text-gray-600 hover:text-gray-900">CHILL, CALM DOWN</Link>
        <Link href="/return-policy" className="text-gray-600 hover:text-gray-900">RETURN POLICY</Link>
        <Link href="/warranty-policy" className="text-gray-600 hover:text-gray-900">WARRANTY POLICY</Link>
        <Link href="/care-instructions" className="text-gray-600 hover:text-gray-900">CARE INSTRUCTIONS</Link>
      </div>

      <div className="flex flex-col">
        {bannerItems}
      </div>

      {/* SHOP NOW text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.05 }}
        className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10"
      >
        <button
          onClick={() => router.push("/products")}
          className="bg-white text-black px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          SHOP NOW
        </button>
      </motion.div>

      {/* Chat button */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.1 }}
        className="fixed bottom-8 right-8 z-50"
      >
        <button
          className="bg-white text-black p-4 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          onClick={() => router.push("/contact")}
        >
          <FiMessageCircle size={24} />
        </button>
      </motion.div>
    </div>
  );
}
