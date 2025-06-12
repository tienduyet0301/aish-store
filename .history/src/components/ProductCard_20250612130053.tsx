'use client';

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useWishlist } from '../context/WishlistContext';
import { useLanguage } from '../context/LanguageContext';
import { Product } from '../types/product';
import Image from "next/image";
import { useRef, useState, useEffect } from "react";

interface ProductCardProps {
  product: Product;
  currentImageIndex?: number;
  // handlePrevImage: (e: React.MouseEvent, productId: string) => void;
  // handleNextImage: (e: React.MouseEvent, productId: string) => void;
  // onHover: (productId: string) => void;
  // onLeave: () => void;
}

export default function ProductCard({
  product,
}: ProductCardProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { t, language } = useLanguage();
  const isLiked = isInWishlist(product._id);
  const [imageIndex, setImageIndex] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(26000); // Default fallback rate
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();
        if (data.rates && data.rates.VND) {
          setExchangeRate(data.rates.VND);
        }
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
      }
    };

    fetchExchangeRate();
    const interval = setInterval(fetchExchangeRate, 3600000);
    return () => clearInterval(interval);
  }, []);

  // Check if all sizes are out of stock
  const isOutOfStock = product.category === "CAP" 
    ? product.quantityHat <= 0
    : product.quantityM <= 0 && product.quantityL <= 0 && product.quantityXL <= 0;

  // Ensure we have valid images
  const defaultImage = "/images/placeholder.jpg"; // Add a placeholder image to your public folder
  const images = product.images && product.images.length > 0 ? product.images : [defaultImage];
  const currentImageIndex = imageIndex < images.length ? imageIndex : 0;

  const handleMouseEnter = () => {
    if (images.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setImageIndex(prev => (prev + 1) % images.length);
    }, 1000);
  };

  const handleMouseLeave = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setImageIndex(0);
  };

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(product);
  };

  // Format price based on language
  const formatPrice = (price: number) => {
    if (language === 'vi') {
      return `${price.toLocaleString('vi-VN')} VND`;
    } else {
      const usdPrice = (price / exchangeRate).toFixed(2);
      return `$${usdPrice}`;
    }
  };

  return (
    <div className="relative group">
      <Link href={isOutOfStock ? '#' : `/${product.slug}`} className={`block ${isOutOfStock ? 'cursor-not-allowed' : ''}`}>
        <motion.div
          className={`relative ${isOutOfStock ? 'opacity-50' : ''}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: Number(product._id) * 0.1 }}
        >
          <div className="w-full overflow-hidden rounded-md">
            <div className="relative h-[250px] sm:h-[350px]">
              <Image
                src={images[currentImageIndex]}
                alt={product.name || "Product Image"}
                fill
                quality={100}
                className={`object-contain object-center ${isOutOfStock ? 'opacity-70' : ''}`}
                sizes="(max-width: 768px) 50vw, 25vw"
                {...(currentImageIndex === 0 ? { priority: true } : { loading: "lazy" })}
              />
              {/* Badge giảm giá */}
              {product.discountPercent > 0 && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10 shadow">
                  -{product.discountPercent}%
                </div>
              )}
              {isOutOfStock && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-full flex justify-center pointer-events-none">
                  <span className="bg-white bg-opacity-80 px-2 py-0.5 rounded text-red-600 text-[10px] sm:text-[11px] md:text-[12px] font-bold uppercase tracking-wider">
                    {t('product.soldOut')}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="p-4 flex flex-col items-center text-center">
            <h2 className="text-[11px] sm:text-[12px] md:text-[13px] font-bold text-black uppercase tracking-wide">
              {product.name}
            </h2>
            {/* Giá sản phẩm */}
            {product.discountPercent && product.discountPercent > 0 ? (
              <div className="flex flex-col items-center">
                <span className="text-gray-400 line-through text-xs sm:text-sm">
                  {formatPrice(product.price)}
                </span>
                <span className="text-red-600 font-bold text-sm sm:text-base">
                  {formatPrice(Math.round(product.price * (1 - product.discountPercent / 100)))}
                </span>
              </div>
            ) : (
            <p className="text-[11px] sm:text-[12px] md:text-sm text-gray-600 mt-3 sm:mt-4 font-medium">
              {formatPrice(product.price)}
            </p>
            )}
            <span className="relative text-[9px] sm:text-[10px] md:text-[11px] font-bold uppercase text-black tracking-widest mt-1 sm:mt-2 inline-block group">
              {t('product.shopThis')}
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-black transition-all duration-300 group-hover:w-full" />
            </span>
          </div>
        </motion.div>
      </Link>
      
      <button
        onClick={handleWishlistClick}
        className="absolute top-2 right-2 z-20 bg-white bg-opacity-70 rounded-full p-1.5 hover:bg-opacity-100 transition-all duration-300"
        aria-label={isLiked ? t('product.removeFromWishlist') : t('product.addToWishlist')}
      >
        <AnimatePresence mode="wait">
          <motion.svg
            key={isLiked ? 'filled' : 'empty'}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            transition={{ duration: 0.2 }}
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 sm:h-5 sm:w-5"
            viewBox="0 0 24 24"
            fill={isLiked ? "black" : "none"}
            stroke="black"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </motion.svg>
        </AnimatePresence>
      </button>
    </div>
  );
} 