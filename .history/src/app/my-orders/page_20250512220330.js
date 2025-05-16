"use client";
import { useOrders } from "../../context/OrderContext";
import { useState } from "react";
import Link from "next/link";

export default function MyOrders() {
  const { orders } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState(null);

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <div style={styles.headerContainer}>
          <div style={styles.headerTitle}>
            <h1 style={styles.mainTitle}>MY ORDERS</h1>
            <div style={styles.titleUnderline}></div>
          </div>
          {orders.length > 0 && (
            <p style={styles.orderCount}>
              You Have {orders.length} {orders.length === 1 ? 'Order' : 'Orders'} In My Orders.
            </p>
          )}
        </div>

        {orders.length === 0 ? (
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
              {orders.map((order, index) => (
                <div key={order.orderCode}>
                  <div style={styles.orderCard}>
                    <div style={styles.orderHeader}>
                      <div style={styles.orderInfo}>
                        <h3 style={styles.orderCode}>Đơn hàng: {order.orderCode}</h3>
                        <p style={styles.orderDate}>Ngày đặt: {formatDate(order.orderDate)}</p>
                      </div>
                      <div style={styles.orderStatus}>
                        <span style={styles.statusBadge}>Đang xử lý</span>
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
                                <p style={styles.productPrice}>{item.price}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={styles.orderDetailsSection}>
                        <div style={styles.orderDetails}>
                          <div style={styles.detailRow}>
                            <span>Tổng tiền:</span>
                            <span style={styles.totalPrice}>{order.total}</span>
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
                  {index < orders.length - 1 && <div style={styles.orderDivider} />}
                </div>
              ))}
            </div>
            
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
    backgroundColor: '#ffffff',
    minHeight: '100vh',
    width: '100%',
    margin: 0,
    padding: 0,
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#ffffff',
  },
  headerContainer: {
    textAlign: 'center',
    marginTop: '80px',
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
  title: {
    display: 'none',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center',
    backgroundColor: '#ffffff',
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
    ':hover': {
      backgroundColor: '#333333',
    },
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
    ':hover': {
      textDecoration: 'underline',
    },
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
  },
  orderCard: {
    padding: '20px 0',
    marginBottom: '30px',
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
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
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
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
  },
  productInfo: {
    flex: 1,
    fontSize: '14px',
  },
  productName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#2C3E50',
    marginBottom: '4px',
  },
  productDetails: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '4px',
  },
  productPrice: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#2C3E50',
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

  '@media (max-width: 768px)': {
    orderContent: {
      flexDirection: 'column',
    },
    productsSection: {
      width: '100%',
      paddingRight: 0,
      marginBottom: '20px',
    },
    orderDetailsSection: {
      width: '100%',
      borderLeft: 'none',
      paddingLeft: 0,
      borderTop: '1px solid #e0e0e0',
      paddingTop: '20px',
    },
  },

  continueShopping: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '100px',
    marginBottom: '100px',
  },

  orderDivider: {
    height: '1px',
    backgroundColor: '#e5e5e5',
    width: '100%',
    margin: '30px 0',
  },
}; 