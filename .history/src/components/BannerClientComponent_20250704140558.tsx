"use client";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  isMobile?: boolean;
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
const SCROLL_ANIMATION_DURATION = 850; // Tăng thời gian animation
const SCROLL_THRESHOLD = 50;

function easeInOutCubic(t: number) {
  return t < 0.5
    ? 4 * t * t * t
    : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

// Thêm easing function mượt hơn
function easeInOutQuart(t: number) {
  return t < 0.5
    ? 8 * t * t * t * t
    : 1 - 8 * (--t) * t * t * t;
}

// Debounce function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | undefined;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function để xử lý scroll mạnh
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

function HeroNotificationOverlay() {
  const [hero, setHero] = useState<any>(null);
  const [countdown, setCountdown] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/notifications")
      .then(res => res.json())
      .then(data => {
        if (data.hero) setHero(data.hero);
      });
  }, []);

  useEffect(() => {
    if (!hero?.expiry) return;
    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(hero.expiry);
      const diff = end.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdown({days:0,hours:0,minutes:0,seconds:0});
        clearInterval(interval);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setCountdown({days,hours,minutes,seconds});
    }, 1000);
    return () => clearInterval(interval);
  }, [hero]);

  if (!hero || !hero.title) return null;
  return (
    <div style={{position:'absolute',left:0,right:0,bottom:'10%',zIndex:10,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',pointerEvents:'none'}}>
      <h1 style={{fontSize:'3rem',fontWeight:700,color:'#fff',textShadow:'0 2px 8px #000'}}>{hero.title}</h1>
      <div style={{fontSize:'1.2rem',color:'#fff',marginTop:8,textShadow:'0 2px 8px #000'}}>{hero.content}</div>
      {hero.expiry && countdown && (
        <div style={{display:'flex',gap:32,marginTop:24,alignItems:'center',justifyContent:'center'}}>
          {[{label:'DAYS',value:countdown.days},{label:'HOURS',value:countdown.hours},{label:'MINUTES',value:countdown.minutes},{label:'SECONDS',value:countdown.seconds}].map((item,idx,arr)=>(
            <React.Fragment key={item.label}>
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',minWidth:60}}>
                <span style={{fontSize:'2.5rem',fontWeight:600,color:'#fff',lineHeight:1}}>{item.value.toString().padStart(2,'0')}</span>
                <span style={{fontSize:'0.9rem',color:'#fff',marginTop:4,letterSpacing:2}}>{item.label}</span>
              </div>
              {idx<arr.length-1 && <div style={{height:40,width:1,background:'#fff',opacity:0.5,margin:'0 12px'}}/>}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
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
        style={{
          objectFit: 'cover',
          objectPosition: 'center',
          willChange: 'transform',
        }}
        onError={(e) => {
          (e.target as HTMLImageElement).src = DEFAULT_BANNER_IMAGE;
        }}
      />
      {/* Overlay hero notification chỉ ở banner đầu tiên */}
      {idx === 0 && <HeroNotificationOverlay />}
    </div>
  </div>
));
BannerItem.displayName = 'BannerItem';

export default function BannerClientComponent({ initialBanners }: BannerClientComponentProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const router = useRouter();
  const lastScrollTimeRef = useRef(0);
  const animationRef = useRef<number | undefined>(undefined);
  const scrollQueueRef = useRef<number[]>([]); // Queue để lưu các scroll event
  const isAnimatingRef = useRef(false); // Ref để track animation state

  // Process banners to determine mobile/desktop
  useEffect(() => {
    let ignore = false;
    const processBanners = async () => {
        const processed = await Promise.all(initialBanners.map(async (banner) => {
            const isMobile = await new Promise<boolean>((resolve) => {
              const img = new (window as any).Image();
              img.onload = () => resolve(img.height > img.width);
              img.onerror = () => resolve(false);
              img.src = banner.imageUrl;
            });
            return { ...banner, isMobile };
        }));

        if (!ignore) {
            setBanners(processed);
        }
    }
    
    if (initialBanners.length > 0) {
        processBanners();
    }

    return () => { ignore = true; };
  }, [initialBanners]);

  // Check device type
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileDevice(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Scroll to top when component mounts
  useEffect(() => {
    // Scroll về đầu trang khi vào website
    window.scrollTo(0, 0);
  }, []);

  // Filter banners by device type
  const filteredBanners = useMemo(() => {
    return banners.filter(banner => banner.isMobile === isMobileDevice);
  }, [banners, isMobileDevice]);

  // Function để xử lý scroll animation
  const performScrollAnimation = useCallback((targetIndex: number) => {
    if (isAnimatingRef.current) return; // Nếu đang animate, không làm gì
    
    const currentScrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const targetScrollY = targetIndex * windowHeight;
    
    // Nếu đã ở vị trí đích, không cần animate
    if (Math.abs(currentScrollY - targetScrollY) < 10) {
      return;
    }
    
    isAnimatingRef.current = true;
    setIsScrolling(true);
    setCurrentImage(targetIndex);
    
    const startTime = performance.now();
    
    function animateScroll(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / SCROLL_ANIMATION_DURATION, 1);
      
      const newScrollY = currentScrollY + (targetScrollY - currentScrollY) * easeInOutQuart(progress);
      window.scrollTo(0, newScrollY);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animateScroll);
      } else {
        // Animation hoàn thành
        isAnimatingRef.current = false;
        setIsScrolling(false);
        animationRef.current = undefined;
        
        // Xử lý queue nếu có
        if (scrollQueueRef.current.length > 0) {
          const nextTarget = scrollQueueRef.current.shift();
          if (nextTarget !== undefined) {
            setTimeout(() => performScrollAnimation(nextTarget), 50);
          }
        }
      }
    }
    
    // Dừng animation hiện tại nếu có
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    animationRef.current = requestAnimationFrame(animateScroll);
  }, []);

  // Improved scroll handler with queue system
  const handleScroll = useCallback(
    (e: WheelEvent) => {
      if (filteredBanners.length < 2) return;
      
      const delta = Math.sign(e.deltaY);
      const currentScrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const currentIndex = Math.round(currentScrollY / windowHeight);
      
      // If scrolling down and we're at the last banner, allow normal scroll to footer
      if (delta > 0 && currentIndex >= filteredBanners.length - 1) {
        return; // Allow normal scroll behavior
      }
      
      // If scrolling up and we're at the top, allow normal scroll
      if (delta < 0 && currentIndex <= 0) {
        return; // Allow normal scroll behavior
      }
      
      e.preventDefault();
      
      let newIndex = currentIndex + delta;
      
      // Ensure newIndex is within bounds
      if (newIndex < 0) newIndex = 0;
      if (newIndex >= filteredBanners.length) newIndex = filteredBanners.length - 1;
      
      // Don't scroll if we're already at the target position
      if (newIndex === currentIndex) return;
      
      // Nếu đang animate, thêm vào queue
      if (isAnimatingRef.current) {
        // Chỉ giữ lại target cuối cùng trong queue để tránh queue quá dài
        scrollQueueRef.current = [newIndex];
        return;
      }
      
      // Thực hiện animation ngay lập tức
      performScrollAnimation(newIndex);
    },
    [filteredBanners.length, performScrollAnimation]
  );

  // Add scroll listener with better performance
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Scroll ngay lập tức khi lăn chuột
      handleScroll(e);
    };
    
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [handleScroll]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Memoize banner items
  const bannerItems = useMemo(() => {
    return filteredBanners.map((banner, idx) => (
      <BannerItem
        key={banner._id || idx}
        banner={banner}
        idx={idx}
      />
    ));
  }, [filteredBanners]);

  // Loading state
  if (banners.length === 0 && initialBanners.length > 0) {
    return (
        <div className="w-full h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
  }
  
  // No banners state
  if (bannerItems.length === 0) {
    return (
       <div className="relative w-full h-screen flex items-center justify-center m-0 p-0 overflow-hidden bg-black">
          <div className="text-white text-center">
              <h2 className="text-2xl font-bold mb-4">Welcome to AISH</h2>
              <p>No active banners for your device at the moment.</p>
          </div>
       </div>
    );
  }

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
        <div className="flex flex-col" style={{ height: `${filteredBanners.length * 100}vh` }}>
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