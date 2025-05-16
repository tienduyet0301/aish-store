import { useOrders } from '../context/OrderContext';
import { useCart } from '../context/CartContext';
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';

export default function OrderConfirmationModal({ isOpen, onClose, orderDetails }) {
  const { addOrder } = useOrders();
  const { clearCart } = useCart();
  const router = useRouter();

  if (!isOpen || !orderDetails) return null;

  const handleContinueShopping = async () => {
    try {
      if (orderDetails) {
        // Chuẩn bị dữ liệu đơn hàng
        const orderData = {
          ...orderDetails,
          items: orderDetails.items.map(item => ({
            name: item.name,
            size: item.size,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          }))
        };

        // Gửi đơn hàng lên server
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Không thể tạo đơn hàng');
        }

        // Thêm đơn hàng vào context và xóa giỏ hàng
        await addOrder(orderData);
        clearCart();
        onClose();
        router.push(`/order-success/${orderDetails.orderCode}`);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
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
        className="bg-white p-8 rounded-lg max-w-md w-full mx-4"
      >
        <h2 className="text-xl font-semibold mb-4">Xác nhận đơn hàng</h2>
        <p className="mb-6">Bạn có chắc chắn muốn đặt hàng với thông tin đã cung cấp?</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            onClick={handleContinueShopping}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Xác nhận
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
} 