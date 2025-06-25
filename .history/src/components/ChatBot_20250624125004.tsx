'use client';
import ChatBot from 'react-simple-chatbot';
import { useEffect, useState } from 'react';

const steps = [
  {
    id: '1',
    message: 'Xin chào! Bạn cần AISH hỗ trợ gì nèe?',
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
    message: 'Cậu vui lòng cho tớ biết chiều cao (cm) và cân nặng (kg) để tớ tư vấn chính xác hơn nhá?',
    trigger: 'size-answer',
  },
  {
    id: 'size-answer',
    user: true,
    trigger: 'size-result',
  },
  {
    id: 'size-result',
    message: ({ previousValue }: { previousValue: any }) => {
      const numbers = typeof previousValue === 'string' ? previousValue.match(/\d+/g) : null;
      if (!numbers || numbers.length < 2) {
        return 'Tớ chưa nhận diện được chiều cao và cân nặng, cậu nhập lại giúp tớ nhé!';
      }
      const height = parseInt(numbers[0], 10);
      const weight = parseInt(numbers[1], 10);
      let sizeShirtPant = '';
      let sizeJacket = '';
      // Quy tắc mới cho Áo Thun + Sơ mi + Quần
      if (height <= 165 && weight <= 55) {
        sizeShirtPant = 'M (Dưới 1m65 55kg)';
      } else if (height <= 175 && weight <= 65) {
        sizeShirtPant = 'L (Dưới 1m75 65kg)';
      } else if (height <= 185 && weight <= 70) {
        sizeShirtPant = 'XL (Dưới 1m85 70kg)';
      } else {
        sizeShirtPant = 'XL (Dưới 1m85 70kg)';
      }
      // Quy tắc mới cho Áo Khoác
      if (height <= 160 && weight <= 50) {
        sizeJacket = 'M (Dưới 1m60 50kg)';
      } else if (height <= 170 && weight <= 60) {
        sizeJacket = 'L (Dưới 1m70 60kg)';
      } else if (height <= 175 && weight <= 65) {
        sizeJacket = 'XL (Dưới 1m75 65kg)';
      } else {
        sizeJacket = 'XL (Dưới 1m75 65kg)';
      }
      let resultMsg = `Dựa trên số đo cậu cung cấp:\n`;
      resultMsg += `- Áo thun, sơ mi, quần: size phù hợp là: ${sizeShirtPant}\n`;
      resultMsg += `- Áo khoác: size phù hợp là: ${sizeJacket}\n`;
      resultMsg += `Nếu cậu thích mặc rộng rãi, có thể chọn size lớn hơn một chút nhé!\nNếu cần tư vấn thêm về chất liệu hoặc form dáng, hãy nhắn cho AISH nhé!`;
      return resultMsg;
    },
    end: true,
  },
  // Tư vấn sản phẩm
  {
    id: 'product-ask',
    message: 'Cậu thích phong cách nào? (ví dụ: năng động, thanh lịch, đơn giản...)',
    trigger: 'product-style',
  },
  {
    id: 'product-style',
    user: true,
    trigger: 'product-suggestion',
  },
  {
    id: 'product-suggestion',
    message: 'Cảm ơn cậu đã cung cấp thông tin nhá!\nVới phong cách [phong cách khách nhập], AISH gợi ý cậu tham khảo các sản phẩm sau nha, khá phù hợp với phong cách của cậu đó:\n- [Tên sản phẩm]\n- [Tên sản phẩm]\n- [Tên sản phẩm]\nCậu có thể xem chi tiết tại mục Sản phẩm hoặc nhắn cho AISH để được gửi link trực tiếp nháaa',
    end: true,
  },
  // Hướng dẫn đặt hàng
  {
    id: 'order-guide',
    message: 'Để đặt hàng tại AISH,  cậu làm theo các bước sau nháa:\nĐầu tiên cậu chọn sản phẩm cậu yêu thích và chọn size phù hợp với cậu nè\nSau đó cậu nhấn \'Thêm vào giỏ hàng\' nhá\nTiếp theo cậu vào giỏ hàng và nhấn \'Thanh toán\'\nNhập đầy đủ thông tin giao hàng, chọn phương thức thanh toán\nKiểm tra lại đơn hàng xem đúng ý cậu chưa và nhấn \'Hoàn tất đặt hàng\' thế là xong rồiiii\nNếu gặp khó khăn ở bất kỳ bước nào, hãy nhắn cho AISH để được hỗ trợ ngay nha!',
    end: true,
  },
  // Hướng dẫn mã giảm giá
  {
    id: 'discount-guide',
    message: 'Cậu có thể sử dụng mã giảm giá khi thanh toán như sau:\nỞ trang thanh toán, cậu tìm ô \'Mã giảm giá\'\nNhập mã bạn có hoặc chọn voucher đang có sẵn và nhấn \'Áp dụng\' nhá\nHệ thống sẽ tự động trừ số tiền giảm vào tổng đơn hàng nè\nLưu ý: Mỗi đơn hàng chỉ áp dụng 1 mã giảm giá. Nếu mã không hợp lệ, hãy kiểm tra lại điều kiện sử dụng hoặc liên hệ AISH để được hỗ trợ sớm nhất nhaa!',
    end: true,
  },
];

// Floating icon: Biểu tượng chat bong bóng màu đen, hình tròn
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

// Bot avatar: Chữ A màu đen trên nền trắng, hình tròn
function AishBotAvatar() {
  return (
    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #eee' }}>
      <span style={{ fontWeight: 'bold', fontSize: 12, color: '#111', fontFamily: 'Inter, Arial, sans-serif' }}>A</span>
    </div>
  );
}

