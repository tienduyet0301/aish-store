"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";
import FilterSection from "@/components/FilterSection";
import SortSection from "@/components/SortSection";
import NoProductsMessage from "@/components/NoProductsMessage";
import type { Product } from "@/types/product";
import { useProductFilters } from "@/hooks/useProductFilters";
import { LazyProductImage } from '@/components/lazy';
import { useLanguage } from "@/context/LanguageContext";

export default function ProductsPage() {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [productImageIndex, setProductImageIndex] = useState<{ [key: string]: number }>({});
  const [isAutoSliding, setIsAutoSliding] = useState<{ [key: string]: boolean }>({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [activeButton, setActiveButton] = useState("products");
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(8);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const pathname = usePathname();
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const buttonRefs = {
    products: useRef<HTMLButtonElement>(null),
    filters: useRef<HTMLButtonElement>(null),
    sort: useRef<HTMLButtonElement>(null),
  };

  const sortOptions = [
    { value: "newest", label: t('products.sort.newest') },
    { value: "price-high-to-low", label: t('products.sort.priceHighToLow') },
    { value: "price-low-to-high", label: t('products.sort.priceLowToHigh') }
  ];

  const handleSortChange = (value: string) => {
    setSortOption(value);
    setCurrentPage(1);
  };

  const handleCloseSort = () => setIsSortOpen(false);
  const handleApplySort = () => setIsSortOpen(!isSortOpen);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        if (data.ok) {
          setProducts(data.products);
        } else {
          setError(data.error || 'Failed to fetch products');
        }
      } catch (error) {
        setError('Failed to fetch products');
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const { selectedColors, setSelectedColors, selectedSizes, setSelectedSizes, sortOption, setSortOption, sortedProducts } =
    useProductFilters(products);

  const colors = ["black", "white", "blue", "grey"];

  const sizes = ["m", "l", "xl"];

  const handlePrevImage = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    const product = products.find(p => p._id === productId);
    if (product) {
      const currentIndex = productImageIndex[productId] || 0;
      const prevIndex = (currentIndex - 1 + product.images.length) % product.images.length;
      setProductImageIndex(prev => ({ ...prev, [productId]: prevIndex }));
    }
  };

  const handleNextImage = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    const product = products.find(p => p._id === productId);
    if (product) {
      const currentIndex = productImageIndex[productId] || 0;
      const nextIndex = (currentIndex + 1) % product.images.length;
      setProductImageIndex(prev => ({ ...prev, [productId]: nextIndex }));
    }
  };

  const handleHover = (productId: string) => {
    setHoveredProduct(productId);
    setIsAutoSliding(prev => ({ ...prev, [productId]: true }));
    if (!productImageIndex[productId]) {
      setProductImageIndex(prev => ({ ...prev, [productId]: 0 }));
    }
  };

  const handleLeave = () => {
    setHoveredProduct(null);
    setIsAutoSliding({});
    setProductImageIndex({});
  };

  const handleColorChange = (color: string) => {
    if (color === "all") {
      setSelectedColors([]);
    } else {
      setSelectedColors((prev: string[]) => 
        prev.includes(color) 
          ? prev.filter((c: string) => c !== color)
          : [...prev, color]
      );
    }
    setCurrentPage(1);
  };

  const handleSizeChange = (size: string) => {
    if (size === "all") {
      setSelectedSizes([]);
    } else {
      setSelectedSizes((prev: string[]) => 
        prev.includes(size) 
          ? prev.filter((s: string) => s !== size)
          : [...prev, size]
      );
    }
    setCurrentPage(1);
  };

  const handleFilterButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFilterOpen(!isFilterOpen);
    setIsSortOpen(false);
    setActiveButton("filters");
  };

  const handleSortButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSortOpen(!isSortOpen);
    setIsFilterOpen(false);
    setActiveButton("sort");
  };

  const handleButtonHover = (buttonName: string) => setHoveredButton(buttonName);
  const handleButtonLeave = () => setHoveredButton(null);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="h-[60px]"></div>

      {!isScrolled && !["/login", "/register"].includes(pathname) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="text-center text-gray-700 font-semibold text-[10px] sm:text-[12px] py-4 mt-1"
        >
          {t('navbar.thankYou')}
        </motion.div>
      )}

      <div className="sticky top-[60px] bg-white z-30 py-2 sm:py-4 border-b border-gray-100">
        <div className="px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center relative">
            <div className="inline-block">
              <button
                ref={buttonRefs.products}
                onMouseEnter={() => handleButtonHover("products")}
                onMouseLeave={handleButtonLeave}
                className="text-[10px] sm:text-[10px] font-bold uppercase text-black tracking-wider relative py-1 px-1"
              >
                {t('products.allProducts')}
                <div className="absolute bottom-[-2px] left-0 right-0 h-[1px] overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-black"
                    initial={{ width: "100%", left: 0 }}
                    animate={{ width: "100%", left: 0 }}
                    transition={{ duration: 0 }}
                  />
                </div>
              </button>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6">
              <div className="inline-block">
                <button
                  ref={buttonRefs.filters}
                  onClick={handleFilterButtonClick}
                  onMouseEnter={() => handleButtonHover("filters")}
                  onMouseLeave={handleButtonLeave}
                  className="text-[10px] sm:text-[10px] font-bold uppercase tracking-wider text-black hover:text-gray-600 flex items-center relative py-1"
                >
                  <span className="px-1">{t('products.filters')}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-2 w-2 sm:h-3 sm:w-3 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                </button>
              </div>
              <div className="inline-block">
                <button
                  ref={buttonRefs.sort}
                  onClick={handleSortButtonClick}
                  onMouseEnter={() => handleButtonHover("sort")}
                  onMouseLeave={handleButtonLeave}
                  className="text-[10px] sm:text-[10px] font-bold uppercase tracking-wider text-black hover:text-gray-600 flex items-center relative py-1"
                >
                  <span className="px-1">{t('products.sort.title')}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-2 w-2 sm:h-3 sm:w-3 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {isFilterOpen && (
              <FilterSection
                isFilterOpen={isFilterOpen}
                filterRef={filterRef}
                selectedColors={selectedColors}
                selectedSizes={selectedSizes}
                handleColorChange={handleColorChange}
                handleSizeChange={handleSizeChange}
                handleCloseFilter={() => setIsFilterOpen(false)}
                handleApplyFilter={() => setIsFilterOpen(false)}
                colors={colors}
                sizes={sizes}
                capitalizeFirstLetter={(str: string) => str.charAt(0).toUpperCase() + str.slice(1)}
                groupedColors={colors}
              />
            )}
          </div>
        </div>
      </div>

      <div className="px-0 sm:px-0 md:px-0 lg:px-0 mt-4 sm:mt-8">
        <div className="w-full">
          <main className="max-w-full mx-auto">
            {sortedProducts.length === 0 ? (
              <NoProductsMessage resetFilters={() => { setSelectedColors([]); setSelectedSizes([]); }} />
            ) : (
              <>
                <ProductGrid products={currentProducts} />
                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-4 sm:mt-8 space-x-2 sm:space-x-4">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-2 py-1 sm:px-4 sm:py-2 text-[10px] sm:text-sm font-medium text-black bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <div className="flex space-x-1 sm:space-x-2">
                      {Array.from({ length: totalPages }, (_, index) => (
                        <button
                          key={index + 1}
                          onClick={() => handlePageChange(index + 1)}
                          className={`px-2 py-1 text-[10px] sm:text-sm font-medium rounded ${
                            currentPage === index + 1 ? "bg-black text-white" : "bg-gray-100 text-black hover:bg-gray-200"
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-2 py-1 sm:px-4 sm:py-2 text-[10px] sm:text-sm font-medium text-black bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      <footer className="py-8 sm:py-12 mt-12 sm:mt-16 border-t border-gray-100 text-left sm:text-center px-2 sm:px-4 md:px-6 lg:px-8">
        <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider">© 2025 AISH. All Rights Reserved.</p>
      </footer>
    </div>
  );
} 