"use client";
import { createContext, useContext, useState, useEffect } from "react";

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);

  // Load orders from localStorage when component mounts
  useEffect(() => {
    const savedOrders = localStorage.getItem('userOrders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  // Save orders to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('userOrders', JSON.stringify(orders));
  }, [orders]);

  const addOrder = (newOrder) => {
    setOrders(prevOrders => [newOrder, ...prevOrders]);
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  return useContext(OrderContext);
} 