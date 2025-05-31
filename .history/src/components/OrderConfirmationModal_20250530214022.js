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

        // Lưu email vào localStorage trước khi gửi đơn hàng
        if (orderDetails.email) {
          console.log('Saving email to localStorage:', orderDetails.email);
          localStorage.setItem('orderEmail', orderDetails.email);
        }

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
        
        onClose();
        
        // Đợi một chút để đảm bảo email đã được lưu
        await new Promise(resolve => setTimeout(resolve, 100));
        
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
    <div className="fixed inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 w-[95vw] max-w-[350px] md:max-w-4xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-black"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="py-3 px-2 md:py-8 md:px-6">
          <h2 style={{ 
            fontSize: "1em", 
            color: "#000000", 
            textTransform: "uppercase", 
            letterSpacing: "0.1em", 
            marginBottom: "12px",
            fontWeight: "bold",
            textAlign: "center"
          }}>
            XÁC NHẬN ĐƠN HÀNG
          </h2>

          <div className="flex flex-col md:flex-row gap-2 md:gap-8">
            {/* Left side - Scrollable Product List */}
            <div className="w-full md:w-1/2">
              <div style={{ 
                maxHeight: "180px", 
                overflowY: "auto",
                padding: "8px",
                backgroundColor: "#f8f8f8",
                borderRadius: "4px"
              }}>
                {orderDetails.items.map((item, index) => (
                  <div key={index} style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    marginBottom: "8px",
                    padding: "8px",
                    backgroundColor: "#ffffff",
                    borderRadius: "4px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.07)"
                  }}>
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                        marginRight: "8px"
                      }}
                    />
                    <div style={{ textAlign: "left", flex: 1 }}>
                      <p style={{ 
                        fontSize: "0.9em", 
                        fontWeight: "bold",
                        marginBottom: "2px" 
                      }}>{item.name}</p>
                      <p style={{ fontSize: "0.8em", marginBottom: "1px" }}>Size: {item.size}</p>
                      <p style={{ fontSize: "0.8em", marginBottom: "1px" }}>Số lượng: {item.quantity}</p>
                      <p style={{ 
                        fontSize: "0.8em",
                        fontWeight: "bold"
                      }}>Giá: {(item.price || 0).toLocaleString('vi-VN')} VND</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Fixed Order Information */}
            <div className="w-full md:w-1/2 mt-2 md:mt-0" style={{ padding: "8px", backgroundColor: "#f8f8f8", borderRadius: "4px" }}>
              <div style={{ marginBottom: "8px" }}>
                <h3 style={{ 
                  fontSize: "0.9em", 
                  fontWeight: "bold", 
                  marginBottom: "8px",
                  color: "#000000"
                }}>Thông tin đơn hàng</h3>
                <p style={{ marginBottom: "4px", fontSize: "0.8em" }}>Mã đơn hàng: {orderDetails.orderCode}</p>
                <p style={{ marginBottom: "4px", fontSize: "0.8em" }}>Họ tên: {orderDetails.fullName}</p>
                <p style={{ marginBottom: "4px", fontSize: "0.8em" }}>Email: {orderDetails.email}</p>
                <p style={{ marginBottom: "4px", fontSize: "0.8em" }}>Số điện thoại: {orderDetails.phone}</p>
                {orderDetails.additionalPhone && (
                  <p style={{ marginBottom: "4px", fontSize: "0.8em" }}>Số điện thoại phụ: {orderDetails.additionalPhone}</p>
                )}
                <p style={{ marginBottom: "4px", fontSize: "0.8em" }}>
                  Địa chỉ: {[orderDetails.apartment, orderDetails.ward, orderDetails.district, orderDetails.province].filter(Boolean).join(", ")}
                </p>
                <p style={{ marginBottom: "6px", fontSize: "0.9em" }}>Phương thức thanh toán: {
                  orderDetails.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng'
                }</p>
                {orderDetails.promoCode && (
                  <p style={{ marginBottom: "6px", fontSize: "0.9em" }}>
                    Mã giảm giá: <b>{orderDetails.promoCode}</b> (-{orderDetails.promoAmount?.toLocaleString('vi-VN')} VND)
                  </p>
                )}
                <p style={{ 
                  marginBottom: "6px",
                  fontSize: "1em",
                  fontWeight: "bold",
                  color: "#000000"
                }}>Tổng tiền: {orderDetails.total.toLocaleString('vi-VN')} VND</p>
              </div>

              {orderDetails.paymentMethod === 'bank' && (
                <div style={{
                  backgroundColor: "#ffffff",
                  padding: "8px",
                  marginBottom: "8px",
                  borderRadius: "4px",
                  border: "1px solid #e0e0e0"
                }}>
                  <p style={{ fontSize: "0.75em", color: "#000000", fontStyle: "italic" }}>
                    Vui lòng chuyển khoản theo thông tin đã cung cấp và gửi biên lai về Facebook hoặc Instagram AISH
                  </p>
                </div>
              )}

              <button
                onClick={handleContinueShopping}
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "0.85em",
                  color: "#ffffff",
                  backgroundColor: isSubmitting ? "#666666" : "#000000",
                  border: "none",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontWeight: "600",
                  borderRadius: "4px",
                  marginTop: "6px"
                }}
              >
                {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 