"use client";
import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  // Đọc cartItems từ localStorage khi khởi tạo
  const [cartItems, setCartItems] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cartItems");
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Lưu cartItems vào localStorage mỗi khi thay đổi
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const addToCart = (item) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id && i.size === item.size);
      if (existingItem) {
        return prevItems.map(i => 
          i.id === item.id && i.size === item.size 
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prevItems, item];
    });
    setIsCartOpen(true);
  };

  const removeItem = (itemId) => {
    setCartItems(prevItems => {
      const itemToRemove = prevItems.find(item => item.cartItemId === itemId || item.id === itemId);
      if (!itemToRemove) return prevItems;
      
      const indexToRemove = prevItems.findIndex(item => 
        item.cartItemId === itemToRemove.cartItemId || 
        (item.id === itemToRemove.id && item.size === itemToRemove.size)
      );
      
      if (indexToRemove === -1) return prevItems;
      
      return [
        ...prevItems.slice(0, indexToRemove),
        ...prevItems.slice(indexToRemove + 1)
      ];
    });
  };

  const updateQuantity = (itemId, newQuantity, newSize = null) => {
    setCartItems(prevItems => 
      prevItems.map(item => {
        if (item.cartItemId === itemId || item.id === itemId) {
          return {
            ...item,
            quantity: newQuantity,
            ...(newSize && { size: newSize })
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("cartItems");
    }
  };

  const toggleCart = () => {
    setIsCartOpen((prev) => !prev);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        setCartItems,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}