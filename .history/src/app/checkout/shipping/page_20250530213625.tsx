'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useVietnameseAddress } from "../../../hooks/useVietnameseAddress";
import OrderConfirmationModal from "../../../components/OrderConfirmationModal";
import { useCart } from "../../../context/CartContext";
import { useSession } from "next-auth/react";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  items: OrderItem[];
  promoCode?: string;
  promoAmount?: number;
}

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  additionalPhone: string;
  apartment: string;
  fullName?: string;
  province?: string;
  district?: string;
  ward?: string;
  address?: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  province?: string;
  district?: string;
  ward?: string;
  address?: string;
}

interface ShippingPageProps {
  params: {};
  searchParams: { [key: string]: string | string[] | undefined };
}

interface Province {
  code: string;
  name: string;
}

interface District {
  code: string;
  name: string;
}

interface Ward {
  code: string;
  name: string;
}

interface OrderData {
  orderCode: string;
  fullName: string;
  email: string;
  phone: string;
  additionalPhone: string | null;
  apartment: string | null;
  ward: string;
  district: string;
  province: string;
  items: OrderItem[];
  shippingStatus: string;
  [key: string]: any;
}

interface AddressData {
  provinces: Province[];
  districts: District[];
  wards: Ward[];
  selectedProvince: string;
  selectedDistrict: string;
  selectedWard: string;
  selectedProvinceName: string;
  selectedDistrictName: string;
  selectedWardName: string;
  handleProvinceChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleDistrictChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleWardChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function ShippingPage({
  params,
  searchParams,
}: ShippingPageProps) {
  const { data: session } = useSession();
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phone: '',
    additionalPhone: '',
    apartment: '',
  });
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('cod');
  const [showPaymentSection, setShowPaymentSection] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");
  const [order, setOrder] = useState<Order>({ items: [], promoCode: undefined, promoAmount: 0 });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showAdditionalContact, setShowAdditionalContact] = useState(false);

  const { cartItems } = useCart();

  const calculateTotal = (): number => {
    const subtotal = order.items.reduce((total, item) => {
      const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
      return total + (price * item.quantity);
    }, 0);
    return subtotal - (order.promoAmount || 0);
  };

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
    handleWardChange,
  } = useVietnameseAddress() as AddressData;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'guestEmail') {
      setGuestEmail(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    // Thêm validation cho form shipping
    const shippingForm = document.getElementById('shippingForm') as HTMLFormElement;
    if (shippingForm?.checkValidity()) {
      setShowPaymentSection(true);
      // Scroll to payment section
      const paymentSection = document.getElementById('paymentSection');
      if (paymentSection) {
        paymentSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      shippingForm?.reportValidity();
    }
  };

  const handlePlaceOrder = async () => {
    try {
      // Validate required fields
      const requiredFields = ['firstName', 'lastName', 'phone'];
      const missingFields = requiredFields.filter(field => !formData[field as keyof FormData]);
      
      // Get email from either session (if logged in) or guestEmail
      const emailToUse = session?.user?.email || guestEmail;
      
      if (missingFields.length > 0) {
        alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }

      if (!emailToUse) {
        alert("Please provide your email address.");
        return;
      }

      // Kiểm tra xem đã chọn đủ thông tin địa chỉ chưa
      if (!selectedProvince || !selectedDistrict || !selectedWard) {
        alert("Please select complete address information");
        return;
      }

      // Get promo code info from localStorage
      const savedPromoAmount = localStorage.getItem('promoAmount');
      const savedPromoCode = localStorage.getItem('appliedPromoCode');
      
      // Tạo mã đơn hàng
      const now = new Date();
      const orderCode = `AISH${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

      const subtotal = cartItems.reduce((total: number, item: OrderItem) => {
        const price = typeof item.price === 'string' ? parseFloat(item.price.replace('AU$', '').trim()) : item.price;
        return total + (price * item.quantity);
      }, 0);

      const promoAmount = savedPromoAmount ? parseFloat(savedPromoAmount) : 0;

      const details: OrderData = {
        orderCode: orderCode,
        fullName: `${formData.firstName} ${formData.lastName}`,
        email: emailToUse,
        phone: formData.phone,
        additionalPhone: formData.additionalPhone || null,
        apartment: formData.apartment || null,
        address: `${formData.apartment ? formData.apartment + ', ' : ''}${selectedWardName}, ${selectedDistrictName}, ${selectedProvinceName}`,
        ward: selectedWardName,
        district: selectedDistrictName,
        province: selectedProvinceName,
        items: cartItems.map((item: OrderItem) => ({
          ...item,
          price: typeof item.price === 'string' ? parseFloat(item.price.replace('AU$', '').trim()) : item.price
        })),
        shippingStatus: 'pending',
        paymentMethod: paymentMethod,
        subtotal: subtotal,
        promoCode: savedPromoCode || undefined,
        promoAmount: promoAmount,
        total: subtotal - promoAmount,
      };

      setOrderData(details);
      setShowConfirmationModal(true);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('There was an error placing your order. Please try again.');
    }
  };

  const handlePaymentMethodChange = (method: string) => {
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
    <div className="max-w-4xl mx-auto p-4">
      <div style={{ 
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '1rem',
        color: '#333',
      }}>
        <div style={styles.leftSection}>
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>CONTACT INFORMATION</h2>
            <p style={styles.sectionText}>
              {session?.user?.email ? (
                <>
                  {session.user.email} (<Link href="/logout" style={styles.link}>Đăng xuất</Link>)
                </>
              ) : (
                "Bạn chưa đăng nhập"
              )}
            </p>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>SHIPPING ADDRESS</h2>
            <form id="shippingForm" style={styles.form}>
              {!session?.user?.email && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email *</label>
                  <input
                    type="email"
                    name="guestEmail"
                    value={guestEmail}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              )}
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>First Name *</label>
                  <input
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    style={{ ...styles.input, borderColor: errors?.firstName ? "red" : "#e0e0e0" }}
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
                    style={{ ...styles.input, borderColor: errors?.lastName ? "red" : "#e0e0e0" }}
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
                    style={{ ...styles.input, borderColor: errors?.province ? "red" : "#e0e0e0" }}
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
                    style={{ ...styles.input, borderColor: errors?.district ? "red" : "#e0e0e0" }}
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
                    style={{ ...styles.input, borderColor: errors?.ward ? "red" : "#e0e0e0" }}
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
                    style={{ ...styles.input, borderColor: errors?.phone ? "red" : "#e0e0e0" }}
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
                  onClick={handlePlaceOrder}
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
        </div>

        <OrderConfirmationModal
          isOpen={showConfirmationModal}
          onClose={() => setShowConfirmationModal(false)}
          orderDetails={orderData}
        />
      </div>
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
    flexDirection: "column" as const,
    gap: "15px",
    color: "#000000",
  },
  formRow: {
    display: "flex",
    flexDirection: "row" as const,
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
    flexDirection: "column" as const,
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