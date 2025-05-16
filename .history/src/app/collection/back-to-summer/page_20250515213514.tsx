"use client";
import { useState, useEffect, useRef } from "react";
import { useProductFilters } from "../../../hooks/useProductFilters";
import ProductGrid from "../../../components/ProductGrid";
import FilterSection from "../../../components/FilterSection";
import SortSection from "../../../components/SortSection";
import NoProductsMessage from "../../../components/NoProductsMessage";
import { Product } from "../../../types/product";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

export default function BackToSummerPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [productImageIndex, setProductImageIndex] = useState<{ [key: string]: number }>({});
  const filterRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const sortRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        if (data.ok) {
          const filteredProducts = data.products.filter(
            (product: Product) => product.collection === "BACK TO SUMMER"
          );
          setProducts(filteredProducts);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const { selectedColors, setSelectedColors, selectedSizes, setSelectedSizes, sortOption, setSortOption, sortedProducts } =
    useProductFilters(products);

  const colorLabels = [
    { value: "black", label: t('products.filter.colorBlack') },
    { value: "white", label: t('products.filter.colorWhite') },
    { value: "blue", label: t('products.filter.colorBlue') },
    { value: "grey", label: t('products.filter.colorGrey') },
  ];
  const sizeLabels = [
    { value: "M", label: t('products.filter.sizeM') },
    { value: "L", label: t('products.filter.sizeL') },
    { value: "XL", label: t('products.filter.sizeXL') },
  ];

  const groupColorsByFirstLetter = () => {
    const grouped: { [key: string]: string[] } = { a: ["all"] };
    colorLabels.forEach((color) => {
      const firstLetter = color.value.charAt(0).toLowerCase();
      if (!grouped[firstLetter]) grouped[firstLetter] = [];
      grouped[firstLetter].push(color.value);
    });
    const sortedLetters = Object.keys(grouped).sort();
    return sortedLetters.reduce((acc, letter) => [...acc, ...grouped[letter]], [] as string[]);
  };

  const handlePrevImage = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    setProductImageIndex(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) - 1
    }));
  };

  const handleNextImage = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    setProductImageIndex(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const handleHover = (productId: string) => {
    setProductImageIndex(prev => ({
      ...prev,
      [productId]: 1
    }));
  };

  const handleLeave = () => {
    setProductImageIndex({});
  };

  const resetFilters = () => {
    setSelectedColors([]);
    setSelectedSizes([]);
    setSortOption("newest");
  };

  const handleColorChange = (color: string) => {
    if (color === "all") {
      setSelectedColors([]);
    } else {
      setSelectedColors(prev => 
        prev.includes(color) 
          ? prev.filter(c => c !== color)
          : [...prev, color]
      );
    }
  };

  const handleSizeChange = (size: string) => {
    if (size === "all") {
      setSelectedSizes([]);
    } else {
      setSelectedSizes(prev => 
        prev.includes(size) 
          ? prev.filter(s => s !== size)
          : [...prev, size]
      );
    }
  };

  const handleCloseFilter = () => {
    setIsFilterOpen(false);
  };

  const handleApplyFilter = () => {
    setIsFilterOpen(false);
  };

  const handleCloseSort = () => {
    setIsSortOpen(false);
  };

  const handleApplySort = () => {
    setIsSortOpen(!isSortOpen);
  };

  const handleSortChange = (value: string) => {
    setSortOption(value);
  };

  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const sortOptions = [
    { value: "newest", label: t('products.sort.newest') },
    { value: "price-low-to-high", label: t('products.sort.priceLowToHigh') },
    { value: "price-high-to-low", label: t('products.sort.priceHighToLow') }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="w-full px-0 py-8 bg-white">
      <h1 className="text-2xl font-bold mb-8 text-center">{t('collection.backToSummer')}</h1>
      
      <div className="flex flex-wrap items-center justify-between border-b border-gray-100 pb-2 mb-4 px-4">
        <button
          onMouseEnter={() => setHoveredButton("collection")}
          onMouseLeave={() => setHoveredButton(null)}
          className="text-[10px] sm:text-[10px] font-bold uppercase tracking-wider text-black relative py-1 px-1 bg-transparent border-none outline-none"
          style={{ background: "none", border: "none" }}
        >
          {t('collection.backToSummer')}
          <div className="absolute bottom-[-2px] left-0 right-0 h-[1px] overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-black"
              initial={{ width: "100%", left: 0 }}
              animate={{ width: "100%", left: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            />
          </div>
        </button>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsFilterOpen(true)}
            onMouseEnter={() => setHoveredButton("filters")}
            onMouseLeave={() => setHoveredButton(null)}
            className="text-[10px] sm:text-[10px] font-bold uppercase tracking-wider text-black hover:text-gray-600 flex items-center relative py-1"
            style={{ background: "none", border: "none" }}
          >
            <span className="px-1">{t('products.filters')}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-2 w-2 sm:h-3 sm:w-3 ml-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <div className="absolute bottom-[-2px] left-0 right-0 h-[1px] overflow-hidden">
              {(hoveredButton === "filters") && (
                <motion.div
                  className="absolute inset-0 bg-black"
                  initial={{ width: 0, left: "50%" }}
                  animate={{ width: "100%", left: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                />
              )}
            </div>
          </button>
          <SortSection
            isSortOpen={isSortOpen}
            sortRef={sortRef}
            selectedSort={sortOption}
            handleSortChange={(option) => setSortOption(option)}
            handleCloseSort={() => setIsSortOpen(false)}
            handleApplySort={() => setIsSortOpen(!isSortOpen)}
            sortOptions={sortOptions}
            onMouseEnter={() => setHoveredButton("sort")}
            onMouseLeave={() => setHoveredButton(null)}
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8 px-4">
        <FilterSection
          isFilterOpen={isFilterOpen}
          filterRef={filterRef}
          selectedColors={selectedColors}
          selectedSizes={selectedSizes}
          handleColorChange={handleColorChange}
          handleSizeChange={handleSizeChange}
          handleCloseFilter={() => setIsFilterOpen(false)}
          handleApplyFilter={() => setIsFilterOpen(false)}
          colors={colorLabels.map(c => c.value)}
          sizes={sizeLabels.map(s => s.value)}
          capitalizeFirstLetter={capitalizeFirstLetter}
          groupedColors={groupColorsByFirstLetter()}
          title={t('products.filter.title')}
          colorLabel={t('products.filter.colorLabel')}
          sizeLabel={t('products.filter.sizeLabel')}
          applyLabel={t('products.filter.apply')}
          resetLabel={t('products.filter.reset')}
          allColorsLabel={t('products.filter.allColors')}
          allSizesLabel={t('products.filter.allSizes')}
          selectHint={t('products.filter.selectHint')}
          closeLabel={t('products.filter.close')}
          colorLabels={colorLabels}
          sizeLabels={sizeLabels}
        />
      </div>

      {sortedProducts.length > 0 ? (
        <ProductGrid 
          products={sortedProducts}
        />
      ) : (
        <NoProductsMessage
          resetFilters={resetFilters}
        />
      )}
    </div>
  );
} 