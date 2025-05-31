'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  additionalPhone?: string;
  apartment?: string;
}

interface OrderItem {
  id: string;
  name: string;
  price: string | number;
  quantity: number;
}

interface Order {
  items: OrderItem[];
  promoCode?: string;
  promoAmount?: number;
}

interface OrderDetails {
  orderNumber: string;
  fullName: string;
  email: string;
  phone: string;
  additionalPhone: string | null;
  apartment: string | null;
  ward: string;
  district: string;
  province: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: string;
  promoCode: string | null;
  promoAmount: number;
  total: number;
  paymentMethod: string;
  status: string;
  paymentStatus: string;
  shippingStatus: string;
}

interface OrderConfirmationModalProps {
  orderDetails: OrderDetails;
  onClose: () => void;
  onConfirm: () => void;
}

const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({ orderDetails, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Xác nhận đơn hàng</h2>
        <div className="space-y-2">
          <p><strong>Mã đơn hàng:</strong> {orderDetails.orderNumber}</p>
          <p><strong>Họ tên:</strong> {orderDetails.fullName}</p>
          <p><strong>Số điện thoại:</strong> {orderDetails.phone}</p>
          <p><strong>Địa chỉ:</strong> {orderDetails.apartment}, {orderDetails.ward}, {orderDetails.district}, {orderDetails.province}</p>
          <p><strong>Tổng tiền:</strong> AU${orderDetails.total}</p>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Page() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phone: '',
    additionalPhone: '',
    apartment: ''
  });
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedWard, setSelectedWard] = useState<string>('');
  const [selectedProvinceName, setSelectedProvinceName] = useState<string>('');
  const [selectedDistrictName, setSelectedDistrictName] = useState<string>('');
  const [selectedWardName, setSelectedWardName] = useState<string>('');
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('cod');
  const [userEmail, setUserEmail] = useState<string>('');
  const [order, setOrder] = useState<Order>({
    items: [],
    promoCode: undefined,
    promoAmount: undefined
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load order data from localStorage
  useEffect(() => {
    const loadOrderData = () => {
      try {
        const savedOrder = localStorage.getItem('order');
        const savedUserEmail = localStorage.getItem('userEmail');
        
        if (savedOrder) {
          setOrder(JSON.parse(savedOrder));
        }
        if (savedUserEmail) {
          setUserEmail(savedUserEmail);
        }
      } catch (error) {
        console.error('Error loading order data:', error);
        toast.error('Có lỗi xảy ra khi tải dữ liệu đơn hàng');
      }
    };

    loadOrderData();
  }, []);

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName) {
      toast.error('Vui lòng nhập họ và tên');
      return false;
    }

    if (!formData.phone) {
      toast.error('Vui lòng nhập số điện thoại');
      return false;
    }

    // Validate phone number format
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error('Số điện thoại không hợp lệ');
      return false;
    }

    if (formData.additionalPhone && !phoneRegex.test(formData.additionalPhone)) {
      toast.error('Số điện thoại phụ không hợp lệ');
      return false;
    }

    if (!formData.apartment) {
      toast.error('Vui lòng nhập địa chỉ');
      return false;
    }

    if (!selectedProvince || !selectedDistrict || !selectedWard) {
      toast.error('Vui lòng chọn đầy đủ thông tin địa chỉ');
      return false;
    }

    if (!order.items || order.items.length === 0) {
      toast.error('Giỏ hàng trống');
      return false;
    }

    return true;
  };

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const now = new Date();
      const orderNumber = `AISH${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

      const subtotal = order.items.reduce((total: number, item: OrderItem) => {
        const priceStr = typeof item.price === 'string' ? item.price.replace('AU$', '').trim() : item.price;
        const price = parseFloat(priceStr.toString()) || 0;
        return total + (price * item.quantity);
      }, 0);

      const details: OrderDetails = {
        orderNumber: orderNumber,
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Form nhập thông tin */}
      <form onSubmit={handleCompleteOrder} className="max-w-2xl mx-auto p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Họ</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tên</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Số điện thoại phụ (không bắt buộc)</label>
            <input
              type="tel"
              value={formData.additionalPhone}
              onChange={(e) => setFormData({...formData, additionalPhone: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Số nhà, tên đường</label>
            <input
              type="text"
              value={formData.apartment}
              onChange={(e) => setFormData({...formData, apartment: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          {/* Thêm các trường chọn tỉnh/thành phố, quận/huyện, phường/xã ở đây */}
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Phương thức thanh toán</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="cod">Thanh toán khi nhận hàng (COD)</option>
              <option value="bank">Chuyển khoản ngân hàng</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Đang xử lý...' : 'Hoàn tất đơn hàng'}
          </button>
        </div>
      </form>

      {showConfirmationModal && orderDetails && (
        <OrderConfirmationModal
          orderDetails={orderDetails}
          onClose={() => setShowConfirmationModal(false)}
          onConfirm={async () => {
            try {
              setIsSubmitting(true);
              const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderDetails),
              });

              const data = await response.json();

              if (!response.ok) {
                throw new Error(data.error || 'Failed to create order');
              }

              if (data.ok) {
                // Clear cart and order data from localStorage
                localStorage.removeItem('order');
                localStorage.removeItem('cart');
                
                toast.success('Đặt hàng thành công!');
                router.push(`/order-success/${orderDetails.orderNumber}`);
              } else {
                throw new Error(data.message || 'Failed to create order');
              }
            } catch (error: any) {
              console.error('Error creating order:', error);
              toast.error(error.message || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
            } finally {
              setIsSubmitting(false);
            }
          }}
        />
      )}
    </div>
  );
} 