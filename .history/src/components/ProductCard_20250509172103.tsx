'use client';

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useWishlist } from '../context/WishlistContext';
import { Product } from '../types/product';
import Image from "next/image";
import { useRef, useState } from "react";

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
  const isLiked = isInWishlist(product._id);
  const [imageIndex, setImageIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  return (
    <Link href={`/products/${product._id}`} className="block">
      <motion.div
        className="relative group"
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
              className="object-contain object-center"
              sizes="(max-width: 768px) 50vw, 25vw"
              priority={currentImageIndex === 0}
            />
          </div>
        </div>
        <div className="p-4 flex flex-col items-center text-center">
          <h2 className="text-[11px] sm:text-[12px] md:text-[13px] font-bold text-black uppercase tracking-wide">
            {product.name}
          </h2>
          <p className="text-[11px] sm:text-[12px] md:text-sm text-gray-600 mt-3 sm:mt-4 font-medium">
            {product.price.toLocaleString('vi-VN')} VND
          </p>
          <span className="relative text-[9px] sm:text-[10px] md:text-[11px] font-bold uppercase text-black tracking-widest mt-1 sm:mt-2 inline-block group">
            Shop This
            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-black transition-all duration-300 group-hover:w-full" />
          </span>
        </div>
        <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product._id);
            }}
            className="text-black hover:text-gray-500 transition duration-300 bg-white bg-opacity-70 rounded-full p-0.5 sm:p-1"
          >
            <AnimatePresence>
              <motion.svg
                key={isLiked ? 'filled' : 'empty'}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                transition={{ duration: 0.2 }}
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 sm:h-4 sm:w-4"
                viewBox="0 0 24 24"
                fill={isLiked ? "currentColor" : "none"}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </motion.svg>
            </AnimatePresence>
          </button>
        </div>
      </motion.div>
    </Link>
  );
} 