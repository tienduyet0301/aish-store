"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function SearchBar({ isSearchOpen, setIsSearchOpen }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsSearchOpen]);

  // Thêm debounce để tránh gọi API quá nhiều
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Không thể tìm kiếm sản phẩm');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductClick = (product) => {
    router.push(`/${product.slug}`);
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <motion.div
      ref={searchRef}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`absolute top-[55px] right-0 w-full sm:w-1/2 bg-white shadow-md p-4 flex flex-col ${
        searchResults.length > 0 ? 'h-[80vh]' : 'h-[15vh]'
      }`}
    >
      <div className="relative w-full flex items-center gap-2">
        <div className="relative flex-1">
          {searchQuery === "" && (
            <motion.span
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 font-semibold text-xs pointer-events-none"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              What are you looking for?
            </motion.span>
          )}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full pt-2 pb-2 text-sm text-black font-semibold focus:outline-none border-b-2 border-gray-300 pl-3"
          />
          <motion.span
            className="absolute left-0 bottom-0 h-[2px] bg-black"
            initial={{ width: "0%" }}
            animate={isFocused ? { width: "100%" } : { width: "0%" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
        <button
          className="text-gray-700 text-sm font-semibold px-2 relative group"
          onClick={() => {
            setIsSearchOpen(false);
            setSearchQuery("");
            setSearchResults([]);
          }}
        >
          Cancel
          <span className="absolute left-1/2 bottom-0 h-[2px] bg-black transition-all duration-300 w-0 group-hover:w-[70%] -translate-x-1/2"></span>
        </button>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="flex-1 overflow-y-auto mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {searchResults.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center gap-4 p-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleProductClick(product)}
                >
                  {product.images && product.images[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-16 h-16 object-cover"
                    />
                  )}
                  <div>
                    <h3 className="text-sm font-semibold text-black">{product.name}</h3>
                    <p className="text-xs text-gray-600">{product.price.toLocaleString('vi-VN')} VND</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {searchQuery && !isLoading && searchResults.length === 0 && (
        <div className="text-center text-gray-500 mt-4 text-sm">
          Không tìm thấy sản phẩm
        </div>
      )}
    </motion.div>
  );
}