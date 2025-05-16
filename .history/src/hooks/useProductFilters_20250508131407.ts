import { useState, useMemo } from "react";
import { Product } from "../types/product";

export const useProductFilters = (initialProducts: Product[]) => {
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string>("newest");

  const sortedProducts = useMemo(() => {
    let filteredProducts = [...initialProducts];

    // Lọc theo màu sắc
    if (selectedColors.length > 0) {
      filteredProducts = filteredProducts.filter(product => {
        if (!product.colors || !Array.isArray(product.colors)) return false;
        return selectedColors.some(selectedColor => 
          product.colors.some(color => color.toLowerCase() === selectedColor.toLowerCase())
        );
      });
    }

    // Lọc theo kích thước
    if (selectedSizes.length > 0) {
      filteredProducts = filteredProducts.filter(product => {
        const availableSizes: string[] = [];
        if (product.quantityM > 0) availableSizes.push('m');
        if (product.quantityL > 0) availableSizes.push('l');
        if (product.quantityXL > 0) availableSizes.push('xl');
        return selectedSizes.some(size => availableSizes.includes(size.toLowerCase()));
      });
    }

    // Sắp xếp sản phẩm
    switch (sortOption) {
      case "price-high-to-low":
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case "price-low-to-high":
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case "newest":
      default:
        filteredProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return filteredProducts;
  }, [initialProducts, selectedColors, selectedSizes, sortOption]);

  return {
    selectedColors,
    setSelectedColors,
    selectedSizes,
    setSelectedSizes,
    sortOption,
    setSortOption,
    sortedProducts,
  };
}; 