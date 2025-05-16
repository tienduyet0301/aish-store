"use client";

import { useWishlist } from '@/context/WishlistContext';
import ProductGrid from '@/components/ProductGrid';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function SavedItemsPage() {
  const { wishlist } = useWishlist();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-8"
      >
        Saved Items ({wishlist.length})
      </motion.h1>

      {wishlist.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">You haven't saved any items yet.</p>
        </div>
      ) : (
        <ProductGrid products={wishlist} />
      )}
    </div>
  );
} 