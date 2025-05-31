"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useVietnameseAddress } from "../../../hooks/useVietnameseAddress";
import OrderConfirmationModal from "../../../components/OrderConfirmationModal";

export default function ShippingPage() {
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

  // Sử dụng email từ localStorage
  const userEmail = localUserEmail;

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

      // Lấy thông tin giỏ hàng từ localStorage
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const promoCode = localStorage.getItem('promoCode');
      const promoAmount = parseFloat(localStorage.getItem('promoAmount') || '0');

      // Tính toán lại tổng tiền
      const subtotal = cartItems.reduce((total, item) => {
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
        items: cartItems.map(item => ({
          ...item,
          price: typeof item.price === 'string' ? parseFloat(item.price.replace('AU$', '').trim()) : item.price
        })),
        subtotal: subtotal,
        shippingFee: "Free",
        promoCode: promoCode || null,
        promoAmount: promoAmount || 0,
        total: subtotal - (promoAmount || 0),
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
            fontSize: "1.1em",
            marginBottom: "10px"
          }}>
            Thông tin chuyển khoản
          </h3>
          <p style={{
            fontSize: "0.9em",
            marginBottom: "5px"
          }}>
            Ngân hàng: Vietcombank
          </p>
          <p style={{
            fontSize: "0.9em",
            marginBottom: "5px"
          }}>
            Số tài khoản: 1234567890
          </p>
          <p style={{
            fontSize: "0.9em",
            marginBottom: "5px"
          }}>
            Chủ tài khoản: AISH STORE
          </p>
          <p style={{
            fontSize: "0.9em",
            color: "#666",
            fontStyle: "italic"
          }}>
            Vui lòng chuyển khoản đúng số tiền và ghi nội dung chuyển khoản là mã đơn hàng
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Shipping Information</h1>
      
      <form id="shippingForm" onSubmit={handleContinueToPayment}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={userEmail}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Phone Number
          </label>
          <input
            type="tel"
            name="additionalPhone"
            value={formData.additionalPhone}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Apartment, suite, etc.
          </label>
          <input
            type="text"
            name="apartment"
            value={formData.apartment}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Province *
          </label>
          <select
            value={selectedProvince}
            onChange={handleProvinceChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Province</option>
            {provinces.map((province) => (
              <option key={province.code} value={province.code}>
                {province.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            District *
          </label>
          <select
            value={selectedDistrict}
            onChange={handleDistrictChange}
            required
            disabled={!selectedProvince}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select District</option>
            {districts.map((district) => (
              <option key={district.code} value={district.code}>
                {district.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ward *
          </label>
          <select
            value={selectedWard}
            onChange={handleWardChange}
            required
            disabled={!selectedDistrict}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Ward</option>
            {wards.map((ward) => (
              <option key={ward.code} value={ward.code}>
                {ward.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Continue to Payment
          </button>
        </div>
      </form>

      {showPaymentSection && (
        <div id="paymentSection" className="mt-8">
          <h2 className="text-xl font-bold mb-4">Payment Method</h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="radio"
                id="cod"
                name="paymentMethod"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={() => handlePaymentMethodChange('cod')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="cod" className="ml-2 block text-sm font-medium text-gray-700">
                Cash on Delivery (COD)
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="radio"
                id="bank"
                name="paymentMethod"
                value="bank"
                checked={paymentMethod === 'bank'}
                onChange={() => handlePaymentMethodChange('bank')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="bank" className="ml-2 block text-sm font-medium text-gray-700">
                Bank Transfer
              </label>
            </div>
          </div>

          {renderPaymentInfo()}

          <div className="mt-6">
            <button
              onClick={handleCompleteOrder}
              disabled={!paymentMethod}
              className={`px-6 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                paymentMethod
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Complete Order
            </button>
          </div>
        </div>
      )}

      {showConfirmationModal && orderDetails && (
        <OrderConfirmationModal
          orderDetails={orderDetails}
          onClose={() => setShowConfirmationModal(false)}
        />
      )}
    </div>
  );
}