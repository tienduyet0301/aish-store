"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-hot-toast";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
  color: string;
}

interface Order {
  _id: string;
  orderCode: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
  fullName: string;
  email: string;
  phone: string;
  additionalPhone?: string;
  apartment?: string;
  address: string;
  ward: string;
  district: string;
  province: string;
  paymentMethod: string;
}

export default function OrderSuccessPage() {
  const params = useParams();
  const orderCode = params?.orderCode as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders?orderCode=${orderCode}`);
        if (!response.ok) {
          throw new Error('Failed to fetch order');
        }

        const data = await response.json();
        if (data.ok && data.order) {
          setOrder(data.order);
        } else {
          throw new Error(data.error || 'Failed to load order');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Failed to load order details');
      } finally {
        setIsLoading(false);
      }
    };

    if (orderCode) {
      fetchOrder();
    }
  }, [orderCode]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-xl mb-4">Order not found</p>
        <Link href="/" className="text-blue-600 hover:underline">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">Thank you for your purchase</p>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-gray-600">Order Number</p>
                <p className="font-semibold text-black">{order.orderCode || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-semibold text-black">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-semibold text-green-600">{order.status || 'Pending'}</p>
            </div>
          </div>

          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-black mb-4">Order Details</h2>
            <div className="space-y-4">
              {order.items && order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="relative w-20 h-20">
                    <Image
                      src={item.image || '/placeholder.png'}
                      alt={item.name || 'Product'}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-black">{item.name || 'N/A'}</p>
                    <p className="text-sm text-gray-600">
                      Size: {item.size || 'N/A'} | Quantity: {item.quantity || 0}
                    </p>
                    <p className="text-sm text-gray-600">
                      {((item.price || 0) * (item.quantity || 0)).toLocaleString('vi-VN')} VND
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-black mb-4">Shipping Information</h2>
            <div className="space-y-2">
              <p className="text-black">{order.fullName || 'N/A'}</p>
              <p className="text-gray-600">{order.address || 'N/A'}</p>
              {order.apartment && (
                <p className="text-gray-600">{order.apartment}</p>
              )}
              <p className="text-gray-600">Phone: {order.phone || 'N/A'}</p>
              {order.additionalPhone && (
                <p className="text-gray-600">
                  Additional Phone: {order.additionalPhone}
                </p>
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <p className="text-lg font-semibold text-black">Total Amount</p>
              <p className="text-lg font-semibold text-black">
                {(order.totalAmount || 0).toLocaleString('vi-VN')} VND
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">Payment Method</p>
              <p className="text-sm text-gray-600">
                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
} 