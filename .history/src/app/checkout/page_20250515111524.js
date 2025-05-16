"use client";
import { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import ShippingPage from "./shipping/page";
import OrderSummary from "./summary/page";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Checkout() {
  const { cartItems, clearCart } = useCart();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  const [isShippingComplete, setIsShippingComplete] = useState(false);
  const [showAdditionalContact, setShowAdditionalContact] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [promoAmount, setPromoAmount] = useState(0);
  const [promoCode, setPromoCode] = useState("");
  const [promoMessage, setPromoMessage] = useState("");

  useEffect(() => {
    setIsMounted(true);
    async function fetchUser() {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const user = await res.json();
          setUserEmail(user.email || "");
        } else {
          setUserEmail("");
        }
      } catch {
        setUserEmail("");
      }
    }
    fetchUser();
  }, []);

  if (!isMounted) return null;

  const order = {
    items: cartItems.map((item) => ({
      productId: item.id,
      name: item.name,
      quantity: item.quantity,
      color: item.color,
      size: item.size,
      price: item.price,
      image: item.image || "/images/image1.jpg",
    })),
    subtotal: cartItems
      .reduce((total, item) => total + item.price * item.quantity, 0),
    shipping: "Free (Express)",
    gst: cartItems.reduce((total, item) => total + item.price * item.quantity, 0) * 0.1,
    total: cartItems
      .reduce((total, item) => total + item.price * item.quantity, 0),
  };

  const validateInputs = () => {
    const newErrors = {};
    const inputs = document.querySelectorAll('input[required], select[required]');
    inputs.forEach((input) => {
      if (!input.value.trim()) {
        newErrors[input.name || input.type] = true;
      }
    });
    return newErrors;
  };

  const handleShippingComplete = async () => {
    const validationErrors = validateInputs();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsShippingComplete(true);
    setShowPaymentDetails(true);
  };

  const handlePlaceOrder = async () => {
    try {
      setIsSubmitting(true);

      // Lấy thông tin từ form
      const formData = new FormData(document.querySelector('form'));
      const orderData = {
        ...order,
        userEmail,
        address: formData.get('address') || "",
        apartment: formData.get('apartment') || "",
        ward: formData.get('ward') || "",
        district: formData.get('district') || "",
        province: formData.get('province') || "",
        zipCode: formData.get('zipCode') || "",
        country: formData.get('country') || "",
        phone: formData.get('phone') || "",
        fullName: formData.get('firstName') + ' ' + formData.get('lastName'),
        email: formData.get('email') || "",
        additionalPhone: formData.get('additionalPhone') || "",
      };

      // Gửi đơn hàng lên server
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.ok) {
        // Xóa giỏ hàng
        clearCart();
        // Chuyển hướng đến trang xác nhận đơn hàng
        router.push(`/order-confirmation/${data.orderId}`);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdditionalContactToggle = () => {
    setShowAdditionalContact(!showAdditionalContact);
  };

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

  if (cartItems.length === 0) {
    return (
      <div style={{ backgroundColor: "#FFFFFF", minHeight: "100vh" }}>
        <div style={styles.navbar}>
          <h1 style={{ margin: 0, color: "black", fontSize: "0.9em" }}>Menu</h1>
        </div>
        <div className="text-center" style={{ paddingTop: "60px", paddingBottom: "60px" }}>
          <h1 style={{
            fontSize: "1.5em",
            fontWeight: "bold",
            marginBottom: "20px",
            color: "#000000",
            textTransform: "uppercase",
            borderBottom: "2px solid #000000",
            display: "inline-block",
            paddingBottom: "5px"
          }}>
            CHECKOUT
          </h1>
          <p style={{ 
            fontSize: "1em", 
            color: "#000000", 
            marginTop: "20px",
            marginBottom: "20px" 
          }}>
            Bạn không có sản phẩm nào trong shopping bag cả.
          </p>
          <button
            onClick={() => router.push('/products')}
            style={{
              backgroundColor: "#000000",
              color: "#FFFFFF",
              padding: "10px 20px",
              border: "none",
              cursor: "pointer",
              fontSize: "0.9em"
            }}
          >
            Khám phá sản phẩm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...styles.pageContainer, backgroundColor: "#FFFFFF" }}>
      <div style={styles.navbar}>
        <h1 style={{ margin: 0, color: "black", fontSize: "0.9em" }}>Menu</h1>
      </div>
      <div style={styles.backButtonContainer}>
        <Link href="/cart" style={styles.backButton}>
          &lt; Back to Shopping Bag
        </Link>
      </div>
      <div style={styles.checkoutContainer}>
        <ShippingPage
          userEmail={userEmail}
          isShippingComplete={isShippingComplete}
          showAdditionalContact={showAdditionalContact}
          showPaymentDetails={showPaymentDetails}
          errors={errors}
          handleShippingComplete={handleShippingComplete}
          handleAdditionalContactToggle={handleAdditionalContactToggle}
          handlePlaceOrder={handlePlaceOrder}
          isSubmitting={isSubmitting}
          order={order}
        />
        <OrderSummary order={order} />
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    backgroundColor: "#ffffff",
    minHeight: "100vh",
    color: "#000000",
    fontSize: "0.85em",
  },
  navbar: {
    backgroundColor: "#f1f1f1",
    height: "50px",
    display: "flex",
    alignItems: "center",
    padding: "0 20px",
    borderBottom: "1px solid #e0e0e0",
    color: "#000000",
  },
  backButtonContainer: {
    maxWidth: "1200px",
    margin: "20px auto",
    padding: "0 0 0 0",
  },
  backButton: {
    fontSize: "0.85em",
    color: "#000000",
    textDecoration: "underline",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "opacity 0.3s ease",
  },
  checkoutContainer: {
    display: "flex",
    maxWidth: "1200px",
    margin: "20px auto",
    gap: "20px",
    padding: "20px",
    backgroundColor: "#ffffff",
    color: "#000000",
  },
  "@media (maxWidth: 768px)": {
    checkoutContainer: {
      flexDirection: "column",
    },
  },
};
export const metadata = {
  title: 'Checkout | AISH',
};
