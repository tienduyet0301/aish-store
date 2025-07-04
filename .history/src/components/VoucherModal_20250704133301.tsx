"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PromoCode {
  _id: string;
  code: string;
  type: 'fixed' | 'percentage';
  value: number;
  description?: string;
  minOrderAmount?: number; // Thêm trường này
}

interface VoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyVoucher: (code: string) => void;
}

export default function VoucherModal({ isOpen, onClose, onApplyVoucher }: VoucherModalProps) {
  const [vouchers, setVouchers] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const fetchVouchers = async () => {
        setLoading(true);
        try {
          const response = await fetch('/api/vouchers');
          const data = await response.json();
          if (data.ok) {
            const vouchersWithDesc = data.promoCodes.map((voucher: PromoCode) => ({
              ...voucher,
              description: voucher.description || `Giảm ${voucher.value.toLocaleString('vi-VN')}${voucher.type === 'percentage' ? '%' : ' VND'}`
            }));
            setVouchers(vouchersWithDesc);
          }
        } catch (error) {
          console.error("Failed to fetch vouchers", error);
        } finally {
          setLoading(false);
        }
      };
      fetchVouchers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApply = (code: string) => {
    onApplyVoucher(code);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/30 flex justify-end z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white shadow-xl w-full max-w-sm md:max-w-md lg:max-w-lg h-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <button onClick={onClose} className="text-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h2 className="text-lg font-semibold">Voucher của Aish</h2>
          <div className="w-6"></div>
        </div>
        <div className="p-4 overflow-y-auto flex-grow">
          {loading ? (
            <p className="text-center">Đang tải vouchers...</p>
          ) : vouchers.length > 0 ? (
            vouchers.map((voucher) => (
              <div key={voucher._id} className="flex items-center justify-between p-3 mb-3 border-l-4 border-black bg-gray-50 rounded-r-lg">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-black text-white flex items-center justify-center mr-4 text-xs font-bold transform -translate-x-3">
                    AISH
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{voucher.code}</p>
                    <p className="text-sm text-gray-600">{voucher.description}</p>
                    {voucher.minOrderAmount && voucher.minOrderAmount > 0 && (
                      <p className="text-xs text-gray-500 mt-1">Đơn tối thiểu: {voucher.minOrderAmount.toLocaleString('vi-VN')} VND</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleApply(voucher.code)}
                  className="bg-black text-white px-4 py-2 text-sm hover:bg-gray-800 transition"
                >
                  Áp dụng
                </button>
              </div>
            ))
          ) : (
            <p className="text-center">Không có voucher nào.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
} 