"use client";
import { useState, useEffect } from "react";
import { useCart } from "../../../context/CartContext";

export default function OrderSummary({ order }) {
  const { cartItems } = useCart();
  const [isMounted, setIsMounted] = useState(false);
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [promoAmount, setPromoAmount] = useState(0);
  const [promoCode, setPromoCode] = useState("");
  const [promoMessage, setPromoMessage] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleApplyPromoCode = async () => {
    setPromoMessage("");
    setPromoAmount(0);
    setIsPromoApplied(false);

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
          setIsPromoApplied(true);
          setPromoMessage(`Mã giảm giá ${foundPromo.amount.toLocaleString('vi-VN')} VND đã được áp dụng!`);
        } else {
          setPromoMessage("Mã giảm giá không hợp lệ hoặc đã hết hạn");
          setPromoAmount(0);
          setIsPromoApplied(false);
        }
      } else {
        setPromoMessage("Không thể kiểm tra mã giảm giá");
        setPromoAmount(0);
        setIsPromoApplied(false);
      }
    } catch (error) {
      console.error("Error applying promo code:", error);
      setPromoMessage("Có lỗi xảy ra khi áp dụng mã giảm giá");
      setPromoAmount(0);
      setIsPromoApplied(false);
    }
  };

  const handleResetPromoCode = () => {
    setPromoCode("");
    setPromoMessage("");
    setPromoAmount(0);
    setIsPromoApplied(false);
  };

  const calculateTotal = () => {
    const subtotal = cartItems
      .reduce((total, item) => {
        const itemTotal = item.price * item.quantity;
        return total + itemTotal;
      }, 0);

    const finalTotal = subtotal - (isPromoApplied ? promoAmount : 0);
    
    return finalTotal.toLocaleString('vi-VN') + " VND";
  };

  if (!isMounted) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
      <h2 style={{
        fontSize: "1em",
        fontWeight: "bold",
        marginBottom: "15px",
        color: "#000000",
        textAlign: "left",
        borderBottom: "1px solid #000000",
        paddingBottom: "10px"
      }}>
        ORDER SUMMARY
      </h2>
      <div className="space-y-4">
        {cartItems.map((item) => (
          <div key={item.cartItemId || `${item.id}-${item.size}`} style={{
            display: "flex",
            gap: "15px",
            marginBottom: "20px",
            color: "#000000",
          }}>
            <img 
              src={item.image} 
              alt={item.name} 
              style={{
                width: "80px",
                height: "80px",
                objectFit: "cover",
              }}
            />
            <div style={{
              color: "#000000",
              flex: 1,
            }}>
              <p style={{ 
                fontWeight: "bold", 
                marginBottom: "6px", 
                fontSize: "0.9em" 
              }}>
                {item.name}
              </p>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "4px",
                fontSize: "0.7em",
                color: "#000000",
              }}>
                <span>Số lượng:</span>
                <span>{item.quantity}</span>
              </div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "4px",
                fontSize: "0.7em",
                color: "#000000",
              }}>
                <span>Màu:</span>
                <span>{item.color || "Đen"}</span>
              </div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "4px",
                fontSize: "0.7em",
                color: "#000000",
              }}>
                <span>Size:</span>
                <span>{item.size || "Unknown"}</span>
              </div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "4px",
                fontSize: "0.7em",
                color: "#000000",
              }}>
                <span>Thời gian:</span>
                <span>{item.shippingInfo || "Dự kiến 5 ngày"}</span>
              </div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "4px",
                fontSize: "0.7em",
                color: "#000000",
              }}>
                <span>Giá:</span>
                <span>{(item.price * item.quantity).toLocaleString('vi-VN')} VND</span>
              </div>
            </div>
          </div>
        ))}
        
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "8px",
          fontSize: "0.7em",
          color: "#000000",
        }}>
          <span>Vận chuyển</span>
          <span>Miễn phí (Express)</span>
        </div>
        {isPromoApplied && (
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "8px",
            fontSize: "0.7em",
            color: "#000000",
          }}>
            <span>Mã giảm giá</span>
            <span>- {promoAmount.toLocaleString('vi-VN')} VND</span>
          </div>
        )}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "8px",
          fontSize: "0.7em",
          fontWeight: "bold",
          color: "#000000",
        }}>
          <span>Tổng cộng</span>
          <span>{calculateTotal()}</span>
        </div>
      </div>
      <div style={{ 
        borderTop: "1px solid #000000", 
        paddingTop: "10px",
        marginTop: "20px"
      }}>
        <div style={{
          display: "flex",
          gap: "10px",
          marginBottom: "15px",
        }}>
          <input
            type="text"
            value={promoCode}
            onChange={(e) => {
              setPromoCode(e.target.value);
              if (promoMessage) {
                setPromoMessage("");
              }
            }}
            placeholder="Enter promo code"
            style={{
              flex: 1,
              padding: "8px",
              fontSize: "0.7em",
              border: "1px solid #000000",
              color: "#000000",
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
          {isPromoApplied && (
            <button
              onClick={handleResetPromoCode}
              style={{
                padding: "8px 15px",
                fontSize: "0.7em",
                backgroundColor: "#dc2626",
                color: "#ffffff",
                border: "none",
                cursor: "pointer",
              }}
            >
              Reset
            </button>
          )}
        </div>
        {promoMessage && (
          <p style={{
            fontSize: "0.7em",
            color: isPromoApplied ? "#059669" : "#dc2626",
            marginBottom: "10px"
          }}>
            {promoMessage}
          </p>
        )}
      </div>
    </div>
  );
}