// Inject custom CSS để chỉnh spacing, font size, và tắt hiệu ứng zoom option
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
        border-radius: 0 !important;
      }
      .rsc-header-title {
        color: #fff !important;
        font-size: 14px !important;
      }
      .rsc-ts-bubble, .rsc-ts-bubble span, .rsc-ts-bubble p {
        background: #111 !important;
        color: #fff !important;
        border-radius: 0 !important;
        font-size: 12px !important;
        line-height: 1.5 !important;
        margin-left: 0 !important;
        margin-right: 0 !important;
        padding: 7px 12px !important;
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
        display: block !important;
        white-space: pre-line !important;
      }
      .rsc-os-option,
      .rsc-os-option:active,
      .rsc-os-option:focus,
      .rsc-os-option:focus-visible,
      .rsc-os-option[aria-selected="true"],
      .rsc-os-option:hover {
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
        background: #fff !important;
        color: #111 !important;
      }
      .rsc-content {
        border-radius: 0 !important;
      }
      .rsc-container {
        border-radius: 0 !important;
      }
      .rsc-input {
        border-radius: 0 !important;
        font-size: 12px !important;
      }
      .rsc-avatar {
        border-radius: 50% !important;
        margin-right: 4px !important;
        width: 24px !important;
        height: 24px !important;
      }
      .rsc-ts-bubble, .rsc-ts-bubble span, .rsc-ts-bubble p, .rsc-os-option, .rsc-user-bubble {
        font-size: 12px !important;
      }
      .rsc-user-bubble {
        background: #fff !important;
        color: #111 !important;
        border: 1px solid #111 !important;
        border-radius: 0 !important;
        font-size: 12px !important;
        margin-left: 4px !important;
        padding: 7px 12px !important;
        white-space: pre-line !important;
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);
  return null;
}

function getSizeForShirtPant(height: number, weight: number): string {
  if (height < 160 || weight < 50) return 'M';
  if (height < 165 && weight <= 55) return 'M';
  if (height < 175 && weight <= 65) return 'L';
  if (height < 185 && weight <= 70) return 'XL';
  return 'XL';
}

function getSizeForJacket(height: number, weight: number): string {
  if (height < 160 && weight <= 50) return 'M';
  if (height < 170 && weight <= 60) return 'L';
  if (height < 175 && weight <= 65) return 'XL';
  return 'XL';
}

function parseUserInput(input: string): { height: number; weight: number } | null {
  const numbers = input.match(/\d+/g);
  if (!numbers || numbers.length < 2) return null;
  const height = parseInt(numbers[0], 10);
  const weight = parseInt(numbers[1], 10);
  return { height, weight };
}

export default function MyChatBot() {
  const [sizeResult, setSizeResult] = useState<string>('');
  const [stepsWithDynamicSize, setStepsWithDynamicSize] = useState<any[]>(steps);

  // Hàm xử lý khi user nhập thông số size
  function handleSizeInput({ value, steps: prevSteps }: { value: string; steps: any }): void {
    const parsed = parseUserInput(value);
    if (!parsed) {
      setSizeResult('Tớ chưa nhận diện được chiều cao và cân nặng, cậu nhập lại giúp tớ nhé!');
      return;
    }
    const { height, weight } = parsed;
    const sizeShirtPant = getSizeForShirtPant(height, weight);
    const sizeJacket = getSizeForJacket(height, weight);
    let resultMsg = `Dựa trên số đo cậu cung cấp:\n`;
    resultMsg += `- Áo thun, sơ mi, quần: size phù hợp là: ${sizeShirtPant}\n`;
    resultMsg += `- Áo khoác: size phù hợp là: ${sizeJacket}\n`;
    resultMsg += `Nếu cậu thích mặc rộng rãi, có thể chọn size lớn hơn một chút nhé!\nNếu cần tư vấn thêm về chất liệu hoặc form dáng, hãy nhắn cho AISH nhé!`;
    setSizeResult(resultMsg);
  }

  useEffect(() => {
    const newSteps = steps.map(step => {
      if (step.id === 'size-answer') {
        return {
          ...step,
          user: true,
          trigger: ({ value, steps: prevSteps }: { value: string; steps: any }) => {
            handleSizeInput({ value, steps: prevSteps });
            return 'size-result';
          }
        };
      }
      if (step.id === 'size-result') {
        return {
          ...step,
          message: () => sizeResult || 'Đang xử lý...'
        };
      }
      return step;
    });
    setStepsWithDynamicSize(newSteps);
    // eslint-disable-next-line
  }, [sizeResult]);

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
      <ChatBotStyleOverride />
      <ChatBot
        steps={stepsWithDynamicSize}
        floating={true}
        headerTitle="Hỗ trợ khách hàng"
        floatingIcon={<ChatBubbleIcon />}
        botAvatar={<AishBotAvatar />}
        style={{ fontFamily: 'Inter, Arial, sans-serif', borderRadius: 0, boxShadow: '0 4px 24px rgba(0,0,0,0.12)', fontSize: 12, background: '#fff', maxWidth: 340 }}
        contentStyle={{ background: '#fff', borderRadius: 0, fontSize: 12, paddingLeft: 8, paddingRight: 8 }}
        bubbleStyle={{ background: '#111', color: '#fff', fontSize: 12, borderRadius: 0, padding: '7px 12px' }}
        bubbleOptionStyle={{ background: '#fff', color: '#111', fontWeight: 500, fontSize: 12, border: '1px solid #111', borderRadius: 0, padding: '6px 14px' }}
        userAvatar={null}
        userDelay={0}
        userFontColor="#111"
        userBubbleStyle={{ background: '#fff', color: '#111', fontSize: 12, border: '1px solid #111', borderRadius: 0, padding: '7px 12px' }}
      />
    </div>
  );
} 