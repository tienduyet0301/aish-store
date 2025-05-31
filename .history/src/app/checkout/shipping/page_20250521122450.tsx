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

interface Province {
  code: string;
  name: string;
}

interface District {
  code: string;
  name: string;
  province_code: string;
}

interface Ward {
  code: string;
  name: string;
  district_code: string;
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

  // States for address selection
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState({
    provinces: false,
    districts: false,
    wards: false
  });

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

  // Load provinces
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoading(prev => ({ ...prev, provinces: true }));
      try {
        const response = await fetch('/api/provinces');
        if (!response.ok) throw new Error('Failed to fetch provinces');
        const data = await response.json();
        setProvinces(data);
      } catch (error) {
        console.error('Error fetching provinces:', error);
        toast.error('Có lỗi xảy ra khi tải danh sách tỉnh/thành phố');
      } finally {
        setLoading(prev => ({ ...prev, provinces: false }));
      }
    };

    fetchProvinces();
  }, []);

  // Load districts when province changes
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!selectedProvince) {
        setDistricts([]);
        return;
      }

      setLoading(prev => ({ ...prev, districts: true }));
      try {
        const response = await fetch(`/api/districts?province_code=${selectedProvince}`);
        if (!response.ok) throw new Error('Failed to fetch districts');
        const data = await response.json();
        setDistricts(data);
      } catch (error) {
        console.error('Error fetching districts:', error);
        toast.error('Có lỗi xảy ra khi tải danh sách quận/huyện');
      } finally {
        setLoading(prev => ({ ...prev, districts: false }));
      }
    };

    fetchDistricts();
  }, [selectedProvince]);

  // Load wards when district changes
  useEffect(() => {
    const fetchWards = async () => {
      if (!selectedDistrict) {
        setWards([]);
        return;
      }

      setLoading(prev => ({ ...prev, wards: true }));
      try {
        const response = await fetch(`/api/wards?district_code=${selectedDistrict}`);
        if (!response.ok) throw new Error('Failed to fetch wards');
        const data = await response.json();
        setWards(data);
      } catch (error) {
        console.error('Error fetching wards:', error);
        toast.error('Có lỗi xảy ra khi tải danh sách phường/xã');
      } finally {
        setLoading(prev => ({ ...prev, wards: false }));
      }
    };

    fetchWards();
  }, [selectedDistrict]);

  const handleCompleteOrder = async (e: React.FormEvent) => {
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

          {/* Address selection fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tỉnh/Thành phố</label>
              <select
                value={selectedProvince}
                onChange={(e) => {
                  const province = provinces.find(p => p.code === e.target.value);
                  setSelectedProvince(e.target.value);
                  setSelectedProvinceName(province?.name || '');
                  setSelectedDistrict('');
                  setSelectedDistrictName('');
                  setSelectedWard('');
                  setSelectedWardName('');
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                disabled={loading.provinces}
              >
                <option value="">Chọn tỉnh/thành phố</option>
                {provinces.map(province => (
                  <option key={province.code} value={province.code}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Quận/Huyện</label>
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  const district = districts.find(d => d.code === e.target.value);
                  setSelectedDistrict(e.target.value);
                  setSelectedDistrictName(district?.name || '');
                  setSelectedWard('');
                  setSelectedWardName('');
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                disabled={loading.districts || !selectedProvince}
              >
                <option value="">Chọn quận/huyện</option>
                {districts.map(district => (
                  <option key={district.code} value={district.code}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phường/Xã</label>
              <select
                value={selectedWard}
                onChange={(e) => {
                  const ward = wards.find(w => w.code === e.target.value);
                  setSelectedWard(e.target.value);
                  setSelectedWardName(ward?.name || '');
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                disabled={loading.wards || !selectedDistrict}
              >
                <option value="">Chọn phường/xã</option>
                {wards.map(ward => (
                  <option key={ward.code} value={ward.code}>
                    {ward.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Hoàn tất đơn hàng
          </button>
        </div>
      </form>

      {showConfirmationModal && orderDetails && (
        <OrderConfirmationModal
          orderDetails={orderDetails}
          onClose={() => setShowConfirmationModal(false)}
          onConfirm={async () => {
            try {
              const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderDetails),
              });

              if (!response.ok) {
                throw new Error('Failed to create order');
              }

              const data = await response.json();
              if (data.ok) {
                toast.success('Đặt hàng thành công!');
                router.push(`/order-success/${orderDetails.orderNumber}`);
              } else {
                throw new Error(data.message || 'Failed to create order');
              }
            } catch (error) {
              console.error('Error creating order:', error);
              toast.error('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
            }
          }}
        />
      )}
    </div>
  );
} 