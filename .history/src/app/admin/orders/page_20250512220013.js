"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const orderStatuses = [
    { value: "pending", label: "Chờ xác nhận" },
    { value: "confirmed", label: "Đã xác nhận" },
    { value: "packed", label: "Đã đóng gói" },
    { value: "shipping", label: "Đang vận chuyển" },
    { value: "success", label: "Thành công" },
    { value: "failed", label: "Thất bại" },
    { value: "customer_cancelled", label: "Khách hủy" },
    { value: "hvc_cancelled", label: "HVC hủy" },
    { value: "refunding", label: "Đang hoàn" },
    { value: "refunded", label: "Đã hoàn" }
  ];

  const paymentStatuses = [
    { value: "paid", label: "Đã thanh toán" },
    { value: "pending", label: "Chưa thanh toán" },
    { value: "failed", label: "Thanh toán thất bại" }
  ];

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

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Cập nhật trạng thái trong state
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        ));
      } else {
        console.error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handlePaymentStatusChange = async (orderId, newPaymentStatus) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      });

      if (response.ok) {
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, paymentStatus: newPaymentStatus } : order
        ));
      } else {
        console.error('Failed to update payment status');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

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

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "shipping":
        return "bg-blue-100 text-blue-800";
      case "packed":
        return "bg-purple-100 text-purple-800";
      case "confirmed":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
      case "customer_cancelled":
      case "hvc_cancelled":
        return "bg-red-100 text-red-800";
      case "refunding":
        return "bg-orange-100 text-orange-800";
      case "refunded":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusLabel = (status) => {
    const statusObj = orderStatuses.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
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
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black`}
                  >
                    {orderStatuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={order.paymentStatus}
                    onChange={(e) => handlePaymentStatusChange(order._id, e.target.value)}
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black`}
                  >
                    {paymentStatuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 