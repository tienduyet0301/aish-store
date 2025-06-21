"use client";
import { useState, useEffect } from "react";
import { useCart } from "../../../context/CartContext";
import { useCheckout } from "@/context/CheckoutContext";
import { CSSProperties } from "react";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image: string;
}

interface PromoCode {
  id: string;
  code: string;
  type: 'fixed' | 'percentage';
  value: number;
  maxAmount?: number | null;
  isLoginRequired: boolean;
  perUserLimit: number;
  expiryDate?: string | null;
  usedByUsers?: string[];
  usedCount?: number;
}

interface Order {
  items: OrderItem[];
  subtotal: number;
  promoCode?: string;
  promoAmount?: number;
}

interface OrderSummaryProps {
  order: Order;
  shippingFee?: number;
  provinceName?: string;
}

interface Styles {
  rightSection: CSSProperties;
  orderSummary: CSSProperties;
  sectionTitle: CSSProperties;
  orderItem: CSSProperties;
  orderImage: CSSProperties;
  orderItemDetails: CSSProperties;
  orderDetailRow: CSSProperties;
  orderTotals: CSSProperties;
  orderTotalRow: CSSProperties;
  viewDetailsSection: CSSProperties;
  viewDetails: CSSProperties;
  billingNote: CSSProperties;
  helpSection: CSSProperties;
}

export default function OrderSummary({ order, shippingFee = 0, provinceName }: OrderSummaryProps) {
  const { cartItems } = useCart();
  const [isMounted, setIsMounted] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoMessage, setPromoMessage] = useState("");
  const [promoAmount, setPromoAmount] = useState(0);
  const [appliedPromoCode, setAppliedPromoCode] = useState<PromoCode | null>(null);
  const { formatShippingFee } = useCheckout();

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

    // Lấy mã giảm giá đã áp dụng từ localStorage
    const savedPromoCode = localStorage.getItem('appliedPromoCode');
    const savedPromoAmount = localStorage.getItem('promoAmount');

    if (savedPromoCode && savedPromoAmount) {
      try {
        const parsedPromoCode = JSON.parse(savedPromoCode);
        setAppliedPromoCode(parsedPromoCode);
        setPromoAmount(parseFloat(savedPromoAmount));
        setPromoMessage(`Mã giảm giá ${parseFloat(savedPromoAmount).toLocaleString('vi-VN')} VND đã được áp dụng!`);
        // Cập nhật order state nếu nó đã được load
        if (order) {
          setOrder(prevOrder => ({
            ...prevOrder!,
            promoCode: parsedPromoCode.code,
            promoAmount: parseFloat(savedPromoAmount)
          }));
        }
      } catch (e) {
        console.error("Error parsing saved promo code:", e);
        // Xóa dữ liệu không hợp lệ nếu parsing thất bại
        localStorage.removeItem('appliedPromoCode');
        localStorage.removeItem('promoAmount');
      }
    }
  }, [cartItems, order]); // Thêm order vào dependency array

  // Cleanup effect to remove promo code from localStorage when component unmounts
  useEffect(() => {
    return () => {
      localStorage.removeItem('appliedPromoCode');
      localStorage.removeItem('promoAmount');
    };
  }, []); // Run effect only once on mount and cleanup on unmount

  const calculateTotal = () => {
    const subtotal = order.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    return subtotal - (order.promoAmount || 0) + shippingFee;
  };

  const handleApplyPromoCode = async () => {
    setPromoMessage("");
    setPromoAmount(0);
    setAppliedPromoCode(null);

    if (!promoCode.trim()) {
      setPromoMessage("Vui lòng nhập mã giảm giá");
      return;
    }

    try {
      const response = await fetch("/api/admin/notifications");
      const data = await response.json();
      
      if (data.ok && data.promoCodes) {
        const foundPromo = data.promoCodes.find(
          promo => promo.code.toLowerCase() === promoCode.toLowerCase() && promo.isActive
        );
        
        if (foundPromo) {
          setPromoAmount(foundPromo.amount);
          setAppliedPromoCode(foundPromo);
          setPromoMessage(`Mã giảm giá ${foundPromo.amount.toLocaleString('vi-VN')} VND đã được áp dụng!`);
        } else {
          setPromoMessage("Mã giảm giá không hợp lệ hoặc đã hết hạn");
          setPromoAmount(0);
          setAppliedPromoCode(null);
        }
      } else {
        setPromoMessage("Không thể kiểm tra mã giảm giá");
        setPromoAmount(0);
        setAppliedPromoCode(null);
      }
    } catch (error) {
      console.error("Error applying promo code:", error);
      setPromoMessage("Có lỗi xảy ra khi áp dụng mã giảm giá");
      setPromoAmount(0);
      setAppliedPromoCode(null);
    }
  };

  const handleResetPromoCode = () => {
    setPromoCode("");
    setPromoMessage("");
    setPromoAmount(0);
    setAppliedPromoCode(null);
  };

  if (!isMounted || !order) return null;

  return (
    <div style={styles.rightSection}>
      <div style={styles.orderSummary}>
        <h2 style={styles.sectionTitle}>ORDER SUMMARY</h2>
        
        {order.items.map((item, index) => (
          <div key={index} style={styles.orderItem}>
            <img
              src={item.image}
              alt={item.name}
              style={styles.orderImage}
            />
            <div style={styles.orderItemDetails}>
              <div style={styles.orderDetailRow}>
                <span>{item.name}</span>
              </div>
              <div style={styles.orderDetailRow}>
                <span>Size: {item.size}</span>
              </div>
              <div style={styles.orderDetailRow}>
                <span>Color: {item.color}</span>
              </div>
              <div style={styles.orderDetailRow}>
                <span>Quantity: {item.quantity}</span>
              </div>
              <div style={styles.orderDetailRow}>
                <span>Expected 5 days</span>
              </div>
              <div style={styles.orderDetailRow}>
                <span>Price:</span>
                <span>{(item.price * item.quantity).toLocaleString('vi-VN')} VND</span>
              </div>
            </div>
          </div>
        ))}
        
        <div style={styles.orderTotals}>
          {order.promoAmount > 0 && (
            <div style={styles.orderTotalRow}>
              <span>Discount</span>
              <span>- {order.promoAmount.toLocaleString('vi-VN')} VND</span>
            </div>
          )}
          <div style={styles.orderTotalRow}>
            <span>Shipping</span>
            <span>{provinceName ? formatShippingFee(shippingFee) : "Shipping fee will be calculated at checkout"}</span>
          </div>
          {provinceName && (
            <div style={{
              fontSize: "0.8em",
              color: "#666",
              marginBottom: "10px",
              textAlign: "right"
            }}>
              {shippingFee === 22000 ? "Same city delivery (HCMC)" : "Inter-city delivery"}
            </div>
          )}
          <div style={styles.orderTotalRow}>
            <span style={{ fontWeight: "bold" }}>Total</span>
            <span style={{ fontWeight: "bold" }}>{calculateTotal().toLocaleString('vi-VN')} VND</span>
          </div>
        </div>
      </div>
      
      <div style={styles.viewDetailsSection}>
        <h3 style={styles.viewDetails}>VIEW DETAILS</h3>
        <p style={styles.billingNote}>
          Billing address will be the same as shipping address. 
          You can change this in your account settings.
        </p>
      </div>
      
      <div style={styles.helpSection}>
        <h3 style={styles.viewDetails}>NEED HELP?</h3>
        <p style={styles.billingNote}>
          If you have any questions about your order, please contact us at support@aish.com
        </p>
      </div>
    </div>
  );
}

const styles: Styles = {
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