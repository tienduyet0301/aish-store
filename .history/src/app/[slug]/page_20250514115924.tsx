"use client";

import { useState, useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useCart } from "@/context/CartContext";
import { Product } from "@/types/product";
import Image from "next/image";
import Link from "next/link";
import HelpPanel from "@/components/HelpPanel";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const pathname = usePathname();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();
  const [showFullImage, setShowFullImage] = useState(false);
  const [showHelpPanel, setShowHelpPanel] = useState(false);
  const [showSizeOptions, setShowSizeOptions] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/by-slug/${slug}`);
        const data = await response.json();
        if (data.ok) {
          setProduct(data.product);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  // ... rest of the code remains the same ...
} 