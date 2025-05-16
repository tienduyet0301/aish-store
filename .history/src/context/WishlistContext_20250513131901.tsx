'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  // Add other product properties as needed
}

interface WishlistContextType {
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();

  // Load wishlist from API when user is logged in
  useEffect(() => {
    const loadWishlist = async () => {
      if (session?.user) {
        try {
          // Lấy danh sách từ localStorage trước
          const localWishlist = localStorage.getItem('wishlist');
          const localWishlistItems = localWishlist ? JSON.parse(localWishlist) : [];

          // Lấy danh sách từ API
          const response = await fetch('/api/wishlist');
          if (response.ok) {
            const data = await response.json();
            const serverWishlist = data.wishlist || [];

            // Nếu có sản phẩm trong localStorage, thêm vào database
            if (localWishlistItems.length > 0) {
              for (const product of localWishlistItems) {
                await fetch('/api/wishlist', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ productId: product._id }),
                });
              }
              // Xóa localStorage sau khi đồng bộ
              localStorage.removeItem('wishlist');
            }

            setWishlist(serverWishlist);
          }
        } catch (error) {
          console.error('Error loading wishlist:', error);
        }
      } else {
        // If not logged in, load from localStorage
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
          setWishlist(JSON.parse(savedWishlist));
        }
      }
      setIsLoading(false);
    };

    loadWishlist();
  }, [session]);

  const toggleWishlist = async (product: Product) => {
    if (session?.user) {
      // If logged in, use API
      try {
        const isInWishlist = wishlist.some(item => item._id === product._id);
        const response = await fetch('/api/wishlist', {
          method: isInWishlist ? 'DELETE' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId: product._id }),
        });

        if (response.ok) {
          setWishlist(prev => {
            if (isInWishlist) {
              return prev.filter(item => item._id !== product._id);
            } else {
              return [...prev, product];
            }
          });
        }
      } catch (error) {
        console.error('Error toggling wishlist:', error);
      }
    } else {
      // If not logged in, use localStorage
      setWishlist(prev => {
        const newWishlist = prev.some(item => item._id === product._id)
          ? prev.filter(item => item._id !== product._id)
          : [...prev, product];
        localStorage.setItem('wishlist', JSON.stringify(newWishlist));
        return newWishlist;
      });
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(item => item._id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, isLoading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
} 