"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PromoCode {
  _id: string;
  code: string;
  type: 'fixed' | 'percentage';
  value: number;
  description?: string; // Thêm trường description
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
            // Giả lập description nếu không có
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <motion.div
        initial={{ y: "100vh" }}
        animate={{ y: 0 }}
        exit={{ y: "100vh" }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="bg-white rounded-t-lg shadow-xl w-full max-w-md h-3/4 flex flex-col"
      >
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-lg font-semibold">Voucher của Aish</h2>
          <button onClick={onClose} className="text-2xl">&times;</button>
        </div>
        <div className="p-4 overflow-y-auto flex-grow">
          {loading ? (
            <p>Đang tải vouchers...</p>
          ) : vouchers.length > 0 ? (
            vouchers.map((voucher) => (
              <div key={voucher._id} className="flex items-center justify-between p-3 mb-3 border rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-100 rounded-full mr-4">
                    {/* Logo or icon here */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{voucher.code}</p>
                    <p className="text-sm text-gray-600">{voucher.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleApply(voucher.code)}
                  className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition"
                >
                  Áp dụng
                </button>
              </div>
            ))
          ) : (
            <p>Không có voucher nào.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
} 