"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/admin/orders');
        const data = await response.json();
        if (data.ok) {
          setOrders(data.orders);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return price.toLocaleString('vi-VN') + ' VND';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-12">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-light text-black">Quản lý đơn hàng</h1>
        <div className="flex space-x-4">
          <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors duration-200">
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mã đơn hàng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Khách hàng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày đặt
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tổng tiền
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thanh toán
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order.orderCode}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.fullName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(order.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatPrice(order.total)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === "success"
                        ? "bg-green-100 text-green-800"
                        : order.status === "shipping"
                        ? "bg-blue-100 text-blue-800"
                        : order.status === "packed"
                        ? "bg-purple-100 text-purple-800"
                        : order.status === "confirmed"
                        ? "bg-yellow-100 text-yellow-800"
                        : order.status === "failed" || order.status === "customer_cancelled" || order.status === "hvc_cancelled"
                        ? "bg-red-100 text-red-800"
                        : order.status === "refunding"
                        ? "bg-orange-100 text-orange-800"
                        : order.status === "refunded"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {order.status === "pending" ? "Chờ xác nhận" :
                     order.status === "confirmed" ? "Đã xác nhận" :
                     order.status === "packed" ? "Đã đóng gói" :
                     order.status === "shipping" ? "Đang vận chuyển" :
                     order.status === "success" ? "Thành công" :
                     order.status === "failed" ? "Thất bại" :
                     order.status === "customer_cancelled" ? "Khách hủy" :
                     order.status === "hvc_cancelled" ? "HVC hủy" :
                     order.status === "refunding" ? "Đang hoàn" :
                     order.status === "refunded" ? "Đã hoàn" : order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.paymentStatus === "paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {order.paymentStatus === "paid" ? "Đã thanh toán" :
                     order.paymentStatus === "pending" ? "Chưa thanh toán" :
                     order.paymentStatus === "failed" ? "Thanh toán thất bại" : order.paymentStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 