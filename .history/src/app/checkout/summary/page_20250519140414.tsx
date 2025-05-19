"use client";
import { useState, useEffect } from "react";
import { useCart } from "../../../context/CartContext";

interface OrderItem {
  name: string;
  price: string | number;
  quantity: number;
  image: string;
  color?: string;
  size?: string;
}

interface Order {
  items: OrderItem[];
  promoCode?: string;
  promoAmount?: number;
}

export default function OrderSummary() {
  const { cartItems } = useCart();
  const [isMounted, setIsMounted] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoMessage, setPromoMessage] = useState("");
  const [promoAmount, setPromoAmount] = useState(0);
  const [appliedPromoCode, setAppliedPromoCode] = useState("");
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    setIsMounted(true);
    // Lấy order từ localStorage nếu có
    const orderData = localStorage.getItem("order");
    if (orderData) {
      setOrder(JSON.parse(orderData));
    } else {
      // Nếu không có order, tạo order từ cartItems
      setOrder({ items: cartItems });
    }
  }, [cartItems]);

  const handleApplyPromoCode = async () => {
    setPromoMessage("");
    if (!promoCode.trim()) {
      setPromoMessage("Please enter a promo code");
      return;
    }

    try {
      const response = await fetch("/api/admin/notifications");
      const data = await response.json();
      
      if (data.ok && data.promoCodes) {
        const foundPromo = data.promoCodes.find(
          (promo: any) => promo.code.toLowerCase() === promoCode.toLowerCase() && promo.isActive
        );
        
        if (foundPromo) {
          setPromoAmount(foundPromo.amount);
          setAppliedPromoCode(foundPromo.code);
          setPromoMessage(`Promo code ${foundPromo.amount.toLocaleString('vi-VN')} VND has been applied!`);
          setPromoCode("");
          if (order) {
            setOrder({ ...order, promoCode: foundPromo.code, promoAmount: foundPromo.amount });
          }
        } else {
          setPromoMessage("Invalid or expired promo code");
        }
      } else {
        setPromoMessage("Unable to check promo code");
      }
    } catch (error) {
      console.error("Error applying promo code:", error);
      setPromoMessage("An error occurred while applying the promo code");
    }
  };

  const calculateTotal = () => {
    if (!order) return 0;
    const subtotal = order.items.reduce((total, item) => {
      const priceStr = typeof item.price === 'string' ? item.price.replace('AU$', '').trim() : item.price;
      const price = parseFloat(priceStr as string) || 0;
      return total + (price * item.quantity);
    }, 0);
    return subtotal - (order.promoAmount || promoAmount);
  };

  if (!isMounted || !order) return null;

  return (
    <div style={styles.rightSection}>
      <div style={styles.orderSummary}>
        <h2 style={{ ...styles.sectionTitle, textAlign: "center", borderBottom: "1px solid #000000", paddingBottom: "10px" }}>
          ORDER SUMMARY
        </h2>
        {order.items.map((item, index) => {
          const priceStr = typeof item.price === 'string' ? item.price.replace('AU$', '').trim() : item.price;
          const price = parseFloat(priceStr as string) || 0;
          const color = item.color || (cartItems && cartItems[index] && cartItems[index].color) || "Không xác định";
          return (
            <div key={index} style={styles.orderItem}>
              <img src={item.image} alt={item.name} style={styles.orderImage} />
              <div style={styles.orderItemDetails}>
                <p style={{ fontWeight: "bold", marginBottom: "8px", fontSize: "0.95em" }}>{item.name}</p>
                <div style={styles.orderDetailRow}>
                  <span>Quantity:</span>
                  <span>{item.quantity}</span>
                </div>
                <div style={styles.orderDetailRow}>
                  <span>Color:</span>
                  <span>{color}</span>
                </div>
                <div style={styles.orderDetailRow}>
                  <span>Size:</span>
                  <span>{item.size}</span>
                </div>
                <div style={styles.orderDetailRow}>
                  <span>Time:</span>
                  <span>Expected 2-3 days</span>
                </div>
                <div style={styles.orderDetailRow}>
                  <span>Price:</span>
                  <span>{(price * item.quantity).toLocaleString('vi-VN')} VND</span>
                </div>
              </div>
            </div>
          );
        })}
        <div style={styles.orderTotals}>
          {(order.promoAmount || promoAmount) > 0 ? (
            <>
              <div style={styles.orderTotalRow}>
                <span>Promo Code</span>
                <span>- {(order.promoAmount || promoAmount).toLocaleString('vi-VN')} VND</span>
              </div>
              <div style={{ 
                fontSize: "0.7em", 
                color: "#059669",
                marginBottom: "10px",
                textAlign: "right"
              }}>
                Promo code has been applied
              </div>
            </>
          ) : (
            <div style={{ marginBottom: "15px" }}>
              <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value);
                    if (promoMessage) setPromoMessage("");
                  }}
                  placeholder="Enter promo code"
                  style={{
                    flex: 1,
                    padding: "8px",
                    fontSize: "0.7em",
                    border: "1px solid #000000",
                  }}
                />
                <button
                  onClick={handleApplyPromoCode}
                  style={{
                    padding: "8px 15px",
                    fontSize: "0.7em",
                    backgroundColor: "#000000",
                    color: "#ffffff",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Apply
                </button>
              </div>
              {promoMessage && (
                <p style={{
                  fontSize: "0.7em",
                  color: promoMessage.includes("đã được áp dụng") ? "#059669" : "#dc2626",
                }}>
                  {promoMessage}
                </p>
              )}
            </div>
          )}
          <div style={styles.orderTotalRow}>
            <span>Shipping</span>
            <span>Free (Express)</span>
          </div>
          <div style={styles.orderTotalRow}>
            <span style={{ fontWeight: "bold" }}>Total</span>
            <span style={{ fontWeight: "bold" }}>{calculateTotal().toLocaleString('vi-VN')} VND</span>
          </div>
        </div>
      </div>
      <div style={{ ...styles.viewDetailsSection, borderTop: "1px solid #000000", paddingTop: "10px" }}>
        <div style={styles.viewDetails}>VIEW DETAILS</div>
        <div style={styles.billingNote}>
          Please note that you can choose between two payment methods: Bank Transfer or Cash on Delivery (COD). For Bank Transfer, please complete the payment after placing your order to proceed with processing. For COD, you will pay in cash when the product is delivered to your address.
        </div>
      </div>
      <div style={{ ...styles.helpSection, borderTop: "1px solid #000000", borderBottom: "1px solid #000000", paddingTop: "10px", paddingBottom: "10px" }}>
        <p style={{ marginBottom: "10px", fontWeight: "bold" }}>MAY WE HELP?</p>
        <p style={{ marginBottom: "10px" }}>0347272386</p>
        <p style={{ marginBottom: "10px" }}>aish.aish.vn@gmail.com</p>
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
  },
  orderItem: {
    display: "flex",
    gap: "15px",
    marginBottom: "20px",
    paddingBottom: "20px",
    borderBottom: "1px solid #e0e0e0",
  },
  orderImage: {
    width: "80px",
    height: "80px",
    objectFit: "cover",
  },
  orderItemDetails: {
    flex: 1,
  },
  orderDetailRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.85em",
    marginBottom: "5px",
  },
  orderTotals: {
    marginTop: "20px",
  },
  orderTotalRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
    fontSize: "0.9em",
  },
  viewDetailsSection: {
    marginTop: "20px",
  },
  viewDetails: {
    fontSize: "0.9em",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  billingNote: {
    fontSize: "0.8em",
    color: "#666",
    lineHeight: "1.5",
  },
  helpSection: {
    marginTop: "20px",
  },
};