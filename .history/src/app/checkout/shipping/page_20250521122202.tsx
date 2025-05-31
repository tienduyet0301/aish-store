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

    const subtotal = order.items.reduce((total, item) => {
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