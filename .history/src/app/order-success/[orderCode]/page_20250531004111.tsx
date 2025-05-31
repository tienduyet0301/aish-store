"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
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
  promoCode?: {
    code: string;
    type: string;
    value: number;
    maxAmount?: number | null;
  };
  promoAmount?: number;
}

interface ApiResponse {
  ok: boolean;
  order?: Order;
  error?: string;
}

const OrderSuccessPage = () => {
  const params = useParams();
  const orderCode = params?.orderCode;
  const router = useRouter();
  const { data: session } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderCode || typeof orderCode !== 'string') {
        setError('Order code is missing');
        setTimeout(() => {
          router.push('/');
        }, 3000);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Get email from session or localStorage
        const email = session?.user?.email || localStorage.getItem('orderEmail');
        console.log('Retrieved email:', email);

        if (!email) {
          setError('Email not found. Please try placing the order again.');
          setTimeout(() => {
            router.push('/');
          }, 3000);
          return;
        }

        const url = `/api/orders/${orderCode}?email=${encodeURIComponent(email)}`;
        console.log('Fetching order with URL:', url);

        const response = await fetch(url);
        const data: ApiResponse = await response.json();

        console.log('Order fetch response:', data);

        if (response.ok && data.ok && data.order) {
          setOrder(data.order);
          setError(null);
        } else {
          console.error('Failed to fetch order:', data.error);
          setError(data.error || 'Failed to fetch order data');
          setTimeout(() => {
            router.push('/');
          }, 3000);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('An error occurred while fetching your order');
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderCode, router, session]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <p className="text-gray-500">Redirecting to home page...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Order not found</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Format date
  const orderDate = new Date(order.createdAt).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <>
      <div className="min-h-screen w-full flex flex-col md:flex-row" style={{ paddingTop: "48px" }}>
        {/* Order Success Information */}
        <div className="flex-grow p-4 md:p-6" style={{ backgroundColor: "white", color: "#000000" }}>
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

          <div>
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
            <p style={{ marginBottom: "6px", fontSize: "0.8em" }}>Mã đơn hàng: {order.orderCode}</p>
            <p style={{ marginBottom: "6px", fontSize: "0.8em" }}>Ngày đặt: {orderDate}</p>
            <p style={{ marginBottom: "6px", fontSize: "0.8em" }}>Họ tên: {order.fullName}</p>
            <p style={{ marginBottom: "6px", fontSize: "0.8em" }}>Email: {order.email}</p>
            <p style={{ marginBottom: "6px", fontSize: "0.8em" }}>Số điện thoại: {order.phone}</p>
            {order.additionalPhone && (
              <p style={{ marginBottom: "6px", fontSize: "0.8em" }}>Số điện thoại phụ: {order.additionalPhone}</p>
            )}
            <p style={{ marginBottom: "6px", fontSize: "0.8em" }}>
              Địa chỉ: {[order.apartment, order.ward, order.district, order.province].filter(Boolean).join(", ")}
            </p>
            <p style={{ marginBottom: "6px", fontSize: "0.8em" }}>
              Phương thức thanh toán: {
                order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng'
              }
            </p>
            {order.promoCode && (
              <p style={{ marginBottom: "6px", fontSize: "0.8em" }}>
                Mã giảm giá: <b>{order.promoCode.code}</b> (-{order.promoAmount?.toLocaleString('vi-VN')} VND)
              </p>
            )}
            <p style={{
              marginBottom: "6px",
              fontWeight: "600",
              fontSize: "0.8em"
            }}>
              Tổng tiền: {order.total?.toLocaleString('vi-VN')} VND
            </p>

            {/* Conditional message for COD */}
            {order.paymentMethod === 'cod' && (
              <p style={{
                marginTop: "12px",
                fontSize: "0.8em",
                color: "#000000",
                fontStyle: "italic"
              }}>
                Quý khách ghi nhớ mã đơn hàng và nhắn tin cho Facebook hoặc Instagram aish.aish.vn nếu muốn tra cứu mã vận đơn nhé
              </p>
            )}
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
                  Nội dung chuyển khoản: {order.orderCode} {order.phone}
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
            
            <div>
              {order.items.map((item, index) => (
                <div key={index} style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  marginBottom: "8px",
                  padding: "8px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "4px"
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
                  <div style={{ textAlign: "left", flex: 1 }}>
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
        </div>
      </div>

      {/* Buttons Container */}
      <div className="w-full flex flex-col md:flex-row p-4 md:p-6 gap-4" style={{ backgroundColor: "white" }}>
        <button
          onClick={() => router.push('/products')}
          style={{
            flex: 1,
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
        <button
          onClick={() => setIsHelpOpen(true)}
          style={{
            flex: 1,
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

      <HelpPanel isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </>
  );
};

export default dynamic(() => Promise.resolve(OrderSuccessPage), { ssr: false }); 