import { useOrders } from '../context/OrderContext';
import { useCart } from '../context/CartContext';
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function OrderConfirmationModal({ isOpen, onClose, orderDetails }) {
  const { addOrder } = useOrders();
  const { clearCart } = useCart();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !orderDetails) return null;

  const handleContinueShopping = async () => {
    try {
      setIsSubmitting(true);
      if (orderDetails) {
        console.log('Original order details:', orderDetails);

        // Chuẩn bị dữ liệu đơn hàng
        const orderData = {
          items: orderDetails.items.map(item => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            size: item.size,
            quantity: item.quantity,
            color: item.color
          })),
          total: orderDetails.total || orderDetails.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
          email: orderDetails.email,
          fullName: orderDetails.fullName,
          phone: orderDetails.phone,
          address: orderDetails.address,
          ward: orderDetails.ward,
          district: orderDetails.district,
          province: orderDetails.province,
          paymentMethod: orderDetails.paymentMethod
        };

        console.log('Sending order data:', JSON.stringify(orderData, null, 2));

        // Gửi đơn hàng lên server
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        });

        const data = await response.json();
        console.log('Server response:', data);

        if (!data.ok) {
          throw new Error(data.message || 'Failed to create order');
        }

        // Thêm đơn hàng vào context và xóa giỏ hàng
        await addOrder(data.order);
        clearCart();
        
        // Lưu email vào localStorage trước khi chuyển hướng
        if (orderDetails.email) {
          console.log('Saving email to localStorage:', orderDetails.email);
          localStorage.setItem('orderEmail', orderDetails.email);
          
          // Đợi một chút để đảm bảo email đã được lưu
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        onClose();
        
        // Chuyển hướng đến trang order success
        console.log('Redirecting to order success page:', data.order.orderCode);
        router.push(`/order-success/${data.order.orderCode}`);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert(error.message || 'Failed to create order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4"
      >
        <h2 className="text-xl font-semibold mb-4">Xác nhận đơn hàng</h2>
        <p className="mb-4">Bạn có chắc chắn muốn đặt đơn hàng này?</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={isSubmitting}
          >
            Hủy
          </button>
          <button
            onClick={handleContinueShopping}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
} 