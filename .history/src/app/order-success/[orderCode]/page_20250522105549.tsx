"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import HelpPanel from '../../../components/HelpPanel';
import dynamic from 'next/dynamic';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
  color: string;
}

interface Order {
  _id: string;
  orderCode: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
  fullName: string;
  email: string;
  phone: string;
  additionalPhone?: string;
  apartment?: string;
  address: string;
  ward: string;
  district: string;
  province: string;
  paymentMethod: string;
  promoCode?: string;
  promoAmount?: number;
}

const OrderSuccessPage = ({ params }) => {
  const unwrappedParams = use(params);
  const { orderCode } = unwrappedParams;
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders?orderCode=${orderCode}`);
        if (response.ok) {
          const data = await response.json();
          if (data.ok && data.order) {
            setOrder(data.order);
          } else {
            console.error('Failed to fetch order data');
            setTimeout(() => {
              router.push('/');
            }, 3000);
          }
        } else {
          console.error('Failed to fetch order');
          setTimeout(() => {
            router.push('/');
          }, 3000);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    };

    if (orderCode) {
      fetchOrder();
    }
  }, [orderCode, router]);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen w-full flex flex-col md:flex-row" style={{ paddingTop: "48px" }}>
        {/* Order Success Information */}
        <div className="w-full md:w-6/10 bg-white min-h-screen flex flex-col md:border-r border-gray-100">
          <div className="flex-grow p-4 md:p-6">
            <div className="text-center mb-8 md:mb-12" style={{ paddingTop: "8px" }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "#000000",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                margin: "0 auto 12px",
              }}>
                ✓
              </div>
              <h1 style={{ 
                fontSize: "1em", 
                color: "#000000", 
                textTransform: "uppercase", 
                letterSpacing: "0.1em", 
                marginBottom: "16px",
                fontWeight: "600"
              }}>
                Đặt hàng thành công
              </h1>
            </div>

            <div style={{ fontSize: "0.8em", color: "#000000", marginBottom: "16px" }}>
              <h2 style={{ 
                fontSize: "0.8em", 
                color: "#000000", 
                textTransform: "uppercase", 
                letterSpacing: "0.1em", 
                marginBottom: "12px",
                fontWeight: "600"
              }}>
                Thông tin đơn hàng
              </h2>
              <p style={{ marginBottom: "6px" }}>Mã đơn hàng: {order.orderCode}</p>
              <p style={{ marginBottom: "6px" }}>Họ tên: {order.fullName}</p>
              <p style={{ marginBottom: "6px" }}>Email: {order.email}</p>
              <p style={{ marginBottom: "6px" }}>Số điện thoại: {order.phone}</p>
              {order.additionalPhone && (
                <p style={{ marginBottom: "6px" }}>Số điện thoại phụ: {order.additionalPhone}</p>
              )}
              <p style={{ marginBottom: "6px" }}>
                Địa chỉ: {[order.address, order.apartment, order.ward, order.district, order.province].filter(Boolean).join(", ")}
              </p>
              <p style={{ marginBottom: "6px" }}>
                Phương thức thanh toán: {
                  order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng'
                }
              </p>
              {order.promoCode && (
                <p style={{ marginBottom: "6px" }}>
                  Mã giảm giá: <b>{order.promoCode}</b> (-{order.promoAmount?.toLocaleString('vi-VN')} VND)
                </p>
              )}
              <p style={{ 
                marginBottom: "6px",
                fontSize: "0.9em",
                fontWeight: "600"
              }}>
                Tổng tiền: {order.total?.toLocaleString('vi-VN')} VND
              </p>
            </div>

            {order.paymentMethod === 'bank' && (
              <div style={{
                padding: "8px",
                border: "1px solid #e5e7eb",
                marginBottom: "16px",
                borderRadius: "4px"
              }}>
                <h3 style={{
                  fontSize: "0.75em",
                  fontWeight: "bold",
                  marginBottom: "6px",
                  color: "#000000"
                }}>
                  Thông tin chuyển khoản
                </h3>
                <div style={{ fontSize: "0.75em", color: "#000000" }}>
                  <p style={{ marginBottom: "4px" }}>Ngân hàng: MB BANK</p>
                  <p style={{ marginBottom: "4px" }}>Chủ tài khoản: PHAN THUY TRUC DAO</p>
                  <p style={{ marginBottom: "4px" }}>Số tài khoản: 024052306</p>
                  <p style={{ marginBottom: "4px" }}>
                    Nội dung chuyển khoản: MÃ ĐƠN HÀNG + SĐT
                  </p>
                  <p style={{
                    marginTop: "8px",
                    fontStyle: "italic",
                    color: "#666666",
                    fontSize: "0.7em"
                  }}>
                    Quý khách vui lòng chuyển khoản đúng nội dung và chụp màn hình gửi về Facebook hoặc Instagram aish.aish.vn nhaa
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 md:p-4 pb-8 md:pb-12">
            <button
              onClick={() => router.push('/products')}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "0.75em",
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

        {/* Product Information */}
        <div className="w-full md:w-4/10 bg-white min-h-screen flex flex-col">
          <div className="flex-grow p-4 md:p-6">
            <h2 style={{ 
              fontSize: "0.8em", 
              color: "#000000", 
              textTransform: "uppercase", 
              letterSpacing: "0.1em", 
              marginBottom: "16px",
              fontWeight: "600",
              paddingTop: "8px"
            }}>
              Sản phẩm đã đặt
            </h2>
            
            <div className="space-y-3 mb-6">
              {order.items.map((item, index) => (
                <div key={index} style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  marginBottom: "8px",
                  padding: "8px",
                }}>
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "cover",
                      marginRight: "8px"
                    }}
                  />
                  <div style={{ textAlign: "left" }}>
                    <p style={{ 
                      fontSize: "0.8em", 
                      fontWeight: "600",
                      marginBottom: "2px",
                      color: "#000000"
                    }}>{item.name}</p>
                    <p style={{ fontSize: "0.75em", color: "#000000", marginBottom: "2px" }}>Size: {item.size}</p>
                    <p style={{ fontSize: "0.75em", color: "#000000", marginBottom: "2px" }}>Số lượng: {item.quantity}</p>
                    <p style={{ 
                      fontSize: "0.75em", 
                      color: "#000000",
                      fontWeight: "bold" 
                    }}>Giá: {item.price.toLocaleString('vi-VN')} VND</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 md:p-4 pb-8 md:pb-12">
            <button
              onClick={() => setIsHelpOpen(true)}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "0.75em",
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
      </div>

      <HelpPanel isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </>
  );
};

export default dynamic(() => Promise.resolve(OrderSuccessPage), { ssr: false }); 