import { useState } from 'react';
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

export default function ShippingPage() {
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