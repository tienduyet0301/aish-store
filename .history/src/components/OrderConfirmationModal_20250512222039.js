import { useOrders } from '../context/OrderContext';
import { useCart } from '../context/CartContext';
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';

export default function OrderConfirmationModal({ isOpen, onClose, orderDetails }) {
  const { addOrder } = useOrders();
  const { clearCart } = useCart();
  const router = useRouter();

  if (!isOpen || !orderDetails) return null;

  const handleContinueShopping = () => {
    if (orderDetails) {
      const orderWithDate = {
        ...orderDetails,
        orderDate: Date.now(),
        status: 'processing'
      };
      addOrder(orderWithDate);
      clearCart(); // Xóa giỏ hàng sau khi đặt hàng thành công
    }
    onClose();
    // Chuyển hướng đến trang xác nhận đơn hàng thành công
    router.push(`/order-success/${orderDetails.orderCode}`);
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 w-11/12 max-w-md relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-black"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="text-center py-8 px-6">
          <h2 style={{ 
            fontSize: "1.2em", 
            color: "#000000", 
            textTransform: "uppercase", 
            letterSpacing: "0.1em", 
            marginBottom: "20px",
            fontWeight: "bold"
          }}>
            XÁC NHẬN ĐƠN HÀNG
          </h2>

          {/* Thông tin sản phẩm */}
          <div style={{ marginBottom: "20px" }}>
            {orderDetails.items.map((item, index) => (
              <div key={index} style={{ 
                display: "flex", 
                alignItems: "center", 
                marginBottom: "15px",
                padding: "10px",
                backgroundColor: "#f8f8f8",
                borderRadius: "4px"
              }}>
                <img 
                  src={item.image} 
                  alt={item.name} 
                  style={{
                    width: "80px",
                    height: "80px",
                    objectFit: "cover",
                    marginRight: "15px"
                  }}
                />
                <div style={{ textAlign: "left" }}>
                  <p style={{ 
                    fontSize: "0.9em", 
                    fontWeight: "bold",
                    marginBottom: "4px" 
                  }}>{item.name}</p>
                  <p style={{ fontSize: "0.8em" }}>Size: {item.size}</p>
                  <p style={{ fontSize: "0.8em" }}>Số lượng: {item.quantity}</p>
                  <p style={{ 
                    fontSize: "0.8em",
                    fontWeight: "bold"
                  }}>Giá: {item.price.toLocaleString('vi-VN')} VND</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: "0.9em", color: "#000000", marginBottom: "20px" }}>
            <p style={{ marginBottom: "8px" }}>Mã đơn hàng: {orderDetails.orderCode}</p>
            <p style={{ marginBottom: "8px" }}>Họ tên: {orderDetails.fullName}</p>
            <p style={{ marginBottom: "8px" }}>Email: {orderDetails.email}</p>
            <p style={{ marginBottom: "8px" }}>Số điện thoại: {orderDetails.phone}</p>
            {orderDetails.additionalPhone && (
              <p style={{ marginBottom: "8px" }}>Số điện thoại phụ: {orderDetails.additionalPhone}</p>
            )}
            <p style={{ marginBottom: "8px" }}>
              Địa chỉ: {orderDetails.address}, {orderDetails.ward}, {orderDetails.district}, {orderDetails.province}
            </p>
            <p style={{ marginBottom: "8px" }}>Phương thức thanh toán: {
              orderDetails.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng'
            }</p>
            <p style={{ 
              marginBottom: "8px",
              fontSize: "1em",
              fontWeight: "bold"
            }}>Tổng tiền: {orderDetails.total.toLocaleString('vi-VN')} VND</p>
          </div>

          {orderDetails.paymentMethod === 'bank' && (
            <div style={{
              backgroundColor: "#f8f8f8",
              padding: "15px",
              marginBottom: "20px",
              borderRadius: "4px"
            }}>
              <p style={{ fontSize: "0.9em", color: "#000000", fontStyle: "italic" }}>
                Vui lòng chuyển khoản theo thông tin đã cung cấp và gửi biên lai về Facebook hoặc Instagram AISH
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200">
          <button
            onClick={handleContinueShopping}
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "0.7em",
              color: "#ffffff",
              backgroundColor: "#000000",
              border: "none",
              cursor: "pointer",
              textTransform: "uppercase",
              letterSpacing: "0.1em"
            }}
          >
            Xác nhận
          </button>
        </div>
      </motion.div>
    </div>
  );
} 