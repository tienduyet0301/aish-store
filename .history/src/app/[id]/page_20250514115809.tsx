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
  const { id: slug } = useParams();
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Product not found</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!product) return;

    if (!selectedSize) {
      toast.error("Vui lòng chọn size");
      return;
    }

    const sizeQuantity = product[`quantity${selectedSize}` as keyof Product] as number;
    if (quantity > sizeQuantity) {
      toast.error(`Chỉ còn ${sizeQuantity} sản phẩm size ${selectedSize}`);
      return;
    }

    // Tạo object chứa thông tin stock cho tất cả các size
    const stockInfo: { [key: string]: number } = {};
    product.sizes?.forEach(size => {
      const quantity = product[`quantity${size}` as keyof Product] as number;
      stockInfo[size] = quantity;
    });

    // Thêm sản phẩm vào giỏ hàng với thông tin stock đầy đủ
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: selectedSize,
      color: product.colors[0] || 'Default',
      quantity: quantity,
      cartItemId: Date.now(),
      stock: stockInfo,
      availableSizes: product.sizes || [],
      // Thêm thông tin stock cho size hiện tại
      currentStock: sizeQuantity
    });

    toast.success("Đã thêm vào giỏ hàng");
  };

  const handleQuantityChange = (value: number) => {
    if (!product || !selectedSize) return;
    
    const sizeQuantity = product[`quantity${selectedSize}` as keyof Product] as number;
    if (value > sizeQuantity) {
      toast.error(`Chỉ còn ${sizeQuantity} sản phẩm size ${selectedSize}`);
      return;
    }
    
    setQuantity(value);
  };

  const handlePrevImage = () => {
    if (!product || !product.images) return;
    setCurrentImageIndex((currentImageIndex - 1 + product.images.length) % product.images.length);
  };

  const handleNextImage = () => {
    if (!product || !product.images) return;
    setCurrentImageIndex((currentImageIndex + 1) % product.images.length);
  };

  const isClothing = product.category && product.category !== "CAP";
  const availableSizes = product.sizes || ["M", "L", "XL"];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Breadcrumb */}
      <div className="px-4 py-4 text-xs text-gray-600 mt-16">
        <span className="font-semibold uppercase underline">{product.category}</span>
        <span className="mx-2">/</span>
        <span className="text-black font-semibold uppercase underline">{product.name}</span>
      </div>

      <div className="flex flex-col md:flex-row w-full max-w-7xl mx-auto py-8 px-4 gap-8 flex-1">
        {/* Bên trái: Ảnh đầu tiên và 4 ảnh nhỏ */}
        <div className="flex-1 flex flex-col items-center">
          <div className="relative w-full flex justify-center items-center mt-6 mb-6" style={{height: '450px'}}>
            <Image
              src={product.images && product.images[currentImageIndex] ? product.images[currentImageIndex] : "/placeholder.jpg"}
              alt={product.name}
              width={450}
              height={450}
              quality={100}
              className="object-contain object-center w-full h-full"
              style={{ maxWidth: "90%", height: "auto" }}
              onClick={() => setShowFullImage(true)}
            />
            {product.images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-black/60 hover:text-black transition-all duration-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-black/60 hover:text-black transition-all duration-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
          <div className="flex gap-4 w-full justify-center mt-10">
            {product.images && product.images.slice(0, 4).map((img: string, index: number) => (
              <div 
                key={index} 
                className={`w-24 h-24 relative cursor-pointer border-2 transition-all duration-300 ${
                  currentImageIndex === index ? "border-black scale-105" : "border-gray-200 hover:border-gray-400"
                }`}
                onClick={() => setCurrentImageIndex(index)}
              >
                <Image
                  src={img}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  width={96}
                  height={96}
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Bên phải: Thông tin sản phẩm */}
        <div className="flex-1 flex flex-col">
          <h1 className="text-2xl font-semibold mb-2">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.description}</p>
          <p className="text-xl font-semibold mb-6">${product.price}</p>

          {/* Size Selection */}
          {isClothing && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold">Size</label>
                <button
                  onClick={() => setShowSizeGuide(true)}
                  className="text-sm text-gray-600 hover:text-black"
                >
                  Size guide
                </button>
              </div>
              <div className="flex gap-2">
                {availableSizes.map((size) => {
                  const sizeQuantity = product[`quantity${size}` as keyof Product] as number;
                  const isOutOfStock = sizeQuantity <= 0;
                  return (
                    <button
                      key={size}
                      onClick={() => !isOutOfStock && setSelectedSize(size)}
                      className={`flex-1 py-2 border ${
                        selectedSize === size
                          ? "border-black bg-black text-white"
                          : isOutOfStock
                          ? "border-gray-200 text-gray-400 cursor-not-allowed"
                          : "border-gray-300 hover:border-black"
                      }`}
                      disabled={isOutOfStock}
                    >
                      {size}
                      {isOutOfStock && " (Sold out)"}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selection */}
          <div className="mb-6">
            <label className="text-sm font-semibold block mb-2">Quantity</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleQuantityChange(Math.max(1, quantity - 1))}
                className="w-8 h-8 flex items-center justify-center border border-gray-300 hover:border-black"
              >
                -
              </button>
              <span className="w-8 text-center">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                className="w-8 h-8 flex items-center justify-center border border-gray-300 hover:border-black"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full py-3 bg-black text-white hover:bg-gray-800 transition-colors duration-300"
          >
            Add to Cart
          </button>

          {/* Product Details */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Product Details</h2>
            <div className="prose prose-sm">
              <div dangerouslySetInnerHTML={{ __html: product.details }} />
            </div>
          </div>

          {isClothing && (
            <button
              onClick={() => setShowSizeGuide(true)}
              className="inline-block text-left text-sm text-black mb-6 relative group transition-all duration-300"
              style={{ transform: 'none' }}
            >
              <span className="group-hover:font-semibold">Size guide</span>
              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-black group-hover:w-0 transition-all duration-300"></span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation và các thông tin phụ */}
      <div className="flex justify-between items-center px-8 py-4 text-xs text-gray-600 border-t">
        <div className="text-black">
          <span className="font-semibold uppercase underline">{product.category}</span>
          {" / "}
          <span className="font-semibold uppercase underline">{product.name}</span>
        </div>
        <div>
          <button 
            onClick={() => setShowHelpPanel(true)}
            className="hover:underline text-black font-semibold uppercase"
          >
            Cần giúp đỡ?
          </button>
        </div>
      </div>

      {/* Full Image Modal */}
      {showFullImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 overflow-y-auto" 
          onClick={() => setShowFullImage(false)}
        >
          <div className="min-h-screen w-full flex justify-center items-start">
            <Image
              src={product.images && product.images[currentImageIndex] ? product.images[currentImageIndex] : "/placeholder.jpg"}
              alt={product.name}
              width={2000}
              height={2000}
              quality={100}
              className="object-contain w-full"
              style={{ height: "auto" }}
            />
          </div>
        </div>
      )}

      {/* Help Panel */}
      {showHelpPanel && (
        <HelpPanel onClose={() => setShowHelpPanel(false)} />
      )}

      {/* Size Guide Modal */}
      {showSizeGuide && product.sizeGuideImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center"
          onClick={() => setShowSizeGuide(false)}
        >
          <div className="bg-white p-4 max-w-2xl w-full mx-4">
            <Image
              src={product.sizeGuideImage}
              alt="Size Guide"
              width={800}
              height={1000}
              className="w-full h-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
} 