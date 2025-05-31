"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useVietnameseAddress } from "../../../hooks/useVietnameseAddress";
import OrderConfirmationModal from "../../../components/OrderConfirmationModal";

// Define types for props
const ShippingPage = ({
  userEmail: propUserEmail,
  isShippingComplete,
  showAdditionalContact,
  showPaymentDetails,
  errors = {},
  handleShippingComplete,
  handleAdditionalContactToggle,
  order = { items: [], promoCode: null, promoAmount: 0 },
}) => {
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
                value={formData.firstName}
                onChange={handleInputChange}
                style={{ ...styles.input, borderColor: errors.firstName ? "red" : "#e0e0e0" }}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Last Name *</label>
              <input
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleInputChange}
                style={{ ...styles.input, borderColor: errors.lastName ? "red" : "#e0e0e0" }}
                required
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Apartment, building, etc. (optional)</label>
            <input
              name="apartment"
              type="text"
              value={formData.apartment}
              onChange={handleInputChange}
              style={styles.input}
            />
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Province/City *</label>
              <select
                value={selectedProvince}
                onChange={handleProvinceChange}
                style={{ ...styles.input, borderColor: errors.province ? "red" : "#e0e0e0" }}
                required
              >
                <option value="">Chọn Tỉnh/Thành phố</option>
                {provinces.map((province) => (
                  <option key={province.code} value={province.code}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>District/County *</label>
              <select
                value={selectedDistrict}
                onChange={handleDistrictChange}
                style={{ ...styles.input, borderColor: errors.district ? "red" : "#e0e0e0" }}
                required
                disabled={!selectedProvince}
              >
                <option value="">Chọn Quận/Huyện</option>
                {districts.map((district) => (
                  <option key={district.code} value={district.code}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Ward/Commune *</label>
              <select
                value={selectedWard}
                onChange={handleWardChange}
                style={{ ...styles.input, borderColor: errors.ward ? "red" : "#e0e0e0" }}
                required
                disabled={!selectedDistrict}
              >
                <option value="">Chọn Phường/Xã</option>
                {wards.map((ward) => (
                  <option key={ward.code} value={ward.code}>
                    {ward.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Phone *</label>
              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                style={{ ...styles.input, borderColor: errors.phone ? "red" : "#e0e0e0" }}
                required
              />
            </div>
          </div>

          {showAdditionalContact && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Additional Phone (optional)</label>
              <input
                name="additionalPhone"
                type="tel"
                value={formData.additionalPhone}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>
          )}

          {/* Thêm các trường ẩn để lưu thông tin địa chỉ */}
          <input type="hidden" name="ward" value={selectedWardName} />
          <input type="hidden" name="district" value={selectedDistrictName} />
          <input type="hidden" name="province" value={selectedProvinceName} />

          <button
            onClick={handleContinueToPayment}
            style={{
              ...styles.continueButton,
              textTransform: "uppercase"
            }}
            type="submit"
          >
            Continue to Payment
          </button>
        </form>
      </div>

      {showPaymentSection && (
        <div id="paymentSection" style={styles.section}>
          <h2 style={styles.sectionTitle}>PAYMENT METHOD</h2>
          <div style={styles.paymentMethods}>
            <div
              style={{
                ...styles.paymentMethod,
                borderColor: paymentMethod === "cod" ? "#000" : "#e0e0e0",
              }}
              onClick={() => handlePaymentMethodChange("cod")}
            >
              <div style={styles.paymentMethodHeader}>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "cod"}
                  onChange={() => handlePaymentMethodChange("cod")}
                  style={styles.radio}
                />
                <label
                  style={{
                    ...styles.paymentMethodLabel,
                    fontSize: "0.85em",
                    ...(typeof window !== 'undefined' && window.innerWidth <= 768 ? { fontSize: "12px" } : {})
                  }}
                >
                  Cash on Delivery (COD)
                </label>
              </div>
            </div>

            <div
              style={{
                ...styles.paymentMethod,
                borderColor: paymentMethod === "bank" ? "#000" : "#e0e0e0",
              }}
              onClick={() => handlePaymentMethodChange("bank")}
            >
              <div style={styles.paymentMethodHeader}>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "bank"}
                  onChange={() => handlePaymentMethodChange("bank")}
                  style={styles.radio}
                />
                <label
                  style={{
                    ...styles.paymentMethodLabel,
                    fontSize: "0.85em",
                    ...(typeof window !== 'undefined' && window.innerWidth <= 768 ? { fontSize: "12px" } : {})
                  }}
                >
                  Bank Transfer
                </label>
              </div>
            </div>
          </div>

          {renderPaymentInfo()}

          {paymentMethod && (
            <button
              onClick={handleCompleteOrder}
              className="w-full mt-4"
              style={{
                ...styles.completeOrderButton,
                textTransform: "uppercase"
              }}
            >
              Complete Order
            </button>
          )}
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
    flex: 2,
    backgroundColor: "#ffffff",
    padding: "20px",
    border: "1px solid #e0e0e0",
    color: "#000000",
  },
  section: {
    marginBottom: "30px",
    color: "#000000",
  },
  sectionTitle: {
    fontSize: "1.1em",
    fontWeight: "bold",
    marginBottom: "15px",
    color: "#000000",
  },
  sectionText: {
    fontSize: "0.85em",
    color: "#000000",
  },
  link: {
    color: "#000000",
    textDecoration: "underline",
    cursor: "pointer",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    color: "#000000",
  },
  formRow: {
    display: "flex",
    gap: "15px",
    color: "#000000",
  },
  formGroup: {
    flex: 1,
    color: "#000000",
  },
  label: {
    fontSize: "0.85em",
    marginBottom: "5px",
    display: "block",
    color: "#000000",
  },
  input: {
    width: "100%",
    padding: "10px",
    fontSize: "0.85em",
    border: "1px solid #e0e0e0",
    borderRadius: "4px",
    color: "#000000",
  },
  checkboxGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#000000",
  },
  checkbox: {
    width: "20px",
    height: "20px",
    color: "#000000",
  },
  checkboxLabel: {
    fontSize: "0.85em",
    color: "#000000",
  },
  paymentMethods: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    marginTop: "20px",
  },
  paymentMethod: {
    border: "1px solid #e0e0e0",
    borderRadius: "4px",
    padding: "15px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  paymentMethodHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  paymentMethodLabel: {
    fontSize: "14px",
    fontWeight: "500",
  },
  paymentMethodContent: {
    marginTop: "15px",
    paddingTop: "15px",
    borderTop: "1px solid #e0e0e0",
    fontSize: "13px",
    color: "#666",
  },
  radio: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
  },
  bankInfo: {
    fontWeight: "500",
    marginBottom: "10px",
  },
  completeOrderButton: {
    width: "100%",
    padding: "15px",
    backgroundColor: "#000",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    marginTop: "20px",
    transition: "background-color 0.3s ease",
  },
  continueButton: {
    width: "100%",
    padding: "15px",
    backgroundColor: "#000",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    marginTop: "20px",
    transition: "background-color 0.3s ease",
  },
};

export default ShippingPage;