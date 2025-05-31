import React from 'react';

interface OrderItem {
  id: string;
  name: string;
  price: string | number;
  quantity: number;
}

interface OrderDetails {
  orderCode: string;
  fullName: string;
  email: string;
  phone: string;
  additionalPhone: string | null;
  apartment: string | null;
  ward: string;
  district: string;
  province: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: string;
  promoCode: string | null;
  promoAmount: number;
  total: number;
  paymentMethod: string;
  status: string;
  paymentStatus: string;
  shippingStatus: string;
}

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderDetails: OrderDetails | null;
}

const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({ isOpen, onClose, orderDetails }) => {
  if (!isOpen || !orderDetails) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Xác nhận đơn hàng</h2>
        <div className="space-y-2">
          <p><strong>Mã đơn hàng:</strong> {orderDetails.orderCode}</p>
          <p><strong>Họ tên:</strong> {orderDetails.fullName}</p>
          <p><strong>Số điện thoại:</strong> {orderDetails.phone}</p>
          <p><strong>Địa chỉ:</strong> {orderDetails.apartment}, {orderDetails.ward}, {orderDetails.district}, {orderDetails.province}</p>
          <p><strong>Tổng tiền:</strong> AU${orderDetails.total}</p>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationModal; 