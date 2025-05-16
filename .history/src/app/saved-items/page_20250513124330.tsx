'use client';

import { useWishlist } from '@/context/WishlistContext';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';

export default function SavedItemsPage() {
  const { wishlist } = useWishlist();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Saved Items</h1>
      
      {wishlist.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-4">No saved items yet</h2>
          <p className="text-gray-600 mb-6">Items you save will appear here</p>
          <Link 
            href="/products" 
            className="text-blue-600 hover:underline"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
} 