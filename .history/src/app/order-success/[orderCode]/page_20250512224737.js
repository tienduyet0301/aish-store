"use client";
import { useEffect, useState, use } from 'react';
import { useOrders } from '../../../context/OrderContext';
import { useRouter } from 'next/navigation';
import HelpPanel from '../../../components/HelpPanel';

export default function OrderSuccessPage({ params }) {
  const unwrappedParams = use(params);
  const { orderCode } = unwrappedParams;
  const { orders, loading } = useOrders();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    if (!loading && orders) {
      const foundOrder = orders.find(o => o.orderCode === orderCode);
      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        // Nếu không tìm thấy đơn hàng, chuyển hướng về trang chủ sau 3 giây
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    }
  }, [orderCode, orders, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">Không tìm thấy thông tin đơn hàng</p>
          <p className="text-sm text-gray-600">Bạn sẽ được chuyển hướng về trang chủ trong giây lát...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-center mb-6">Đặt hàng thành công!</h1>
          <div className="text-center mb-6">
            <p className="text-lg mb-2">Mã đơn hàng của bạn:</p>
            <p className="text-xl font-bold">{order.orderCode}</p>
          </div>
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold mb-4">Thông tin đơn hàng</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Trạng thái:</span>
                <span className="font-medium">{order.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng tiền:</span>
                <span className="font-medium">{order.total.toLocaleString('vi-VN')} VND</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phương thức thanh toán:</span>
                <span className="font-medium">{order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <HelpPanel isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
} 