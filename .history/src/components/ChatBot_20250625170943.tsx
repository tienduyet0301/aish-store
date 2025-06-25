'use client';
import ChatBot from 'react-simple-chatbot';
import { useEffect, useState, useRef } from 'react';

// State lưu tạm height/weight
let tempSizeResult: { height: number; weight: number } = { height: 0, weight: 0 };

// Thêm component SupportButton cho nút trong chat
const SupportButton = ({ triggerNextStep }: any) => (
  <div style={{ width: '100%', textAlign: 'center', margin: '6px 0' }}>
    <button
      style={{
        background: '#fff', color: '#111', border: '1px solid #fff', borderRadius: 2,
        padding: '0.5px 2px', fontSize: 13, cursor: 'pointer', fontWeight: 600, lineHeight: 1, height: 'unset', width: 'unset', display: 'inline-block'
      }}
      onClick={() => triggerNextStep({ trigger: '1' })}
    >
      Cần hỗ trợ thêm?
    </button>
  </div>
);

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
      { value: 'order', label: 'Hướng dẫn đặt hàng', trigger: 'order-guide' },
      { value: 'discount', label: 'Hướng dẫn mã giảm giá', trigger: 'discount-guide' },
    ],
  },
  // Tư vấn size
  {
    id: 'size-ask',
    message: 'Cậu vui lòng cho tớ biết chiều cao và cân nặng (VD:1m70 -65kg) để tớ tư vấn chính xác hơn nhá?',
    trigger: 'size-answer',
  },
  {
    id: 'size-answer',
    user: true,
    trigger: ({ value }: { value: string }) => {
      const { height, weight } = parseHeightWeight(value);
      tempSizeResult = { height, weight };
      if (!height || !weight) return 'size-error';
      return 'size-success';
    },
  },
  {
    id: 'size-error',
    message: 'Tớ chưa nhận diện được chiều cao và cân nặng, cậu nhập lại giúp tớ nhé!',
    trigger: 'size-ask',
  },
  {
    id: 'size-success',
    message: () => {
      const { height, weight } = tempSizeResult;
      let sizeShirtPant = '';
      if (height <= 165 && weight <= 55) {
        sizeShirtPant = 'M (Dưới 1m65 55kg)';
      } else if (height <= 175 && weight <= 65) {
        sizeShirtPant = 'L (Dưới 1m75 65kg)';
      } else if (height <= 185 && weight <= 70) {
        sizeShirtPant = 'XL (Dưới 1m85 70kg)';
      } else {
        sizeShirtPant = 'XL (Dưới 1m85 70kg)';
      }
      let sizeJacket = '';
      if (height <= 160 && weight <= 60) {
        sizeJacket = 'M (Dưới 1m60 50-60kg)';
      } else if (height <= 170 && weight <= 70) {
        sizeJacket = 'L (Dưới 1m70 60-70kg)';
      } else {
        sizeJacket = 'XL (Dưới 1m75 65-80kg)';
      }
      let resultMsg = `Dựa trên số đo cậu cung cấp:\n`;
      resultMsg += `- Áo thun, sơ mi, quần: size phù hợp là: ${sizeShirtPant}\n`;
      resultMsg += `- Áo khoác: size phù hợp là: ${sizeJacket}\n`;
      resultMsg += `Nếu cậu thích mặc rộng rãi, có thể chọn size lớn hơn một chút nhé!\nNếu cần tư vấn chi tiết hơn nữa, hãy nhắn cho AISH nhé!`;
      return resultMsg;
    },
    trigger: 'size-support',
  },
  {
    id: 'size-support',
    component: <SupportButton />, asMessage: false, waitAction: true, end: false
  },
  // Hướng dẫn đặt hàng
  {
    id: 'order-guide',
    message: 'Để đặt hàng tại AISH, cậu làm theo các bước sau nháa:\nBước 1: Chọn sản phẩm yêu thích ở trang sản phẩm nhá !\nBước 2: Chọn số lượng và Size phù hợp và chọn " Add to cart "\nBước 3: Kiểm tra lại ở giỏ hàng của bạn và chọn " Check out "\nBước 4: Điền đầy đủ thông tin, áp dụng mã giảm giá và xác nhận đơn hàng.\nNhớ lưu lại mã đơn hàng nếu bạn muốn kiểm tra cứu mã vận đơn nhé !!!',
    trigger: 'order-support',
  },
  {
    id: 'order-support',
    component: <SupportButton />, asMessage: false, waitAction: true, end: false
  },
  // Hướng dẫn mã giảm giá
  {
    id: 'discount-guide',
    message: 'Cậu có thể sử dụng mã giảm giá khi thanh toán như sau:\nBước 1: Ở trang thanh toán, cậu tìm ô \'Nhập mã giảm giá\' nhaa\nBước 2:  Nhập mã bạn có hoặc chọn voucher đang có sẵn và nhấn \'Áp dụng\' ! \nBước 3:  Hệ thống sẽ tự động trừ số tiền giảm vào tổng đơn hàng nè \nLưu ý: Mỗi đơn hàng chỉ áp dụng 1 mã giảm giá. Nếu mã không hợp lệ, hãy kiểm tra lại điều kiện sử dụng hoặc liên hệ AISH để được hỗ trợ sớm nhất nhaa!',
    trigger: 'discount-support',
  },
  {
    id: 'discount-support',
    component: <SupportButton />, asMessage: false, waitAction: true, end: false
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
        overflow-y: auto !important;
        max-height: 400px !important;
        scrollbar-width: thin !important;
        scrollbar-color: #bbb #fff !important;
        height: 100% !important;
        pointer-events: auto !important;
        overscroll-behavior: contain !important;
      }
      .rsc-container {
        border-radius: 0 !important;
      }
      .rsc-input {
        border-radius: 0 !important;
        font-size: 12px !important;
      }
      .rsc-input input,
      .rsc-input input[type='text'],
      .rsc-input input:focus,
      .rsc-input input:active,
      .rsc-input input:enabled,
      .rsc-input input:valid,
      .rsc-input input:-webkit-autofill,
      .rsc-input input:-webkit-autofill:focus,
      .rsc-input input:-webkit-autofill:hover,
      .rsc-input input:-webkit-autofill:active {
        color: #111 !important;
        font-weight: 700 !important;
        opacity: 1 !important;
        background: #fff !important;
        text-shadow: none !important;
        filter: none !important;
      }
      .rsc-input input:disabled,
      .rsc-input textarea:disabled,
      .rsc-input input[readonly],
      .rsc-input textarea[readonly] {
        opacity: 0.5 !important;
        background: #f5f5f5 !important;
        color: #bbb !important;
      }
      .rsc-submit-button {
        opacity: 1 !important;
        background: #111 !important;
        color: #fff !important;
      }
      .rsc-submit-button:disabled {
        opacity: 0.5 !important;
        background: #eee !important;
        color: #bbb !important;
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
        color: #111 !important;
        font-weight: 700 !important;
      }
      .rsc-input input::placeholder,
      .rsc-input textarea::placeholder {
        color: #111 !important;
        opacity: 1 !important;
        font-weight: 400 !important;
      }
      .rsc-input input:focus,
      .rsc-input input:active {
        color: #111 !important;
        font-weight: 600 !important;
        opacity: 1 !important;
        background: #fff !important;
      }
      .rsc-input input:-webkit-autofill,
      .rsc-input input:-webkit-autofill:focus,
      .rsc-input input:-webkit-autofill:hover,
      .rsc-input input:-webkit-autofill:active {
        -webkit-text-fill-color: #111 !important;
        color: #111 !important;
        font-weight: 600 !important;
        background: #fff !important;
        box-shadow: 0 0 0px 1000px #fff inset !important;
        opacity: 1 !important;
      }
      .rsc-input input,
      .rsc-input textarea {
        text-transform: none !important;
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

function getInputString(input: any): string {
  if (typeof input === 'string') return input;
  if (input && typeof input.value === 'string') return input.value;
  if (input && typeof input.message === 'string') return input.message;
  if (input && typeof input.value === 'object') return getInputString(input.value);
  return '';
}

function parseHeightWeight(str: string) {
  let height = 0, weight = 0;
  if (str) {
    // Ưu tiên nhận dạng 1m77, 1M77, 1 m 77, 1M 77
    let mMatch = str.match(/1\s*[mM]\s*(\d{2})/);
    if (!mMatch) mMatch = str.match(/1[mM](\d{2})/);
    if (mMatch) {
      height = 100 + parseInt(mMatch[1], 10);
    }
    // Ưu tiên nhận dạng 65kg, 65KG, 65 kg
    const kgMatch = str.match(/(\d{2,3})\s*[kK][gG]/);
    if (kgMatch) {
      weight = parseInt(kgMatch[1], 10);
    }
    // Nếu chưa đủ, lấy tất cả số
    const numbers = str.match(/\d+/g);
    if (numbers && numbers.length >= 2) {
      // Nếu đã có height/weight từ trên thì giữ, chưa có thì gán
      if (!height || !weight) {
        const nums = numbers.map(n => parseInt(n, 10)).filter(n => n > 20);
        // Lấy số lớn nhất làm height, nhỏ nhất làm weight
        const max = Math.max(...nums);
        const min = Math.min(...nums);
        if (!height) height = max;
        if (!weight) weight = min;
      }
    }
  }
  // Chỉ trả về nếu height >= 140 và weight >= 35
  if (height < 140 || weight < 35) return { height: 0, weight: 0 };
  return { height, weight };
}

export default function MyChatBot() {
  const [key, setKey] = useState(0);
  const [showSupportBtn, setShowSupportBtn] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // Tự động scroll xuống dưới cùng khi có tin nhắn mới bằng MutationObserver
  useEffect(() => {
    const content = document.querySelector('.rsc-content');
    if (!content) return;
    const scrollToBottom = () => {
      content.scrollTop = content.scrollHeight;
    };
    // Scroll ngay khi mount
    scrollToBottom();
    // Theo dõi thay đổi nội dung
    const observer = new MutationObserver(scrollToBottom);
    observer.observe(content, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [key]);

  return (
    <div ref={chatRef} style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
      <ChatBotStyleOverride />
      <ChatBot
        key={key}
        steps={steps}
        floating={true}
        headerTitle="Hỗ trợ khách hàng"
        floatingIcon={<ChatBubbleIcon />}
        botAvatar="https://i.ibb.co/MDMRSQcy/494821027-1050220020401243-5204159143056157941-n.jpg"
        userAvatar="https://i.ibb.co/cKNhkRd0/44562.png"
        style={{ fontFamily: 'Inter, Arial, sans-serif', borderRadius: 0, boxShadow: '0 4px 24px rgba(0,0,0,0.12)', fontSize: 12, background: '#fff', maxWidth: 340 }}
        contentStyle={{ background: '#fff', borderRadius: 0, fontSize: 12, paddingLeft: 8, paddingRight: 8 }}
        bubbleStyle={{ background: '#111', color: '#fff', fontSize: 12, borderRadius: 0, padding: '7px 12px' }}
        bubbleOptionStyle={{ background: '#fff', color: '#111', fontWeight: 500, fontSize: 12, border: '1px solid #111', borderRadius: 0, padding: '6px 14px' }}
        userDelay={0}
        userFontColor="#111"
        userBubbleStyle={{ background: '#fff', color: '#111', fontSize: 12, border: '1px solid #111', borderRadius: 0, padding: '7px 12px' }}
        handleEnd={() => setKey(k => k + 1)}
        inputStyle={{ color: '#111', background: '#fff', fontWeight: 700, opacity: 1 }}
      />
    </div>
  );
} 