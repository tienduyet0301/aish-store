"use client";
import { useState, useEffect } from "react";
import { useCart } from "../../../context/CartContext";

export default function OrderSummary({ order }) {
    const { cartItems, promoAmount, appliedPromoCode } = useCart();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      setIsMounted(true);
    }, []);

    const calculateTotal = () => {
      const subtotal = order.items.reduce((total, item) => {
        const priceStr = typeof item.price === 'string' ? item.price.replace('AU$', '').trim() : item.price;
        const price = parseFloat(priceStr) || 0;
        return total + (price * item.quantity);
      }, 0);
      return subtotal - (promoAmount || 0);
    };

    if (!isMounted) return null;

    return (
      <div style={styles.rightSection}>
        <div style={styles.orderSummary}>
          <h2 style={{ ...styles.sectionTitle, textAlign: "center", borderBottom: "1px solid #000000", paddingBottom: "10px" }}>
            ORDER SUMMARY
          </h2>
          {order.items.map((item, index) => {
            const priceStr = typeof item.price === 'string' ? item.price.replace('AU$', '').trim() : item.price;
            const price = parseFloat(priceStr) || 0;
            return (
              <div key={index} style={styles.orderItem}>
                <img src={item.image} alt={item.name} style={styles.orderImage} />
                <div style={styles.orderItemDetails}>
                  <p style={{ fontWeight: "bold", marginBottom: "8px", fontSize: "0.95em" }}>{item.name}</p>
                  <div style={styles.orderDetailRow}>
                    <span>Số lượng:</span>
                    <span>{item.quantity}</span>
                  </div>
                  <div style={styles.orderDetailRow}>
                    <span>Màu:</span>
                    <span>{item.color}</span>
                  </div>
                  <div style={styles.orderDetailRow}>
                    <span>Size:</span>
                    <span>{item.size}</span>
                  </div>
                  <div style={styles.orderDetailRow}>
                    <span>Thời gian:</span>
                    <span>Dự kiến 5 ngày</span>
                  </div>
                  <div style={styles.orderDetailRow}>
                    <span>Giá:</span>
                    <span>{(price * item.quantity).toLocaleString('vi-VN')} VND</span>
                  </div>
                </div>
              </div>
            );
          })}
          <div style={styles.orderTotals}>
            {promoAmount > 0 && (
              <>
                <div style={styles.orderTotalRow}>
                  <span>Mã giảm giá ({appliedPromoCode})</span>
                  <span>- {promoAmount.toLocaleString('vi-VN')} VND</span>
                </div>
                <div style={{ 
                  fontSize: "0.7em", 
                  color: "#059669",
                  marginBottom: "10px",
                  textAlign: "right"
                }}>
                  Mã giảm giá đã được áp dụng
                </div>
              </>
            )}
            <div style={styles.orderTotalRow}>
              <span>Vận chuyển</span>
              <span>Miễn phí (Express)</span>
            </div>
            <div style={styles.orderTotalRow}>
              <span style={{ fontWeight: "bold" }}>Tổng cộng</span>
              <span style={{ fontWeight: "bold" }}>{calculateTotal().toLocaleString('vi-VN')} VND</span>
            </div>
          </div>
        </div>
        <div style={{ ...styles.viewDetailsSection, borderTop: "1px solid #000000", paddingTop: "10px" }}>
          <div style={styles.viewDetails}>VIEW DETAILS</div>
          <div style={styles.billingNote}>
            Please note that your billing details will be verified and your credit card will be charged at the time of
            shipment. For Made to Order, DIY, personalised and selected Décor items, payment will be taken at the time the
            order is placed.
          </div>
        </div>
        <div style={{ ...styles.helpSection, borderTop: "1px solid #000000", borderBottom: "1px solid #000000", paddingTop: "10px", paddingBottom: "10px" }}>
          <p style={{ marginBottom: "10px", fontWeight: "bold" }}>MAY WE HELP?</p>
          <p style={{ marginBottom: "10px" }}>+61 1300492212</p>
          <p style={{ marginBottom: "10px" }}>clientservice.au@gucci.com</p>
        </div>
      </div>
    );
  }
  
  const styles = {
    rightSection: {
      flex: 1,
      backgroundColor: "#ffffff",
      padding: "15px",
      border: "1px solid #e0e0e0",
      color: "#000000",
      display: "flex",
      flexDirection: "column",
      gap: "20px",
    },
    orderSummary: {
      color: "#000000",
    },
    sectionTitle: {
      fontSize: "1.1em",
      fontWeight: "bold",
      marginBottom: "15px",
      color: "#000000",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    orderItem: {
      display: "flex",
      gap: "15px",
      marginBottom: "25px",
      color: "#000000",
    },
    orderImage: {
      width: "80px",
      height: "80px",
      objectFit: "cover",
    },
    orderItemDetails: {
      color: "#000000",
      flex: 1,
    },
    orderDetailRow: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "8px",
      fontSize: "0.75em",
    },
    orderTotals: {
      color: "#000000",
    },
    orderTotalRow: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "12px",
    },
    viewDetailsSection: {
      color: "#000000",
    },
    viewDetails: {
      fontSize: "0.8em",
      marginTop: "15px",
      marginBottom: "15px",
      cursor: "pointer",
      textDecoration: "underline",
      color: "#000000",
    },
    billingNote: {
      fontSize: "0.75em",
      color: "#000000",
      marginTop: "15px",
      marginBottom: "15px",
    },
    helpSection: {
      fontSize: "0.8em",
      color: "#000000",
    },
    "@media (maxWidth: 768px)": {
      rightSection: {
        order: -1,
      },
    },
  };