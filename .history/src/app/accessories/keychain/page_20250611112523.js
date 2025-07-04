"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useProductFilters } from "../../../hooks/useProductFilters";
import ProductGrid from "../../../components/ProductGrid";
import FilterSection from "../../../components/FilterSection";
import SortSection from "../../../components/SortSection";
import NoProductsMessage from "../../../components/NoProductsMessage";
import { useLanguage } from "@/context/LanguageContext";

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:3000";

export default function KeychainPage() {
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [productImageIndex, setProductImageIndex] = useState({});
  const [isAutoSliding, setIsAutoSliding] = useState({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [activeButton, setActiveButton] = useState("keychain");
  const [hoveredButton, setHoveredButton] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(8);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const filterRef = useRef(null);
  const sortRef = useRef(null);
  const buttonRefs = {
    keychain: useRef(null),
    filters: useRef(null),
    sort: useRef(null),
  };
  const { t } = useLanguage();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        if (data.ok) {
          const keychainProducts = data.products
            .filter(product => product.category === "KEYCHAIN")
            .map(product => ({
              ...product,
              images: product.images?.map(url => 
                url.startsWith('http') ? url : `${DOMAIN}${url}`
              ) || []
            }));
          setProducts(keychainProducts);
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
    { value: "beige", label: t('products.filter.colorBeige') },
  ];
  const sizeLabels = [
    { value: "M", label: t('products.filter.sizeM') },
    { value: "L", label: t('products.filter.sizeL') },
    { value: "XL", label: t('products.filter.sizeXL') },
  ];

  const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

  const groupColorsByFirstLetter = () => {
    const grouped = { a: ["all"] };
    colorLabels.forEach((color) => {
      const firstLetter = color.value.charAt(0).toLowerCase();
      if (!grouped[firstLetter]) grouped[firstLetter] = [];
      grouped[firstLetter].push(color.value);
    });
    const sortedLetters = Object.keys(grouped).sort();
    return sortedLetters.reduce((acc, letter) => [...acc, ...grouped[letter]], []);
  };

  const sortOptions = [
    { value: "newest", label: t('products.sort.newest') },
    { value: "price-low-to-high", label: t('products.sort.priceLowToHigh') },
    { value: "price-high-to-low", label: t('products.sort.priceHighToLow') }
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (buttonRefs.filters.current?.contains(event.target) || buttonRefs.sort.current?.contains(event.target)) return;
      if (filterRef.current && !filterRef.current.contains(event.target)) setIsFilterOpen(false);
      if (sortRef.current && !sortRef.current.contains(event.target)) setIsSortOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!hoveredProduct || !isAutoSliding[hoveredProduct]) return;
    const interval = setInterval(() => {
      setProductImageIndex((prev) => {
        const currentIndex = prev[hoveredProduct] || 0;
        const product = products.find((p) => p._id === hoveredProduct);
        const nextIndex = (currentIndex + 1) % product.images.length;
        return { ...prev, [hoveredProduct]: nextIndex };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [hoveredProduct, isAutoSliding, products]);

  const handleProductHover = (productId) => {
    setHoveredProduct(productId);
    setIsAutoSliding((prev) => ({ ...prev, [productId]: true }));
    if (!productImageIndex[productId]) setProductImageIndex((prev) => ({ ...prev, [productId]: 0 }));
  };

  const handleProductLeave = () => {
    setHoveredProduct(null);
    setIsAutoSliding({});
    setProductImageIndex((prev) => {
      const newIndices = { ...prev };
      if (hoveredProduct) newIndices[hoveredProduct] = 0;
      return newIndices;
    });
  };

  const handlePrevImage = (e, productId) => {
    e.stopPropagation();
    setIsAutoSliding((prev) => ({ ...prev, [productId]: false }));
    const product = products.find((p) => p._id === productId);
    if (product) {
      const currentIndex = productImageIndex[productId] || 0;
      const prevIndex = (currentIndex - 1 + product.images.length) % product.images.length;
      setProductImageIndex((prev) => ({ ...prev, [productId]: prevIndex }));
    }
  };

  const handleNextImage = (e, productId) => {
    e.stopPropagation();
    setIsAutoSliding((prev) => ({ ...prev, [productId]: false }));
    const product = products.find((p) => p._id === productId);
    if (product) {
      const currentIndex = productImageIndex[productId] || 0;
      const nextIndex = (currentIndex + 1) % product.images.length;
      setProductImageIndex((prev) => ({ ...prev, [productId]: nextIndex }));
    }
  };

  const handleColorChange = (color) => {
    if (color === "all") setSelectedColors([]);
    else setSelectedColors((prev) => (prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]));
    setCurrentPage(1);
  };

  const handleSizeChange = (size) => {
    if (size === "all") setSelectedSizes([]);
    else setSelectedSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]));
    setCurrentPage(1);
  };

  const handleFilterButtonClick = (e) => {
    e.stopPropagation();
    setIsFilterOpen(!isFilterOpen);
    setIsSortOpen(false);
    setActiveButton("filters");
  };

  const handleSortButtonClick = (e) => {
    e.stopPropagation();
    setIsSortOpen(!isSortOpen);
    setIsFilterOpen(false);
    setActiveButton("sort");
  };

  const handleButtonHover = (buttonName) => setHoveredButton(buttonName);
  const handleButtonLeave = () => setHoveredButton(null);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

  const handlePageChange = (pageNumber) => {
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
                ref={buttonRefs.keychain}
                onMouseEnter={() => handleButtonHover("keychain")}
                onMouseLeave={handleButtonLeave}
                className="text-[10px] sm:text-[10px] font-bold uppercase text-black tracking-wider relative py-1 px-1"
              >
                {t('navbar.accessories')} / {t('navbar.keychain')}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <div className="absolute bottom-[-2px] left-0 right-0 h-[1px] overflow-hidden">
                    {(hoveredButton === "filters" || activeButton === "filters") && (
                      <motion.div
                        className="absolute inset-0 bg-black"
                        initial={{ width: 0, left: "50%" }}
                        animate={{ width: "100%", left: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                      />
                    )}
                  </div>
                </button>
              </div>
              <SortSection
                isSortOpen={isSortOpen}
                sortRef={sortRef}
                selectedSort={sortOption}
                handleSortChange={(option) => {
                  setSortOption(option);
                  setCurrentPage(1);
                  setIsSortOpen(false);
                }}
                handleCloseSort={() => setIsSortOpen(false)}
                handleApplySort={() => setIsSortOpen(!isSortOpen)}
                sortOptions={sortOptions}
                onMouseEnter={() => handleButtonHover("sort")}
                onMouseLeave={handleButtonLeave}
                hoveredButton={hoveredButton}
                activeButton={activeButton}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="px-2 sm:px-4 md:px-6 lg:px-8 py-4">
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
            colors={colorLabels.map(c => c.value)}
            sizes={sizeLabels.map(s => s.value)}
            capitalizeFirstLetter={capitalizeFirstLetter}
            groupedColors={groupColorsByFirstLetter()}
            title={t('products.filter.colorLabel')}
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
        )}
      </div>

      {sortedProducts.length > 0 ? (
        <ProductGrid
          products={currentProducts}
          productImageIndex={productImageIndex}
          handlePrevImage={handlePrevImage}
          handleNextImage={handleNextImage}
          onHover={handleProductHover}
          onLeave={handleProductLeave}
        />
      ) : (
        <NoProductsMessage
          message={t('products.noProducts')}
          backButtonText={t('products.back')}
        />
      )}
    </div>
  );
}