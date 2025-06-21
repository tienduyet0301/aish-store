# Hệ thống Phí Vận chuyển AISH

## Tổng quan

Hệ thống phí vận chuyển đã được cập nhật để tính phí dựa trên địa chỉ giao hàng của khách hàng.

## Quy tắc tính phí

### Phí vận chuyển theo địa chỉ:

1. **Thành phố Hồ Chí Minh**: 22.000 VND
2. **Các tỉnh/thành phố khác**: 35.000 VND

### Cách xác định địa chỉ:

- Hệ thống sẽ kiểm tra trường **Province/City** trong form địa chỉ giao hàng
- Nếu địa chỉ chứa các từ khóa sau sẽ được tính phí 22.000 VND:
  - "Thành phố Hồ Chí Minh"
  - "TP. Hồ Chí Minh" 
  - "TP Hồ Chí Minh"
  - "Hồ Chí Minh"

## Các file đã được cập nhật

### 1. Utility Functions (`src/lib/utils.ts`)
- `calculateShippingFee(provinceName)`: Tính phí shipping dựa trên tên tỉnh/thành phố
- `formatShippingFee(fee)`: Format phí shipping để hiển thị

### 2. Context (`src/context/CheckoutContext.tsx`)
- Thêm quản lý state cho phí shipping
- Cung cấp functions để tính và format phí shipping

### 3. Shipping Page (`src/app/checkout/shipping/page.tsx`)
- Hiển thị phí shipping real-time khi khách hàng chọn địa chỉ
- Cập nhật tổng tiền bao gồm phí shipping
- Hiển thị thông tin phí shipping trong payment section

### 4. API Orders (`src/app/api/orders/route.ts`)
- Lưu thông tin phí shipping vào database
- Xử lý phí shipping trong quá trình tạo đơn hàng

### 5. Components khác
- **CartDropdown**: Hiển thị thông báo "Shipping fee will be calculated at checkout"
- **OrderConfirmationModal**: Hiển thị phí shipping trong modal xác nhận
- **My Orders**: Hiển thị phí shipping trong danh sách đơn hàng
- **Cart Page**: Cập nhật hiển thị phí shipping
- **Checkout Summary**: Cập nhật hiển thị phí shipping

## Cách hoạt động

1. **Trong Cart**: Hiển thị "Shipping fee will be calculated at checkout"
2. **Trong Checkout**: 
   - Khi khách hàng chọn Province/City, phí shipping sẽ được tính tự động
   - Hiển thị phí shipping trong payment section
   - Tổng tiền được cập nhật bao gồm phí shipping
3. **Trong Order Confirmation**: Hiển thị phí shipping đã tính
4. **Trong My Orders**: Hiển thị phí shipping của từng đơn hàng

## Database Schema

Trường `shippingFee` trong collection `orders` sẽ lưu:
- String format: "22.000 VND" hoặc "35.000 VND"
- Hoặc "Free (Express)" cho trường hợp đặc biệt

## Testing

Để test hệ thống:
1. Thêm sản phẩm vào giỏ hàng
2. Vào checkout
3. Chọn địa chỉ khác nhau để xem phí shipping thay đổi
4. Kiểm tra hiển thị trong các bước khác nhau

## Lưu ý

- Phí shipping được tính dựa trên Province/City, không phụ thuộc vào District/Ward
- Hệ thống sử dụng case-insensitive matching để xác định HCMC
- Phí shipping được tính real-time và cập nhật tổng tiền ngay lập tức 