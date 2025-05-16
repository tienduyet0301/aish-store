"use client";
import { motion } from "framer-motion";
import { useRef, useEffect } from "react";
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import Image from 'next/image';

export default function CartDropdown({ navigateWithLoader }) {
  const { cartItems, isCartOpen, setIsCartOpen } = useCart();
  const { t, language } = useLanguage();
  const cartRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const cartIcon = document.querySelector('[data-testid="cart-icon"]');
      if (cartRef.current && !cartRef.current.contains(event.target) && event.target !== cartIcon) {
        setIsCartOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsCartOpen]);

  // Tính tổng giá trị giỏ hàng
  const total = cartItems.reduce((sum, item) => {
    const itemPrice = parseFloat(item.price) || 0;
    const itemQuantity = parseInt(item.quantity) || 0;
    return sum + (itemPrice * itemQuantity);
  }, 0);

  // Format price based on language
  const formatPrice = (price) => {
    if (language === 'vi') {
      return `${price.toLocaleString('vi-VN')} VND`;
    } else {
      // Convert VND to USD (assuming 1 USD = 24,500 VND)
      const usdPrice = (price / 24500).toFixed(2);
      return `$${usdPrice}`;
    }
  };

  return (
    <motion.div
      ref={cartRef}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`absolute top-[55px] right-4 sm:right-10 w-72 sm:w-120 h-80 sm:h-100 bg-white shadow-md flex flex-col z-50 ${!isCartOpen && 'hidden'}`}
    >
      <div className="text-sm font-semibold text-gray-800 border-b border-gray-200 px-4 sm:px-6 py-3 sticky top-0 bg-white z-10 flex justify-between items-center">
        <span>{t('cart.title')}</span>
        <button 
          onClick={() => setIsCartOpen(false)}
          className="text-xs text-gray-500 hover:text-black"
        >
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
        {cartItems.length === 0 ? (
          <div className="h-full flex justify-center items-center">
            <p className="text-sm text-gray-500">{t('cart.empty')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item, index) => {
              const itemPrice = parseFloat(item.price) || 0;
              const itemQuantity = parseInt(item.quantity) || 0;
              const itemTotal = itemPrice * itemQuantity;

              return (
                <div 
                  key={`${item.name}-${item.size}-${item.color}-${index}`} 
                  className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0"
                >
                  <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100">
                    {item.image && item.image !== "" ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-xs text-gray-400">{t('product.noImage')}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {item.name}
                    </h3>
                    <div className="mt-1 text-[10px] text-gray-500 space-y-0.5">
                      {item.size && <p>{t('product.size')}: {item.size}</p>}
                      {item.color && <p>{t('product.color')}: {item.color}</p>}
                      <p>{t('product.quantity')}: {itemQuantity}</p>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-gray-900">
                      {formatPrice(itemTotal)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {cartItems.length > 0 && (
        <div className="border-t border-gray-200 px-4 sm:px-6 py-3 sticky bottom-0 bg-white z-10 space-y-2">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-900">{t('cart.total')}:</span>
            <span className="text-sm font-semibold text-gray-900">
              {formatPrice(total)}
            </span>
          </div>
          <button
            className="w-full bg-black text-white text-sm font-semibold py-2 px-4 hover:bg-gray-800 transition-colors"
            onClick={() => navigateWithLoader("/checkout")}
          >
            {t('cart.checkout')}
          </button>
          <button
            className="w-full bg-white text-black text-sm font-semibold py-2 px-4 border border-black hover:bg-gray-100 transition-colors"
            onClick={() => navigateWithLoader("/cart")}
          >
            {t('cart.viewCart')}
          </button>
        </div>
      )}
    </motion.div>
  );
}