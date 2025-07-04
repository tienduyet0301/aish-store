"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface Banner {
  _id: string;
  imageUrl: string;
  mobileImageUrl?: string;
  title: string;
  description: string;
  link: string;
  order: number;
  isActive: boolean;
}

const Banner = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const fetchBanners = useCallback(async () => {
    try {
      const response = await fetch("/api/banners");
      if (!response.ok) {
        throw new Error("Failed to fetch banners");
      }
      const data = await response.json();
      // Chỉ lấy các banner đang active
      const activeBanners = data.filter((banner: Banner) => banner.isActive);
      setBanners(activeBanners);
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [banners.length]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-[400px] bg-gray-100 animate-pulse flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden">
      {banners.map((banner, index) => (
        <div
          key={banner._id}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={getOptimizedImageUrl(isMobile && banner.mobileImageUrl ? banner.mobileImageUrl : banner.imageUrl)}
            alt={banner.title || "Banner"}
            fill
            className="object-cover"
            quality={70}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
            priority={index === 0}
            loading={index === 0 ? "eager" : "lazy"}
          />
          {(banner.title || banner.description) && (
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <div className="text-center text-white p-4 max-w-[90%] md:max-w-[80%]">
                {banner.title && (
                  <h2 className="text-xl md:text-3xl font-bold mb-2">{banner.title}</h2>
                )}
                {banner.description && (
                  <p className="text-sm md:text-lg">{banner.description}</p>
                )}
                {banner.link && (
                  <a
                    href={banner.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 px-4 md:px-6 py-2 bg-white text-black rounded-md hover:bg-gray-100 transition-colors text-sm md:text-base"
                  >
                    Learn More
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-colors ${
              index === currentIndex ? "bg-white" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

function getOptimizedImageUrl(url: string) {
  if (!url) return '';
  // Nếu là link Cloudinary thì thêm tham số nén
  if (url.includes('res.cloudinary.com')) {
    // Chỉ thêm nếu chưa có các tham số này
    if (!url.includes('q_auto') && !url.includes('f_auto')) {
      // Thêm vào sau /upload/
      return url.replace('/upload/', '/upload/q_auto,f_auto,w_1200/');
    }
  }
  return url;
}

export default Banner; 