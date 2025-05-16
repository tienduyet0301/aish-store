'use client';

import { useWishlist } from '@/context/WishlistContext';
import { initialProducts } from "../data/products";
import ProductGrid from '@/components/ProductGrid';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function SavedItemsPage() {
  const { wishlist } = useWishlist();
  const [productImageIndex, setProductImageIndex] = useState({});
  const [hoveredProduct, setHoveredProduct] = useState(null);

  const handlePrevImage = (e, productId) => {
    e.stopPropagation();
    const product = wishlist.find((p) => p.id === productId);
    if (product) {
      const currentIndex = productImageIndex[productId] || 0;
      const prevIndex = (currentIndex - 1 + product.images.length) % product.images.length;
      setProductImageIndex((prev) => ({ ...prev, [productId]: prevIndex }));
    }
  };

  const handleNextImage = (e, productId) => {
    e.stopPropagation();
    const product = wishlist.find((p) => p.id === productId);
    if (product) {
      const currentIndex = productImageIndex[productId] || 0;
      const nextIndex = (currentIndex + 1) % product.images.length;
      setProductImageIndex((prev) => ({ ...prev, [productId]: nextIndex }));
    }
  };

  const handleProductHover = (productId) => {
    setHoveredProduct(productId);
    if (!productImageIndex[productId]) {
      setProductImageIndex((prev) => ({ ...prev, [productId]: 0 }));
    }
  };

  const handleProductLeave = () => {
    setHoveredProduct(null);
    if (hoveredProduct) {
      setProductImageIndex((prev) => ({ ...prev, [hoveredProduct]: 0 }));
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="h-[60px]"></div>
      <div className="px-2 sm:px-4 md:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="inline-block">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-black tracking-wider mb-2"
              style={{ letterSpacing: '0.2em' }}
            >
              SAVED ITEMS
            </motion.h1>
            <div className="h-[1px] bg-black"></div>
          </div>
          {wishlist.length > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg text-black mt-3"
            >
              You Have {wishlist.length} {wishlist.length === 1 ? 'Item' : 'Items'} In Saved Items.
            </motion.p>
          )}
        </div>
        
        {wishlist.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-gray-600 mb-4">Bạn chưa lưu sản phẩm nào.</p>
            <a 
              href="/products" 
              className="inline-block bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors"
            >
              Khám phá sản phẩm
            </a>
          </motion.div>
        ) : (
          <div className="mt-8">
            <ProductGrid
              products={wishlist}
              productImageIndex={productImageIndex}
              handlePrevImage={handlePrevImage}
              handleNextImage={handleNextImage}
              onHover={handleProductHover}
              onLeave={handleProductLeave}
            />
          </div>
        )}
      </div>
    </div>
  );
} 