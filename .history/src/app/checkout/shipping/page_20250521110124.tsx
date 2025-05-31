"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useVietnameseAddress } from "@/hooks/useVietnameseAddress";
import OrderConfirmationModal from "@/components/OrderConfirmationModal";

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
    const email = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
    if (email) {
      setLocalUserEmail(email);
    }
  }, []);

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
    const shippingForm = document.getElementById('shippingForm');
    if (shippingForm.checkValidity()) {
      setShowPaymentSection(true);
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
      if (!selectedProvince || !selectedDistrict || !selectedWard) {
        toast.error("Vui lòng chọn đầy đủ thông tin địa chỉ");
        return;
      }

      if (!formData.firstName || !formData.lastName || !formData.phone) {
        toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
        return;
      }

      const now = new Date();
      const orderCode = `AISH${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

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

      setOrderDetails(details);
      setShowConfirmationModal(true);
    } catch (error) {
      console.error("Error preparing order:", error);
      toast.error("Có lỗi xảy ra khi chuẩn bị đơn hàng. Vui lòng thử lại.");
    }
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const renderPaymentInfo = () => {
    if (!paymentMethod) return null;

    if (paymentMethod === 'cod') {
      return (
        <div className="mt-5 p-4 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600 italic">
            Quý khách ghi nhớ mã đơn hàng và nhắn tin cho Facebook hoặc Instagram aish.aish.vn nếu muốn tra cứu mã vận đơn nhé
          </p>
        </div>
      );
    }

    if (paymentMethod === 'bank') {
      return (
        <div className="mt-5 p-4 bg-gray-50 rounded-md">
          <h3 className="text-sm font-semibold mb-3">
            Thông tin chuyển khoản
          </h3>
          <div className="text-sm space-y-2">
            <p>Ngân hàng: MB BANK</p>
            <p>Chủ tài khoản: PHAN THUY TRUC DAO</p>
            <p>Số tài khoản: 024052306</p>
            <p>Nội dung chuyển khoản: MÃ ĐƠN HÀNG + SĐT</p>
            <p className="mt-4 text-gray-600 italic">
              Sau khi đặt hàng thành công, quý khách sẽ thấy mã đơn hàng tại trang. Quý khách vui lòng chuyển khoản đúng nội dung và chụp màn hình gửi về Facebook hoặc Instagram aish.aish.vn nhaa
            </p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex-1 bg-white p-6 border border-gray-200">
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">THÔNG TIN LIÊN HỆ</h2>
        <p className="text-sm">
          {userEmail ? (
            <>
              {userEmail} (<Link href="/logout" className="underline hover:text-gray-600">Đăng xuất</Link>)
            </>
          ) : (
            "Bạn chưa đăng nhập"
          )}
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">ĐỊA CHỈ GIAO HÀNG</h2>
        <form id="shippingForm" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Tên *</label>
              <input
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Họ *</label>
              <input
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Số nhà, tên đường (tùy chọn)</label>
            <input
              name="apartment"
              type="text"
              value={formData.apartment}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Tỉnh/Thành phố *</label>
              <select
                value={selectedProvince}
                onChange={handleProvinceChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.province ? 'border-red-500' : 'border-gray-300'}`}
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
            <div>
              <label className="block text-sm mb-1">Quận/Huyện *</label>
              <select
                value={selectedDistrict}
                onChange={handleDistrictChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.district ? 'border-red-500' : 'border-gray-300'}`}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Phường/Xã *</label>
              <select
                value={selectedWard}
                onChange={handleWardChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.ward ? 'border-red-500' : 'border-gray-300'}`}
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
            <div>
              <label className="block text-sm mb-1">Số điện thoại *</label>
              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
            </div>
          </div>

          {showAdditionalContact && (
            <div>
              <label className="block text-sm mb-1">Số điện thoại phụ (tùy chọn)</label>
              <input
                name="additionalPhone"
                type="tel"
                value={formData.additionalPhone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          )}

          <input type="hidden" name="ward" value={selectedWardName} />
          <input type="hidden" name="district" value={selectedDistrictName} />
          <input type="hidden" name="province" value={selectedProvinceName} />

          <button
            onClick={handleContinueToPayment}
            className="w-full bg-black text-white py-3 px-4 rounded-md hover:bg-gray-800 transition-colors uppercase text-sm font-medium"
            type="submit"
          >
            Tiếp tục thanh toán
          </button>
        </form>
      </div>

      {showPaymentSection && (
        <div id="paymentSection" className="mb-8">
          <h2 className="text-lg font-semibold mb-3">PHƯƠNG THỨC THANH TOÁN</h2>
          <div className="space-y-4">
            <div
              className={`p-4 border rounded-md cursor-pointer transition-colors ${
                paymentMethod === "cod" ? "border-black" : "border-gray-300"
              }`}
              onClick={() => handlePaymentMethodChange("cod")}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "cod"}
                  onChange={() => handlePaymentMethodChange("cod")}
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium">
                  Thanh toán khi nhận hàng (COD)
                </label>
              </div>
            </div>

            <div
              className={`p-4 border rounded-md cursor-pointer transition-colors ${
                paymentMethod === "bank" ? "border-black" : "border-gray-300"
              }`}
              onClick={() => handlePaymentMethodChange("bank")}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "bank"}
                  onChange={() => handlePaymentMethodChange("bank")}
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium">
                  Chuyển khoản ngân hàng
                </label>
              </div>
            </div>
          </div>

          {renderPaymentInfo()}

          {paymentMethod && (
            <button
              onClick={handleCompleteOrder}
              className="w-full bg-black text-white py-3 px-4 rounded-md hover:bg-gray-800 transition-colors uppercase text-sm font-medium mt-6"
            >
              Hoàn tất đơn hàng
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