import ShippingPageComponent from './ShippingPageComponent';

export default function Page({ params, searchParams }) {
  // TODO: Lấy dữ liệu order, userEmail, errors... từ context, localStorage, hoặc API nếu cần
  // Ví dụ đơn giản:
  let order = { items: [], promoCode: null, promoAmount: 0 };
  let userEmail = '';
  let errors = {};

  // Nếu bạn có logic lấy dữ liệu thực tế, hãy thay thế các biến trên

  return (
    <ShippingPageComponent
      order={order}
      userEmail={userEmail}
      errors={errors}
      // Truyền các props khác nếu cần
    />
  );
}