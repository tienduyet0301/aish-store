"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useVietnameseAddress } from "../../../hooks/useVietnameseAddress";
import OrderConfirmationModal from "../../../components/OrderConfirmationModal";

export default function ShippingPage({
  userEmail: propUserEmail,
  isShippingComplete,
  showAdditionalContact,
  showPaymentDetails,
  errors,
  handleShippingComplete,
  handleAdditionalContactToggle,
  order,
}) {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [showPaymentSection, setShowPaymentSection] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [localUserEmail, setLocalUserEmail] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    phone: "",
    additionalPhone: "",
    apartment: "",
  });

  const {
    provinces,
    districts,
    wards,
    selectedProvince,
    selectedDistrict,
    selectedWard,
    selectedProvinceName,
    selectedDistrictName,
    selectedWardName,
    handleProvinceChange,
    handleDistrictChange,
    handleWardChange
  } = useVietnameseAddress();

  useEffect(() => {
    // Lấy email từ localStorage hoặc sessionStorage
    const email = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
    if (email) {
      setLocalUserEmail(email);
    }
  }, []);

  // Sử dụng email từ props hoặc từ localStorage
  const userEmail = propUserEmail || localUserEmail;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContinueToPayment = (e) => {
    e.preventDefault();
    // Thêm validation cho form shipping
    const shippingForm = document.getElementById('shippingForm');
    if (shippingForm.checkValidity()) {
      setShowPaymentSection(true);
      // Scroll to payment section
      const paymentSection = document.getElementById('paymentSection');
      if (paymentSection) {
        paymentSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      shippingForm.reportValidity();
    }
  };

  const handleCompleteOrder = async (e) => {
    e.preventDefault();
    
    try {
      // Log kiểm tra selectedWard và selectedWardName
      console.log('selectedWard:', selectedWard);
      console.log('selectedWardName:', selectedWardName);
      // Kiểm tra xem đã chọn đủ thông tin địa chỉ chưa
      if (!selectedProvince || !selectedDistrict || !selectedWard) {
        alert("Please select complete address information");
        return;
      }

      // Kiểm tra các trường bắt buộc
      if (!formData.firstName || !formData.lastName || !formData.phone) {
        alert("Please fill in all required information");
        return;
      }

      // Tìm thông tin địa chỉ
      const selectedProvinceData = provinces.find(p => p.code === selectedProvince);
      const selectedDistrictData = districts.find(d => d.code === selectedDistrict);
      const selectedWardData = wards.find(w => w.code === selectedWard);

      // Log để kiểm tra dữ liệu
      console.log('Selected Address Data:', {
        province: selectedProvinceData,
        district: selectedDistrictData,
        ward: selectedWardData
      });

      // Tạo mã đơn hàng
      const now = new Date();
      const orderCode = `AISH${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

      // Tính toán lại tổng tiền
      const subtotal = order.items.reduce((total, item) => {
        const priceStr = typeof item.price === 'string' ? item.price.replace('AU$', '').trim() : item.price;
        const price = parseFloat(priceStr) || 0;
        return total + (price * item.quantity);
      }, 0);

      const details = {
        orderCode: orderCode,
        fullName: `${formData.firstName} ${formData.lastName}`,
        email: userEmail,
        phone: formData.phone,
        additionalPhone: formData.additionalPhone || null,
        apartment: formData.apartment || null,
        ward: selectedWardName || "",
        district: selectedDistrictName || "",
        province: selectedProvinceName || "",
        items: order.items.map(item => ({
          ...item,
          price: typeof item.price === 'string' ? parseFloat(item.price.replace('AU$', '').trim()) : item.price
        })),
        subtotal: subtotal,
        shippingFee: "Free",
        promoCode: order.promoCode || null,
        promoAmount: order.promoAmount || 0,
        total: subtotal - (order.promoAmount || 0),
        paymentMethod: paymentMethod,
        status: 'pending',
        paymentStatus: 'pending',
        shippingStatus: 'pending'
      };

      // Log để kiểm tra dữ liệu
      console.log('Order Details:', details);
      console.log('Selected Address:', {
        apartment: formData.apartment,
        ward: selectedWardName,
        district: selectedDistrictName,
        province: selectedProvinceName
      });

      // Chỉ hiển thị modal xác nhận, không tạo đơn hàng ngay
      setOrderDetails(details);
      setShowConfirmationModal(true);
    } catch (error) {
      console.error("Error preparing order:", error);
      alert("An error occurred while preparing the order. Please try again.");
    }
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const renderPaymentInfo = () => {
    if (!paymentMethod) return null;

    if (paymentMethod === 'cod') {
      return (
        <div style={{
          marginTop: "20px",
          padding: "15px",
          backgroundColor: "#f8f8f8",
          borderRadius: "4px"
        }}>
          <p style={{
            fontSize: "0.9em",
            color: "#000000",
            fontStyle: "italic"
          }}>
            Quý khách ghi nhớ mã đơn hàng và nhắn tin cho Facebook hoặc Instagram aish.aish.vn nếu muốn tra cứu mã vận đơn nhé
          </p>
        </div>
      );
    }

    if (paymentMethod === 'bank') {
      return (
        <div style={{
          marginTop: "20px",
          padding: "15px",
          backgroundColor: "#f8f8f8",
          borderRadius: "4px"
        }}>
          <h3 style={{
            fontSize: "0.9em",
            fontWeight: "bold",
            marginBottom: "10px",
            color: "#000000"
          }}>
            Thông tin chuyển khoản
          </h3>
          <div style={{ fontSize: "0.9em", color: "#000000" }}>
            <p style={{ marginBottom: "8px" }}>Ngân hàng: MB BANK</p>
            <p style={{ marginBottom: "8px" }}>Chủ tài khoản: PHAN THUY TRUC DAO</p>
            <p style={{ marginBottom: "8px" }}>Số tài khoản: 024052306</p>
            <p style={{ marginBottom: "8px" }}>
              Nội dung chuyển khoản: MÃ ĐƠN HÀNG + SĐT
            </p>
            <p style={{
              marginTop: "15px",
              fontStyle: "italic",
              color: "#666666"
            }}>
              Sau khi đặt hàng thành công, quý khách sẽ thấy mã đơn hàng tại trang. Quý khách vui lòng chuyển khoản đúng nội dung và chụp màn hình gửi về Facebook hoặc Instagram aish.aish.vn nhaa
            </p>
          </div>
        </div>
      );
    }
  };

  return (
    <div style={styles.leftSection}>
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>CONTACT INFORMATION</h2>
        <p style={styles.sectionText}>
          {userEmail ? (
            <>
              {userEmail} (<Link href="/logout" style={styles.link}>Đăng xuất</Link>)
            </>
          ) : (
            "Bạn chưa đăng nhập"
          )}
        </p>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>SHIPPING ADDRESS</h2>
        <form id="shippingForm" style={styles.form}>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>First Name *</label>
              <input
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  width: "100%",
                  padding: "8px",
                  fontSize: "0.9em",
                  border: "1px solid #000000",
                  marginBottom: "10px",
                }}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Last Name *</label>
              <input
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  width: "100%",
                  padding: "8px",
                  fontSize: "0.9em",
                  border: "1px solid #000000",
                  marginBottom: "10px",
                }}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Phone Number *</label>
            <input
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleInputChange}
              style={{
                ...styles.input,
                width: "100%",
                padding: "8px",
                fontSize: "0.9em",
                border: "1px solid #000000",
                marginBottom: "10px",
              }}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Address *</label>
            <input
              name="address"
              type="text"
              required
              style={{
                ...styles.input,
                width: "100%",
                padding: "8px",
                fontSize: "0.9em",
                border: "1px solid #000000",
                marginBottom: "10px",
              }}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Apartment, suite, etc.</label>
            <input
              name="apartment"
              type="text"
              value={formData.apartment}
              onChange={handleInputChange}
              style={{
                ...styles.input,
                width: "100%",
                padding: "8px",
                fontSize: "0.9em",
                border: "1px solid #000000",
                marginBottom: "10px",
              }}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Province/City *</label>
            <select
              value={selectedProvince}
              onChange={handleProvinceChange}
              required
              style={{
                ...styles.input,
                width: "100%",
                padding: "8px",
                fontSize: "0.9em",
                border: "1px solid #000000",
                marginBottom: "10px",
                backgroundColor: "white",
              }}
            >
              <option value="">Select Province/City</option>
              {provinces.map((province) => (
                <option key={province.code} value={province.code}>
                  {province.name}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>District *</label>
            <select
              value={selectedDistrict}
              onChange={handleDistrictChange}
              required
              style={{
                ...styles.input,
                width: "100%",
                padding: "8px",
                fontSize: "0.9em",
                border: "1px solid #000000",
                marginBottom: "10px",
                backgroundColor: "white",
              }}
            >
              <option value="">Select District</option>
              {districts.map((district) => (
                <option key={district.code} value={district.code}>
                  {district.name}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Ward *</label>
            <select
              value={selectedWard}
              onChange={handleWardChange}
              required
              style={{
                ...styles.input,
                width: "100%",
                padding: "8px",
                fontSize: "0.9em",
                border: "1px solid #000000",
                marginBottom: "10px",
                backgroundColor: "white",
              }}
            >
              <option value="">Select Ward</option>
              {wards.map((ward) => (
                <option key={ward.code} value={ward.code}>
                  {ward.name}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <button
              type="button"
              onClick={handleAdditionalContactToggle}
              style={{
                ...styles.button,
                backgroundColor: "transparent",
                color: "#000000",
                border: "none",
                padding: "0",
                fontSize: "0.9em",
                textDecoration: "underline",
                cursor: "pointer",
                marginBottom: "10px",
              }}
            >
              + Add Additional Contact Information
            </button>
          </div>

          {showAdditionalContact && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Additional Phone Number</label>
              <input
                name="additionalPhone"
                type="tel"
                value={formData.additionalPhone}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  width: "100%",
                  padding: "8px",
                  fontSize: "0.9em",
                  border: "1px solid #000000",
                  marginBottom: "10px",
                }}
              />
            </div>
          )}

          <div style={styles.formGroup}>
            <button
              type="submit"
              onClick={handleContinueToPayment}
              style={{
                ...styles.button,
                width: "100%",
                padding: "12px",
                fontSize: "0.9em",
                backgroundColor: "#000000",
                color: "#ffffff",
                border: "none",
                cursor: "pointer",
                marginTop: "20px",
              }}
            >
              Continue to Payment
            </button>
          </div>
        </form>
      </div>

      {showPaymentSection && (
        <div id="paymentSection" style={styles.section}>
          <h2 style={styles.sectionTitle}>PAYMENT METHOD</h2>
          <div style={styles.paymentMethods}>
            <button
              onClick={() => handlePaymentMethodChange('cod')}
              style={{
                ...styles.paymentButton,
                backgroundColor: paymentMethod === 'cod' ? '#000000' : '#ffffff',
                color: paymentMethod === 'cod' ? '#ffffff' : '#000000',
              }}
            >
              Cash on Delivery (COD)
            </button>
            <button
              onClick={() => handlePaymentMethodChange('bank')}
              style={{
                ...styles.paymentButton,
                backgroundColor: paymentMethod === 'bank' ? '#000000' : '#ffffff',
                color: paymentMethod === 'bank' ? '#ffffff' : '#000000',
              }}
            >
              Bank Transfer
            </button>
          </div>
          {renderPaymentInfo()}
          <button
            onClick={handleCompleteOrder}
            style={{
              ...styles.button,
              width: "100%",
              padding: "12px",
              fontSize: "0.9em",
              backgroundColor: "#000000",
              color: "#ffffff",
              border: "none",
              cursor: "pointer",
              marginTop: "20px",
            }}
          >
            Complete Order
          </button>
        </div>
      )}

      <OrderConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        orderDetails={orderDetails}
      />
    </div>
  );
}

const styles = {
  leftSection: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: "15px",
    color: "#000000",
  },
  section: {
    marginBottom: "30px",
  },
  sectionTitle: {
    fontSize: "1.1em",
    fontWeight: "bold",
    marginBottom: "15px",
    color: "#000000",
  },
  sectionText: {
    fontSize: "0.9em",
    color: "#000000",
  },
  link: {
    color: "#000000",
    textDecoration: "underline",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  formRow: {
    display: "flex",
    gap: "15px",
    flexDirection: "column",
    "@media (min-width: 768px)": {
      flexDirection: "row",
    },
  },
  formGroup: {
    flex: 1,
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontSize: "0.9em",
    color: "#000000",
  },
  input: {
    width: "100%",
    padding: "8px",
    fontSize: "0.9em",
    border: "1px solid #000000",
    marginBottom: "10px",
  },
  button: {
    padding: "10px 20px",
    fontSize: "0.9em",
    backgroundColor: "#000000",
    color: "#ffffff",
    border: "none",
    cursor: "pointer",
  },
  paymentMethods: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "20px",
  },
  paymentButton: {
    padding: "12px",
    fontSize: "0.9em",
    border: "1px solid #000000",
    cursor: "pointer",
    width: "100%",
    textAlign: "left",
  },
};