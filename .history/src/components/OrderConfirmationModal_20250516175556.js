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
        className="bg-white/80 w-[95vw] max-w-[400px] md:max-w-4xl relative"
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

        <div className="py-4 px-2 md:py-8 md:px-6">
          <h2 style={{ 
            fontSize: "1.1em", 
            color: "#000000", 
            textTransform: "uppercase", 
            letterSpacing: "0.1em", 
            marginBottom: "16px",
            fontWeight: "bold",
            textAlign: "center"
          }}>
            XÁC NHẬN ĐƠN HÀNG
          </h2>

          <div className="flex flex-col md:flex-row gap-3 md:gap-8">
            {/* Left side - Scrollable Product List */}
            <div className="w-full md:w-1/2">
              <div style={{ 
                maxHeight: "220px", 
                overflowY: "auto",
                padding: "10px",
                backgroundColor: "#f8f8f8",
                borderRadius: "4px"
              }}>
                {orderDetails.items.map((item, index) => (
                  <div key={index} style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    marginBottom: "10px",
                    padding: "10px",
                    backgroundColor: "#ffffff",
                    borderRadius: "4px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.07)"
                  }}>
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "cover",
                        marginRight: "10px"
                      }}
                    />
                    <div style={{ textAlign: "left", flex: 1 }}>
                      <p style={{ 
                        fontSize: "0.95em", 
                        fontWeight: "bold",
                        marginBottom: "4px" 
                      }}>{item.name}</p>
                      <p style={{ fontSize: "0.85em", marginBottom: "2px" }}>Size: {item.size}</p>
                      <p style={{ fontSize: "0.85em", marginBottom: "2px" }}>Số lượng: {item.quantity}</p>
                      <p style={{ 
                        fontSize: "0.85em",
                        fontWeight: "bold"
                      }}>Giá: {item.price.toLocaleString('vi-VN')} VND</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Fixed Order Information */}
            <div className="w-full md:w-1/2 mt-3 md:mt-0" style={{ padding: "10px", backgroundColor: "#f8f8f8", borderRadius: "4px" }}>
              <div style={{ marginBottom: "12px" }}>
                <h3 style={{ 
                  fontSize: "1em", 
                  fontWeight: "bold", 
                  marginBottom: "10px",
                  color: "#000000"
                }}>Thông tin đơn hàng</h3>
                <p style={{ marginBottom: "6px", fontSize: "0.9em" }}>Mã đơn hàng: {orderDetails.orderCode}</p>
                <p style={{ marginBottom: "6px", fontSize: "0.9em" }}>Họ tên: {orderDetails.fullName}</p>
                <p style={{ marginBottom: "6px", fontSize: "0.9em" }}>Email: {orderDetails.email}</p>
                <p style={{ marginBottom: "6px", fontSize: "0.9em" }}>Số điện thoại: {orderDetails.phone}</p>
                {orderDetails.additionalPhone && (
                  <p style={{ marginBottom: "6px", fontSize: "0.9em" }}>Số điện thoại phụ: {orderDetails.additionalPhone}</p>
                )}
                <p style={{ marginBottom: "6px", fontSize: "0.9em" }}>
                  Địa chỉ: {[orderDetails.address, orderDetails.apartment, orderDetails.ward, orderDetails.district, orderDetails.province].filter(Boolean).join(", ")}
                </p>
                <p style={{ marginBottom: "6px", fontSize: "0.9em" }}>Phương thức thanh toán: {
                  orderDetails.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng'
                }</p>
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
                  padding: "10px",
                  marginBottom: "12px",
                  borderRadius: "4px",
                  border: "1px solid #e0e0e0"
                }}>
                  <p style={{ fontSize: "0.85em", color: "#000000", fontStyle: "italic" }}>
                    Vui lòng chuyển khoản theo thông tin đã cung cấp và gửi biên lai về Facebook hoặc Instagram AISH
                  </p>
                </div>
              )}

              <button
                onClick={handleContinueShopping}
                style={{
                  width: "100%",
                  padding: "14px",
                  fontSize: "0.9em",
                  color: "#ffffff",
                  backgroundColor: "#000000",
                  border: "none",
                  cursor: "pointer",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontWeight: "600",
                  borderRadius: "4px",
                  marginTop: "8px"
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