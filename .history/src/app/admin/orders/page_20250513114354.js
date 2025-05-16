"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import React from "react";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const router = useRouter();

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

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

      if (!response.ok) throw new Error('Failed to update status');
      
      // Refresh orders after update
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handlePaymentStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentStatus: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update payment status');
      
      // Refresh orders after update
      fetchOrders();
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Không thể xóa đơn hàng');
      }

      // Cập nhật lại danh sách đơn hàng sau khi xóa thành công
      setOrders(orders.filter(order => order._id !== orderId));
      alert('Xóa đơn hàng thành công');
    } catch (error) {
      console.error('Error deleting order:', error);
      alert(error.message || 'Có lỗi xảy ra khi xóa đơn hàng. Vui lòng thử lại.');
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
        <h1 className="text-2xl font-bold text-black">Quản lý đơn hàng</h1>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => [
              <tr key={order._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 cursor-pointer underline hover:text-blue-600" onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => handleDeleteOrder(order._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Xóa
                  </button>
                </td>
              </tr>,
              expandedOrderId === order._id && (
                <tr key={order._id + '-expand'}>
                  <td colSpan={8}>
                    <div className="bg-white border border-gray-300 rounded-lg shadow p-6 mb-2 text-black">
                      <div className="mb-4 border-b pb-2">
                        <b>Khách hàng:</b> {order.fullName}<br/>
                        <b>Số điện thoại:</b> {order.phone}
                      </div>
                      <div className="mb-4 border-b pb-2">
                        <b>Địa chỉ:</b> {[order.address, order.apartment, order.ward, order.district, order.province].filter(Boolean).join(", ")}
                      </div>
                      <div className="mb-4 border-b pb-2">
                        <b>Sản phẩm:</b>
                        <ul className="list-disc pl-5 mt-1">
                          {order.items && order.items.map((item, idx) => (
                            <li key={idx}>
                              <b>{item.name}</b> (Size: {item.size}, SL: {item.quantity}, Giá: {item.price?.toLocaleString('vi-VN')} VND)
                            </li>
                          ))}
                        </ul>
                      </div>
                      {order.promoCode && (
                        <div className="mb-4 border-b pb-2">
                          <b>Mã giảm giá:</b> {order.promoCode} (-{order.promoAmount?.toLocaleString('vi-VN')} VND)
                        </div>
                      )}
                      <div>
                        <b>Tổng tiền:</b> {order.total?.toLocaleString('vi-VN')} VND
                      </div>
                    </div>
                  </td>
                </tr>
              )
            ])}
          </tbody>
        </table>
      </div>
    </div>
  );
} 