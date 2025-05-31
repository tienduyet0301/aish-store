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
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    phone: string;
    additionalPhone?: string;
    apartment?: string;
  };
  paymentMethod: string;
}

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params?.orderId as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || window.location.origin;
        const response = await fetch(`${baseUrl}/api/orders/${orderId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch order');
        }

        const data = await response.json();
        if (data.ok) {
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

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

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
                <p className="font-semibold text-black">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-semibold text-black">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-semibold text-green-600">{order.status}</p>
            </div>
          </div>

          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-black mb-4">Order Details</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="relative w-20 h-20">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-black">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      Size: {item.size} | Quantity: {item.quantity}
                    </p>
                    <p className="text-sm text-gray-600">
                      {(item.price * item.quantity).toLocaleString('vi-VN')} VND
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-black mb-4">Shipping Information</h2>
            <div className="space-y-2">
              <p className="text-black">
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              </p>
              <p className="text-gray-600">{order.shippingAddress.address}</p>
              {order.shippingAddress.apartment && (
                <p className="text-gray-600">{order.shippingAddress.apartment}</p>
              )}
              <p className="text-gray-600">Phone: {order.shippingAddress.phone}</p>
              {order.shippingAddress.additionalPhone && (
                <p className="text-gray-600">
                  Additional Phone: {order.shippingAddress.additionalPhone}
                </p>
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <p className="text-lg font-semibold text-black">Total Amount</p>
              <p className="text-lg font-semibold text-black">
                {order.totalAmount.toLocaleString('vi-VN')} VND
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">Payment Method</p>
              <p className="text-sm text-gray-600">{order.paymentMethod}</p>
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