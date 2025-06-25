'use client';
import ChatBot from 'react-simple-chatbot';
import { useEffect } from 'react';

const steps = [
  {
    id: '1',
    message: 'Xin chào! Bạn cần hỗ trợ gì?',
    trigger: 'menu',
  },
  {
    id: 'menu',
    options: [
      { value: 'size', label: 'Tư vấn size', trigger: 'size-ask' },
      { value: 'product', label: 'Tư vấn sản phẩm', trigger: 'product-ask' },
      { value: 'order', label: 'Hướng dẫn đặt hàng', trigger: 'order-guide' },
      { value: 'discount', label: 'Hướng dẫn mã giảm giá', trigger: 'discount-guide' },
    ],
  },
  // Tư vấn size
  {
    id: 'size-ask',
    message: 'Bạn vui lòng cho biết chiều cao (cm) và cân nặng (kg)?',
    trigger: 'size-answer',
  },
  {
    id: 'size-answer',
    user: true,
    trigger: 'size-result',
  },
  {
    id: 'size-result',
    message: 'Dựa trên số đo bạn cung cấp, size phù hợp là M (ví dụ).',
    end: true,
  },
  // Tư vấn sản phẩm
  {
    id: 'product-ask',
    message: 'Bạn thích phong cách nào? (ví dụ: năng động, thanh lịch, đơn giản...)',
    trigger: 'product-style',
  },
  {
    id: 'product-style',
    user: true,
    trigger: 'product-suggestion',
  },
  {
    id: 'product-suggestion',
    message: 'Bạn có thể tham khảo các sản phẩm áo thun, quần jeans phù hợp với phong cách bạn chọn!',
    end: true,
  },
  // Hướng dẫn đặt hàng
  {
    id: 'order-guide',
    message: 'Các bước đặt hàng: 1. Chọn sản phẩm 2. Thêm vào giỏ hàng 3. Nhấn "Thanh toán" 4. Nhập thông tin và hoàn tất đơn hàng.',
    end: true,
  },
  // Hướng dẫn mã giảm giá
  {
    id: 'discount-guide',
    message: 'Bạn nhập mã giảm giá ở bước thanh toán, tại ô "Mã giảm giá" rồi nhấn Áp dụng.',
    end: true,
  },
];

// Floating icon: Biểu tượng chat bong bóng màu đen, không viền tím
function ChatBubbleIcon() {
  return (
    <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 20v-2a2 2 0 0 1 2-2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" fill="#111"/>
        <circle cx="9" cy="10" r="1" fill="#fff"/>
        <circle cx="12" cy="10" r="1" fill="#fff"/>
        <circle cx="15" cy="10" r="1" fill="#fff"/>
      </svg>
    </div>
  );
}

// Bot avatar: Chữ A màu đen trên nền trắng
function AishBotAvatar() {
  return (
    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #eee' }}>
      <span style={{ fontWeight: 'bold', fontSize: 20, color: '#111', fontFamily: 'Inter, Arial, sans-serif' }}>A</span>
    </div>
  );
}

// Inject custom CSS để override màu tím
function ChatBotStyleOverride() {
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .rsc-float-button {
        box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
        border: none !important;
        background: #fff !important;
      }
      .rsc-header {
        background: #111 !important;
        color: #fff !important;
        border-radius: 16px 16px 0 0 !important;
      }
      .rsc-header-title {
        color: #fff !important;
      }
      .rsc-ts-bubble {
        background: #111 !important;
        color: #fff !important;
      }
      .rsc-os-option {
        border: 1px solid #111 !important;
        background: #fff !important;
        color: #111 !important;
      }
      .rsc-os-option:active, .rsc-os-option:focus {
        background: #111 !important;
        color: #fff !important;
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);
  return null;
}

export default function MyChatBot() {
  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
      <ChatBotStyleOverride />
      <ChatBot
        steps={steps}
        floating={true}
        headerTitle="Hỗ trợ khách hàng"
        floatingIcon={<ChatBubbleIcon />}
        botAvatar={<AishBotAvatar />}
        style={{ fontFamily: 'Inter, Arial, sans-serif', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.12)', fontSize: 13, background: '#fff' }}
        contentStyle={{ background: '#fff', borderRadius: 16, fontSize: 13 }}
        bubbleStyle={{ background: '#111', color: '#fff', fontSize: 13 }}
        bubbleOptionStyle={{ background: '#fff', color: '#111', fontWeight: 500, fontSize: 13, border: '1px solid #111' }}
        userAvatar={null}
        userDelay={0}
        userFontColor="#111"
        userBubbleStyle={{ background: '#fff', color: '#111', fontSize: 13, border: '1px solid #111' }}
      />
    </div>
  );
} 