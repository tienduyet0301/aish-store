"use client";
import { useOrders } from "../../context/OrderContext";
import { useState } from "react";
import Link from "next/link";

export default function MyOrders() {
  const { orders, loading } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [displayCount, setDisplayCount] = useState(3);

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
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <div style={styles.headerContainer}>
          <div style={styles.headerTitle}>
            <h1 style={styles.mainTitle}>MY ORDERS</h1>
            <div style={styles.titleUnderline}></div>
          </div>
          {Array.isArray(orders) && orders.length > 0 && (
            <p style={styles.orderCount}>
              You Have {orders.length} {orders.length === 1 ? 'Order' : 'Orders'} In My Orders.
            </p>
          )}
        </div>

        {!Array.isArray(orders) || orders.length === 0 ? (
          <div style={styles.emptyState}>
            <h2 style={styles.noOrdersTitle}>NO ORDERS</h2>
            <div style={styles.dividerLine}></div>
            <p style={styles.noOrdersText}>You have no orders to view.</p>
            <p style={styles.subText}>
              Once you place an order on aish.com you'll be able to check its status.
            </p>
            <Link href="/products">
              <button style={styles.continueButton}>
                CONTINUE SHOPPING
              </button>
            </Link>
            <div style={styles.contactInfo}>
              <div style={styles.contactItem}>
                <span style={styles.phoneIcon}>☎</span>
                <a href="tel:+61300492212" style={styles.contactLink}>+61 1300492212</a>
              </div>
              <span style={styles.divider}>|</span>
              <div style={styles.contactItem}>
                <span style={styles.emailIcon}>✉</span>
                <a href="mailto:clientservice.au@aish.com" style={styles.contactLink}>
                  clientservice.au@aish.com
                </a>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div style={styles.ordersList}>
              {orders.slice(0, displayCount).map((order, index) => {
                const statusColor = getStatusColor(order.status);
                return (
                  <div key={`${order.orderCode}-${order._id || index}`} style={styles.orderCardWrapper}>
                    <div style={styles.orderCard}>
                      <div style={styles.orderHeader}>
                        <div style={styles.orderInfo}>
                          <h3 style={styles.orderCode}>Đơn hàng: {order.orderCode}</h3>
                          <p style={styles.orderDate}>Ngày đặt: {formatDate(order.createdAt)}</p>
                        </div>
                        <div style={styles.orderStatus}>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: statusColor.bg,
                            color: statusColor.text
                          }}>
                            {getStatusLabel(order.status)}
                          </span>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: order.paymentStatus === "paid" ? "#e6f4ea" : "#fbe9e7",
                            color: order.paymentStatus === "paid" ? "#1e7e34" : "#d32f2f",
                            marginLeft: "10px"
                          }}>
                            {getPaymentStatusLabel(order.paymentStatus)}
                          </span>
                        </div>
                      </div>

                      <div style={styles.orderContent}>
                        <div style={styles.productsSection}>
                          <div style={styles.productsList}>
                            {order.items.map((item, itemIndex) => (
                              <div key={itemIndex} style={styles.productItem}>
                                <img src={item.image} alt={item.name} style={styles.productImage} />
                                <div style={styles.productInfo}>
                                  <p style={styles.productName}>{item.name}</p>
                                  <p style={styles.productDetails}>
                                    Size: {item.size} | Số lượng: {item.quantity}
                                  </p>
                                  <p style={styles.productPrice}>{formatPrice(item.price)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div style={styles.orderDetailsSection}>
                          <div style={styles.orderDetails}>
                            <div style={styles.detailRow}>
                              <span>Tổng tiền:</span>
                              <span style={styles.totalPrice}>{formatPrice(order.total)}</span>
                            </div>
                            <div style={styles.detailRow}>
                              <span>Phương thức thanh toán:</span>
                              <span>{order.paymentMethod === 'cod' ? 'COD' : 'Chuyển khoản'}</span>
                            </div>
                          </div>
                          <div style={styles.shippingAddress}>
                            <h4 style={styles.addressTitle}>Địa chỉ giao hàng:</h4>
                            <p style={styles.address}>
                              {order.fullName}<br />
                              {order.phone}<br />
                              {order.address}, {order.ward},<br />
                              {order.district}, {order.province}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {orders.length > displayCount && (
              <div style={styles.loadMoreContainer}>
                <button 
                  onClick={() => setDisplayCount(prev => prev + 3)}
                  style={styles.loadMoreButton}
                >
                  LOAD MORE
                </button>
              </div>
            )}
            
            <div style={styles.continueShopping}>
              <Link href="/products">
                <button style={styles.continueButton}>
                  CONTINUE SHOPPING
                </button>
              </Link>
            </div>
          </>
        )}
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
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
    textDecoration: 'underline',
    transition: 'background-color 0.3s',
  },
}; 