import { useOrders } from '../context/OrderContext';
import { useCart } from '../context/CartContext';
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function OrderConfirmationModal({ isOpen, onClose, orderDetails }) {
  const { addOrder } = useOrders();
  const { clearCart } = useCart();
  const router = useRouter();

  if (!isOpen || !orderDetails) return null;

  const handleContinueShopping = async () => {
    try {
      if (orderDetails) {
        // Gửi đơn hàng lên server
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderDetails),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Không thể tạo đơn hàng');
        }

        // Thêm đơn hàng vào context và xóa giỏ hàng
        await addOrder(data.order);
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
    <div className="fixed inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 w-11/12 max-w-4xl relative"
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

        <div className="py-8 px-6">
          <h2 style={{ 
            fontSize: "1.2em", 
            color: "#000000", 
            textTransform: "uppercase", 
            letterSpacing: "0.1em", 
            marginBottom: "20px",
            fontWeight: "bold",
            textAlign: "center"
          }}>
            XÁC NHẬN ĐƠN HÀNG
          </h2>

          <div style={{ display: "flex", gap: "30px" }}>
            {/* Left side - Scrollable Product List */}
            <div style={{ flex: "1" }}>
              <div style={{ 
                maxHeight: "500px", 
                overflowY: "auto",
                padding: "15px",
                backgroundColor: "#f8f8f8",
                borderRadius: "4px"
              }}>
                {orderDetails.items.map((item, index) => (
                  <div key={index} style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    marginBottom: "15px",
                    padding: "15px",
                    backgroundColor: "#ffffff",
                    borderRadius: "4px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                  }}>
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                        marginRight: "15px"
                      }}
                    />
                    <div style={{ textAlign: "left", flex: 1 }}>
                      <p style={{ 
                        fontSize: "1em", 
                        fontWeight: "bold",
                        marginBottom: "6px" 
                      }}>{item.name}</p>
                      <p style={{ fontSize: "0.9em", marginBottom: "4px" }}>Size: {item.size}</p>
                      <p style={{ fontSize: "0.9em", marginBottom: "4px" }}>Số lượng: {item.quantity}</p>
                      <p style={{ 
                        fontSize: "0.9em",
                        fontWeight: "bold"
                      }}>Giá: {item.price.toLocaleString('vi-VN')} VND</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Fixed Order Information */}
            <div style={{ flex: "1", padding: "20px", backgroundColor: "#f8f8f8", borderRadius: "4px" }}>
              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ 
                  fontSize: "1.1em", 
                  fontWeight: "bold", 
                  marginBottom: "15px",
                  color: "#000000"
                }}>Thông tin đơn hàng</h3>
                <p style={{ marginBottom: "10px", fontSize: "0.95em" }}>Mã đơn hàng: {orderDetails.orderCode}</p>
                <p style={{ marginBottom: "10px", fontSize: "0.95em" }}>Họ tên: {orderDetails.fullName}</p>
                <p style={{ marginBottom: "10px", fontSize: "0.95em" }}>Email: {orderDetails.email}</p>
                <p style={{ marginBottom: "10px", fontSize: "0.95em" }}>Số điện thoại: {orderDetails.phone}</p>
                {orderDetails.additionalPhone && (
                  <p style={{ marginBottom: "10px", fontSize: "0.95em" }}>Số điện thoại phụ: {orderDetails.additionalPhone}</p>
                )}
                <p style={{ marginBottom: "10px", fontSize: "0.95em" }}>
                  Địa chỉ: {[orderDetails.address, orderDetails.apartment, orderDetails.ward, orderDetails.district, orderDetails.province].filter(Boolean).join(", ")}
                </p>
                <p style={{ marginBottom: "10px", fontSize: "0.95em" }}>Phương thức thanh toán: {
                  orderDetails.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng'
                }</p>
                <p style={{ 
                  marginBottom: "10px",
                  fontSize: "1.1em",
                  fontWeight: "bold",
                  color: "#000000"
                }}>Tổng tiền: {orderDetails.total.toLocaleString('vi-VN')} VND</p>
              </div>

              {orderDetails.paymentMethod === 'bank' && (
                <div style={{
                  backgroundColor: "#ffffff",
                  padding: "15px",
                  marginBottom: "20px",
                  borderRadius: "4px",
                  border: "1px solid #e0e0e0"
                }}>
                  <p style={{ fontSize: "0.9em", color: "#000000", fontStyle: "italic" }}>
                    Vui lòng chuyển khoản theo thông tin đã cung cấp và gửi biên lai về Facebook hoặc Instagram AISH
                  </p>
                </div>
              )}

              <button
                onClick={handleContinueShopping}
                style={{
                  width: "100%",
                  padding: "15px",
                  fontSize: "0.8em",
                  color: "#ffffff",
                  backgroundColor: "#000000",
                  border: "none",
                  cursor: "pointer",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontWeight: "600",
                  transition: "background-color 0.3s ease"
                }}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 