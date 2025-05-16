'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/models/product';
import ProductCard from '@/components/ProductCard';
import { useAuth } from '@/context/AuthContext';

export default function SavedItemsPage() {
  const [savedProducts, setSavedProducts] = useState<Product[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    // Get saved products from localStorage
    const savedItems = localStorage.getItem('savedItems');
    if (savedItems) {
      const parsedItems = JSON.parse(savedItems);
      setSavedProducts(parsedItems);
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Saved Items</h1>
      {savedProducts.length === 0 ? (
        <p className="text-gray-500">No saved items yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {savedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
} 