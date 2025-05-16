"use client";
import { useOrders } from "../../context/OrderContext";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MyOrders() {
  const { orders, loading } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [displayCount, setDisplayCount] = useState(3);
  const router = useRouter();

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return price.toLocaleString('vi-VN') + ' VND';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return { bg: "#e6f4ea", text: "#1e7e34" };
      case "shipping":
        return { bg: "#e3f2fd", text: "#1976d2" };
      case "packed":
        return { bg: "#f3e5f5", text: "#7b1fa2" };
      case "confirmed":
        return { bg: "#fff3e0", text: "#f57c00" };
      case "failed":
      case "customer_cancelled":
      case "hvc_cancelled":
        return { bg: "#fbe9e7", text: "#d32f2f" };
      case "refunding":
        return { bg: "#fff3e0", text: "#f57c00" };
      case "refunded":
        return { bg: "#f5f5f5", text: "#616161" };
      default:
        return { bg: "#f5f5f5", text: "#616161" };
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "confirmed":
        return "Đã xác nhận";
      case "packed":
        return "Đã đóng gói";
      case "shipping":
        return "Đang vận chuyển";
      case "success":
        return "Thành công";
      case "failed":
        return "Thất bại";
      case "customer_cancelled":
        return "Khách hủy";
      case "hvc_cancelled":
        return "HVC hủy";
      case "refunding":
        return "Đang hoàn";
      case "refunded":
        return "Đã hoàn";
      default:
        return status;
    }
  };

  const getPaymentStatusLabel = (status) => {
    switch (status) {
      case "paid":
        return "Đã thanh toán";
      case "pending":
        return "Chưa thanh toán";
      case "failed":
        return "Thanh toán thất bại";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div style={styles.pageWrapper}>
        <div style={styles.container}>
          <div style={styles.headerContainer}>
            <div style={styles.headerTitle}>
              <h1 style={styles.mainTitle}>MY ORDERS</h1>
              <div style={styles.titleUnderline}></div>
            </div>
          </div>
          <div style={styles.loadingContainer}>
            <p>Đang tải đơn hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row" style={{ paddingTop: "48px" }}>
      {/* Order Information */}
      <div className="w-full md:w-6/10 bg-white min-h-screen flex flex-col md:border-r border-gray-100">
        <div className="flex-grow p-4 md:p-6">
          <div className="text-center mb-6 md:mb-8" style={{ paddingTop: "8px" }}>
            <h1 style={{ 
              fontSize: "1em", 
              color: "#000000", 
              textTransform: "uppercase", 
              letterSpacing: "0.1em", 
              marginBottom: "12px",
              fontWeight: "600"
            }}>
              Đơn hàng của bạn
            </h1>
          </div>

          <div style={{ fontSize: "0.8em", color: "#000000", marginBottom: "12px" }}>
            <h2 style={{ 
              fontSize: "0.8em", 
              color: "#000000", 
              textTransform: "uppercase", 
              letterSpacing: "0.1em", 
              marginBottom: "8px",
              fontWeight: "600"
            }}>
              Thông tin đơn hàng
            </h2>
            <p style={{ marginBottom: "4px" }}>Mã đơn hàng: {selectedOrder?.orderCode}</p>
            <p style={{ marginBottom: "4px" }}>Họ tên: {selectedOrder?.fullName}</p>
            <p style={{ marginBottom: "4px" }}>Email: {selectedOrder?.email}</p>
            <p style={{ marginBottom: "4px" }}>Số điện thoại: {selectedOrder?.phone}</p>
            {selectedOrder?.additionalPhone && (
              <p style={{ marginBottom: "4px" }}>Số điện thoại phụ: {selectedOrder?.additionalPhone}</p>
            )}
            <p style={{ marginBottom: "4px" }}>
              Địa chỉ: {[selectedOrder?.address, selectedOrder?.apartment, selectedOrder?.ward, selectedOrder?.district, selectedOrder?.province].filter(Boolean).join(", ")}
            </p>
            <p style={{ marginBottom: "4px" }}>
              Phương thức thanh toán: {
                selectedOrder?.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng'
              }
            </p>
            {selectedOrder?.promoCode && (
              <p style={{ marginBottom: "4px" }}>
                Mã giảm giá: <b>{selectedOrder?.promoCode}</b> (-{selectedOrder?.promoAmount?.toLocaleString('vi-VN')} VND)
              </p>
            )}
            <p style={{ 
              marginBottom: "4px",
              fontSize: "0.9em",
              fontWeight: "600"
            }}>
              Tổng tiền: {selectedOrder?.total?.toLocaleString('vi-VN')} VND
            </p>
          </div>

          {selectedOrder?.paymentMethod === 'bank' && (
            <div style={{
              padding: "8px",
              border: "1px solid #e5e7eb",
              marginBottom: "12px",
              borderRadius: "4px"
            }}>
              <h3 style={{
                fontSize: "0.75em",
                fontWeight: "bold",
                marginBottom: "4px",
                color: "#000000"
              }}>
                Thông tin chuyển khoản
              </h3>
              <div style={{ fontSize: "0.75em", color: "#000000" }}>
                <p style={{ marginBottom: "2px" }}>Ngân hàng: MB BANK</p>
                <p style={{ marginBottom: "2px" }}>Chủ tài khoản: PHAN THUY TRUC DAO</p>
                <p style={{ marginBottom: "2px" }}>Số tài khoản: 024052306</p>
                <p style={{ marginBottom: "2px" }}>
                  Nội dung chuyển khoản: MÃ ĐƠN HÀNG + SĐT
                </p>
                <p style={{
                  marginTop: "6px",
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

        <div className="p-3 md:p-4 pb-6 md:pb-8">
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
            marginBottom: "12px",
            fontWeight: "600",
            paddingTop: "8px"
          }}>
            Sản phẩm đã đặt
          </h2>
          
          <div className="space-y-2 mb-4">
            {selectedOrder?.items.map((item, index) => (
              <div key={index} style={{ 
                display: "flex", 
                alignItems: "center", 
                marginBottom: "6px",
                padding: "6px",
              }}>
                <img 
                  src={item.image} 
                  alt={item.name} 
                  style={{
                    width: "50px",
                    height: "50px",
                    objectFit: "cover",
                    marginRight: "6px"
                  }}
                />
                <div style={{ textAlign: "left" }}>
                  <p style={{ 
                    fontSize: "0.75em", 
                    fontWeight: "600",
                    marginBottom: "2px",
                    color: "#000000"
                  }}>{item.name}</p>
                  <p style={{ fontSize: "0.7em", color: "#000000", marginBottom: "2px" }}>Size: {item.size}</p>
                  <p style={{ fontSize: "0.7em", color: "#000000", marginBottom: "2px" }}>Số lượng: {item.quantity}</p>
                  <p style={{ 
                    fontSize: "0.7em", 
                    color: "#000000",
                    fontWeight: "bold" 
                  }}>Giá: {item.price.toLocaleString('vi-VN')} VND</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 md:p-4 pb-6 md:pb-8">
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
  );
}

const styles = {
  pageWrapper: {
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
    width: '100%',
    margin: 0,
    padding: '20px 0',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
  },
  headerContainer: {
    textAlign: 'center',
    marginTop: '100px',
    marginBottom: '40px',
  },
  headerTitle: {
    display: 'inline-block',
  },
  mainTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#000000',
    letterSpacing: '0.2em',
    marginBottom: '0px',
    paddingTop: '16px',
    paddingBottom: '0px',
    lineHeight: '1',
  },
  titleUnderline: {
    height: '1px',
    backgroundColor: '#000000',
    width: '100%',
    marginTop: '2px',
  },
  orderCount: {
    fontSize: '16px',
    color: '#000000',
    marginTop: '12px',
    paddingBottom: '16px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  noOrdersTitle: {
    fontSize: '24px',
    fontWeight: '500',
    color: '#000000',
    marginBottom: '8px',
    letterSpacing: '2px',
  },
  dividerLine: {
    width: '80px',
    height: '1px',
    backgroundColor: '#000000',
    margin: '0 auto 30px',
  },
  noOrdersText: {
    fontSize: '16px',
    color: '#000000',
    marginBottom: '10px',
    fontWeight: '400',
  },
  subText: {
    fontSize: '14px',
    color: '#666666',
    marginBottom: '30px',
    maxWidth: '400px',
    lineHeight: '1.5',
  },
  continueButton: {
    backgroundColor: '#000000',
    color: '#ffffff',
    border: 'none',
    padding: '15px 30px',
    fontSize: '14px',
    cursor: 'pointer',
    letterSpacing: '1px',
    marginBottom: '40px',
    transition: 'background-color 0.3s',
    borderRadius: '4px',
  },
  contactInfo: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    marginTop: '30px',
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  contactLink: {
    color: '#000000',
    textDecoration: 'none',
    fontSize: '14px',
  },
  phoneIcon: {
    fontSize: '16px',
    color: '#000000',
  },
  emailIcon: {
    fontSize: '16px',
    color: '#000000',
  },
  divider: {
    color: '#000000',
    fontSize: '16px',
    fontWeight: '300',
    margin: '0 5px',
  },
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  orderCardWrapper: {
    backgroundColor: '#ffffff',
    border: '1px solid #e0e0e0',
    overflow: 'hidden',
  },
  orderCard: {
    padding: '20px',
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '1px solid #e0e0e0',
  },
  orderInfo: {
    flex: 1,
  },
  orderCode: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: '4px',
  },
  orderDate: {
    fontSize: '14px',
    color: '#666',
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '15px',
    fontSize: '12px',
    fontWeight: '500',
  },
  orderContent: {
    display: 'flex',
    backgroundColor: '#ffffff',
    marginTop: '20px',
  },
  productsSection: {
    flex: '1',
    width: '50%',
    paddingRight: '20px',
  },
  orderDetailsSection: {
    flex: '1',
    width: '50%',
    borderLeft: '1px solid #e0e0e0',
    paddingLeft: '20px',
  },
  productsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  productItem: {
    display: 'flex',
    gap: '15px',
    padding: '10px 0',
  },
  productImage: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '4px',
  },
  productInfo: {
    flex: 1,
    fontSize: '14px',
  },
  productName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#000000',
    marginBottom: '4px',
  },
  productDetails: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '4px',
  },
  productPrice: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#000000',
  },
  orderDetails: {
    marginBottom: '20px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '14px',
    color: '#666',
  },
  totalPrice: {
    fontWeight: '600',
    color: '#2C3E50',
  },
  shippingAddress: {
    paddingTop: '20px',
    borderTop: '1px solid #e0e0e0',
  },
  addressTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: '8px',
  },
  address: {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.5',
  },
  continueShopping: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '40px',
    marginBottom: '40px',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px',
    fontSize: '16px',
    color: '#666',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  loadMoreContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '30px',
    marginBottom: '20px',
  },
  loadMoreButton: {
    backgroundColor: 'transparent',
    color: '#000000',
    border: 'none',
    padding: '12px 30px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
};
