"use client";
import { useEffect, useState, use } from 'react';
import { useOrders } from '../../../context/OrderContext';
import { useRouter } from 'next/navigation';
import HelpPanel from '../../../components/HelpPanel';
import dynamic from 'next/dynamic';

const OrderSuccessPage = ({ params }) => {
  const unwrappedParams = use(params);
  const { orderCode } = unwrappedParams;
  const { orders } = useOrders();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    if (orders && orderCode) {
      const foundOrder = orders.find(o => o.orderCode === orderCode);
      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    }
  }, [orderCode, orders, router]);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Đơn hàng không tồn tại</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen w-full flex" style={{ paddingTop: "48px" }}>
        {/* Left side - Product Information (4/10) */}
        <div className="w-4/10 bg-white min-h-screen flex flex-col">
          <div className="flex-grow p-6">
            <h2 style={{ 
              fontSize: "0.85em", 
              color: "#000000", 
              textTransform: "uppercase", 
              letterSpacing: "0.1em", 
              marginBottom: "24px",
              fontWeight: "600",
              paddingTop: "12px"
            }}>
              Sản phẩm đã đặt
            </h2>
            
            <div className="space-y-4 mb-8">
              {order.items.map((item, index) => (
                <div key={index} style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  marginBottom: "12px",
                  padding: "10px",
                }}>
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                      marginRight: "12px"
                    }}
                  />
                  <div style={{ textAlign: "left" }}>
                    <p style={{ 
                      fontSize: "0.85em", 
                      fontWeight: "600",
                      marginBottom: "4px",
                      color: "#000000"
                    }}>{item.name}</p>
                    <p style={{ fontSize: "0.8em", color: "#000000", marginBottom: "3px" }}>Size: {item.size}</p>
                    <p style={{ fontSize: "0.8em", color: "#000000", marginBottom: "3px" }}>Số lượng: {item.quantity}</p>
                    <p style={{ 
                      fontSize: "0.8em", 
                      color: "#000000",
                      fontWeight: "bold" 
                    }}>Giá: {item.price.toLocaleString('vi-VN')} VND</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 pb-12">
            <button
              onClick={() => setIsHelpOpen(true)}
              style={{
                width: "100%",
                padding: "14px",
                fontSize: "0.8em",
                color: "#000000",
                backgroundColor: "#ffffff",
                border: "1px solid #000",
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontWeight: "600"
              }}
            >
              MAY WE HELP YOU?
            </button>
          </div>
        </div>

        {/* Right side - Order Success Information (6/10) */}
        <div className="w-6/10 bg-white min-h-screen flex flex-col border-l border-gray-100">
          <div className="flex-grow p-6">
            <div className="text-center mb-12" style={{ paddingTop: "12px" }}>
              <div style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                backgroundColor: "#000000",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                margin: "0 auto 16px",
              }}>
                ✓
              </div>
              <h1 style={{ 
                fontSize: "1.1em", 
                color: "#000000", 
                textTransform: "uppercase", 
                letterSpacing: "0.1em", 
                marginBottom: "24px",
                fontWeight: "600"
              }}>
                Đặt hàng thành công
              </h1>
            </div>

            <div style={{ fontSize: "0.85em", color: "#000000", marginBottom: "20px" }}>
              <h2 style={{ 
                fontSize: "0.85em", 
                color: "#000000", 
                textTransform: "uppercase", 
                letterSpacing: "0.1em", 
                marginBottom: "16px",
                fontWeight: "600"
              }}>
                Thông tin đơn hàng
              </h2>
              <p style={{ marginBottom: "8px" }}>Mã đơn hàng: {order.orderCode}</p>
              <p style={{ marginBottom: "8px" }}>Họ tên: {order.fullName}</p>
              <p style={{ marginBottom: "8px" }}>Email: {order.email}</p>
              <p style={{ marginBottom: "8px" }}>Số điện thoại: {order.phone}</p>
              {order.additionalPhone && (
                <p style={{ marginBottom: "8px" }}>Số điện thoại phụ: {order.additionalPhone}</p>
              )}
              <p style={{ marginBottom: "8px" }}>
                Địa chỉ: {order.address}, {order.ward}, {order.district}, {order.province}
              </p>
              <p style={{ marginBottom: "8px" }}>
                Phương thức thanh toán: {
                  order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng'
                }
              </p>
              <p style={{ 
                marginBottom: "8px",
                fontSize: "0.95em",
                fontWeight: "600"
              }}>
                Tổng tiền: {order.total.toLocaleString('vi-VN')} VND
              </p>
            </div>

            {order.paymentMethod === 'bank' && (
              <div style={{
                padding: "12px",
                border: "1px solid #e5e7eb",
                marginBottom: "20px",
                borderRadius: "6px"
              }}>
                <p style={{ fontSize: "0.85em", color: "#000000", fontStyle: "italic" }}>
                  Vui lòng chuyển khoản theo thông tin đã cung cấp và gửi biên lai về Facebook hoặc Instagram AISH
                </p>
              </div>
            )}
          </div>

          <div className="p-4 pb-12">
            <button
              onClick={() => router.push('/products')}
              style={{
                width: "100%",
                padding: "14px",
                fontSize: "0.8em",
                color: "#ffffff",
                backgroundColor: "#000000",
                border: "none",
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontWeight: "600"
              }}
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>

      <HelpPanel isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </>
  );
};

export default dynamic(() => Promise.resolve(OrderSuccessPage), { ssr: false }); 