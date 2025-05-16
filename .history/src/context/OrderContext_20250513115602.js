"use client";
import { createContext, useContext, useState, useEffect } from "react";

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const addOrder = async (newOrder) => {
    try {
      setOrders(prevOrders => [newOrder, ...prevOrders]);
      return true;
    } catch (error) {
      console.error('Error adding order:', error);
      throw new Error('Failed to add order');
    }
  };

  const resetOrders = () => {
    setOrders([]);
    setLoading(true);
  };

  // Fetch orders on initial load
  useEffect(() => {
    fetchOrders();
  }, []);

  // Set up polling to refresh orders every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const value = {
    orders,
    loading,
    refreshOrders: fetchOrders,
    addOrder,
    resetOrders
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}; 