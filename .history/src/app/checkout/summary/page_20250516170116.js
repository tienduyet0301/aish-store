"use client";
import { useState, useEffect } from "react";
import { useCart } from "../../../context/CartContext";

export default function OrderSummary({ order }) {
    const { cartItems } = useCart();
    const [isMounted, setIsMounted] = useState(false);
    const [promoCode, setPromoCode] = useState("");
    const [promoMessage, setPromoMessage] = useState("");
    const [promoAmount, setPromoAmount] = useState(0);
    const [appliedPromoCode, setAppliedPromoCode] = useState("");

    useEffect(() => {
      setIsMounted(true);
    }, []);

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
            promo => promo.code.toLowerCase() === promoCode.toLowerCase() && promo.isActive
          );
          
          if (foundPromo) {
            setPromoAmount(foundPromo.amount);
            setAppliedPromoCode(foundPromo.code);
            setPromoMessage(`Promo code ${foundPromo.amount.toLocaleString('vi-VN')} VND has been applied!`);
            setPromoCode("");
            
            if (order) {
              order.promoCode = foundPromo.code;
              order.promoAmount = foundPromo.amount;
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
      const subtotal = order.items.reduce((total, item) => {
        const priceStr = typeof item.price === 'string' ? item.price.replace('AU$', '').trim() : item.price;
        const price = parseFloat(priceStr) || 0;
        return total + (price * item.quantity);
      }, 0);
      return subtotal - promoAmount;
    };

    if (!isMounted) return null;

    return (
      <div style={{
        flex: 1,
        backgroundColor: "#ffffff",
        padding: "15px",
        border: "1px solid #e0e0e0",
        color: "#000000",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        "@media (max-width: 768px)": {
          padding: "12px",
          gap: "15px",
          border: "none",
          borderTop: "1px solid #000000",
          marginTop: "0"
        }
      }}>
        <div style={{ color: "#000000" }}>
          <h2 style={{
            fontSize: "1.1em",
            fontWeight: "bold",
            marginBottom: "15px",
            color: "#000000",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            "@media (max-width: 768px)": {
              fontSize: "0.9em",
              marginBottom: "10px",
              textAlign: "center",
              justifyContent: "center"
            }
          }}>
            ORDER SUMMARY
          </h2>
          {order.items.map((item, index) => {
            const priceStr = typeof item.price === 'string' ? item.price.replace('AU$', '').trim() : item.price;
            const price = parseFloat(priceStr) || 0;
            const color = item.color || (cartItems && cartItems[index] && cartItems[index].color) || "Không xác định";
            return (
              <div key={index} style={{
                display: "flex",
                gap: "15px",
                marginBottom: "25px",
                color: "#000000",
                "@media (max-width: 768px)": {
                  gap: "10px",
                  marginBottom: "15px"
                }
              }}>
                <img src={item.image} alt={item.name} style={{
                  width: "80px",
                  height: "80px",
                  objectFit: "cover",
                  "@media (max-width: 768px)": {
                    width: "60px",
                    height: "60px"
                  }
                }} />
                <div style={{ color: "#000000", flex: 1 }}>
                  <p style={{ fontWeight: "bold", marginBottom: "8px", fontSize: "0.95em" }}>{item.name}</p>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                    fontSize: "0.75em",
                    "@media (max-width: 768px)": {
                      fontSize: "0.7em",
                      marginBottom: "5px"
                    }
                  }}>
                    <span>Quantity:</span>
                    <span>{item.quantity}</span>
                  </div>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                    fontSize: "0.75em",
                    "@media (max-width: 768px)": {
                      fontSize: "0.7em",
                      marginBottom: "5px"
                    }
                  }}>
                    <span>Color:</span>
                    <span>{color}</span>
                  </div>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                    fontSize: "0.75em",
                    "@media (max-width: 768px)": {
                      fontSize: "0.7em",
                      marginBottom: "5px"
                    }
                  }}>
                    <span>Size:</span>
                    <span>{item.size}</span>
                  </div>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                    fontSize: "0.75em",
                    "@media (max-width: 768px)": {
                      fontSize: "0.7em",
                      marginBottom: "5px"
                    }
                  }}>
                    <span>Time:</span>
                    <span>Expected 2-3 days</span>
                  </div>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                    fontSize: "0.75em",
                    "@media (max-width: 768px)": {
                      fontSize: "0.7em",
                      marginBottom: "5px"
                    }
                  }}>
                    <span>Price:</span>
                    <span>{(price * item.quantity).toLocaleString('vi-VN')} VND</span>
                  </div>
                </div>
              </div>
            );
          })}
          <div style={{
            color: "#000000",
            "@media (max-width: 768px)": {
              borderTop: "1px solid #000000",
              paddingTop: "10px"
            }
          }}>
            {promoAmount > 0 ? (
              <>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                  "@media (max-width: 768px)": {
                    marginBottom: "8px",
                    fontSize: "0.8em"
                  }
                }}>
                  <span>Promo Code</span>
                  <span>- {promoAmount.toLocaleString('vi-VN')} VND</span>
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
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "12px",
              "@media (max-width: 768px)": {
                marginBottom: "8px",
                fontSize: "0.8em"
              }
            }}>
              <span>Shipping</span>
              <span>Free (Express)</span>
            </div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "12px",
              "@media (max-width: 768px)": {
                marginBottom: "8px",
                fontSize: "0.8em"
              }
            }}>
              <span style={{ fontWeight: "bold" }}>Total</span>
              <span style={{ fontWeight: "bold" }}>{calculateTotal().toLocaleString('vi-VN')} VND</span>
            </div>
          </div>
        </div>
        <div style={{
          color: "#000000",
          borderTop: "1px solid #000000",
          paddingTop: "10px",
          "@media (max-width: 768px)": {
            display: "none"
          }
        }}>
          <div style={{
            fontSize: "0.8em",
            marginTop: "15px",
            marginBottom: "15px",
            cursor: "pointer",
            textDecoration: "underline",
            color: "#000000",
          }}>
            VIEW DETAILS
          </div>
          <div style={{
            fontSize: "0.75em",
            color: "#000000",
            marginTop: "15px",
            marginBottom: "15px",
          }}>
            Please note that you can choose between two payment methods: Bank Transfer or Cash on Delivery (COD). For Bank Transfer, please complete the payment after placing your order to proceed with processing. For COD, you will pay in cash when the product is delivered to your address.
          </div>
        </div>
        <div style={{
          fontSize: "0.8em",
          color: "#000000",
          borderTop: "1px solid #000000",
          borderBottom: "1px solid #000000",
          paddingTop: "10px",
          paddingBottom: "10px",
          "@media (max-width: 768px)": {
            display: "none"
          }
        }}>
          <p style={{ marginBottom: "10px", fontWeight: "bold" }}>MAY WE HELP?</p>
          <p style={{ marginBottom: "10px" }}>0347272386</p>
          <p style={{ marginBottom: "10px" }}>aish.aish.vn@gmail.com</p>
        </div>
      </div>
    );
  }