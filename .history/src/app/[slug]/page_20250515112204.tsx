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
  const params = useParams();
  const pathname = usePathname();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState<number>(1);
  const { addToCart } = useCart();
  const [showFullImage, setShowFullImage] = useState(false);
  const [showHelpPanel, setShowHelpPanel] = useState(false);
  const [showSizeOptions, setShowSizeOptions] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showSelectSizeModal, setShowSelectSizeModal] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      // Ensure slug exists and is a string
      if (!params?.slug || typeof params.slug !== 'string') {
        console.error('Invalid slug:', params?.slug);
        return;
      }

      try {
        const response = await fetch(`/api/products/by-slug/${params.slug}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.ok) {
          setProduct(data.product);
        } else {
          throw new Error(data.error || 'Failed to load product');
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product");
      }
    };

    fetchProduct();
  }, [params?.slug]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Product not found</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      setShowSelectSizeModal(true);
      return;
    }

    const sizeQuantity = product[`quantity${selectedSize}`];
    if (sizeQuantity === 0) {
      toast.error(`Size ${selectedSize} đã hết hàng`);
      return;
    }

    if (quantity > sizeQuantity) {
      toast.error(`Chỉ còn ${sizeQuantity} sản phẩm cho size ${selectedSize}`);
      return;
    }

    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: selectedSize,
      quantity: quantity,
      color: product.colors && product.colors.length > 0 ? product.colors[0] : "Không xác định",
      currentStock: sizeQuantity
    });

    toast.success("Đã thêm vào giỏ hàng");
  };

  const handleQuantityChange = (value: number) => {
    if (!product || !selectedSize) {
      setShowSelectSizeModal(true);
      return;
    }
    
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
        <div className="flex-1 flex flex-col items-center md:items-start justify-start mt-8 md:mt-0">
          <div className="w-full max-w-xl">
            <h1 className="text-2xl font-bold text-center md:text-left mb-2 uppercase text-black">{product.name}</h1>
            <div className="text-xl font-semibold mb-4 text-black">
              {(product.price).toLocaleString('vi-VN')} VND
            </div>

            {isClothing ? (
              <div className="mb-6">
                <div className="relative">
                  <div className="grid grid-cols-3 gap-2">
                    {availableSizes.map((size) => {
                      const sizeQuantity = product[`quantity${size}` as keyof Product] as number;
                      const isOutOfStock = sizeQuantity === 0;
                      const isSelected = selectedSize === size && !isOutOfStock;
                      return (
                        <button
                          key={size}
                          onClick={() => {
                            if (!isOutOfStock) setSelectedSize(size);
                          }}
                          disabled={isOutOfStock}
                          className={
                            `py-2 px-4 border-2 text-sm font-medium border-black relative ` +
                            (isOutOfStock ? 'text-gray-400 bg-gray-100 opacity-60 cursor-not-allowed ' : '') +
                            (isSelected ? 'bg-black text-white ' : 'bg-white text-black ')
                          }
                          style={{ minWidth: 80, borderRadius: 0, transition: 'none', transform: 'none' }}
                        >
                          {size} - Còn {sizeQuantity} sản phẩm
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : product.category === "CAP" ? (
              <div className="mb-6">
                <p className="text-sm text-black">
                  Còn {product.quantityHat} sản phẩm
                </p>
              </div>
            ) : null}

            <div className="mb-6">
              <div className="text-sm font-medium mb-2 text-black">Số lượng:</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuantityChange(Math.max(1, quantity - 1))}
                  className="w-8 h-8 border border-black flex items-center justify-center text-black"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  className="w-12 h-8 text-center border border-black text-black focus:outline-none focus:border-black"
                />
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="w-8 h-8 border border-black flex items-center justify-center text-black"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mb-4 text-base">
              <p className="text-black">{product.description || "No description available."}</p>
            </div>

            <div className="mb-4 text-xs">
              <div className="font-medium mb-1 text-black">Chi tiết:</div>
              <p className="text-black whitespace-pre-line">{product.details || "No details available."}</p>
            </div>

            <button
              className="w-full bg-black text-white py-3 font-medium uppercase hover:bg-gray-900 transition mb-2"
              onClick={handleAddToCart}
              disabled={!!selectedSize && product[`quantity${selectedSize}`] === 0}
            >
              {selectedSize && product[`quantity${selectedSize}`] === 0
                ? "Hết hàng"
                : "Thêm vào giỏ hàng"}
            </button>

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
      <HelpPanel isOpen={showHelpPanel} onClose={() => setShowHelpPanel(false)} />

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div 
          className="fixed inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-50" 
          onClick={() => setShowSizeGuide(false)}
        >
          <div 
            className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 shadow-lg"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-left uppercase text-black">Hướng dẫn chọn size</h2>
              <button 
                onClick={() => setShowSizeGuide(false)}
                className="text-gray-500 hover:text-black"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div>
              <Image
                src={product.sizeGuideImage || "/size-guide.jpg"}
                alt="Size Guide"
                width={600}
                height={400}
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal chọn size */}
      {showSelectSizeModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center z-50">
          <div className="bg-white w-11/12 max-w-md relative">
            <button
              onClick={() => setShowSelectSizeModal(false)}
              className="absolute top-4 right-4 text-black"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="text-center py-8">
              <p style={{ fontSize: "0.7em", color: "#000000", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>
                VUI LÒNG CHỌN SIZE
              </p>
              <p style={{ fontSize: "0.9em", color: "#000000", marginBottom: "8px" }}>
                Bạn cần chọn size trước khi thêm sản phẩm vào giỏ hàng
              </p>
            </div>
            <div className="border-t border-gray-200">
              <button
                onClick={() => setShowSelectSizeModal(false)}
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "0.7em",
                  color: "#ffffff",
                  backgroundColor: "#000000",
                  border: "none",
                  cursor: "pointer",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em"
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 