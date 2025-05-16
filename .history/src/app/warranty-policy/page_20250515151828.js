"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import HelpPanel from '../../components/HelpPanel';

export default function WarrantyPolicy() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Title Section */}
      <section className="pt-32 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-4xl font-light text-center text-black mb-4"
          >
            CHÍNH SÁCH BẢO HÀNH
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xs md:text-sm leading-relaxed text-black text-center italic"
          >
            AISH áp dụng nguyên tắc "TRẢI NGHIỆM TRƯỚC - CẢM NHẬN SAU"
          </motion.p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Điều kiện bảo hành */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-black">Điều kiện bảo hành</h2>
              <ul className="text-xs md:text-sm leading-relaxed text-black space-y-2">
                <li>• Áp dụng 01 lần bảo hành / 01 đơn hàng</li>
                <li>• Áp dụng với tất cả sản phẩm còn giữ tem, tag và hoá đơn đơn mua hàng online hoặc offline</li>
                <li>• Áp dụng với những sản phẩm có lỗi từ phía sản xuất bao gồm:</li>
                <ul className="ml-6 mt-1 space-y-1">
                  <li>- Sản phẩm ra màu</li>
                  <li>- Vải bị co giãn</li>
                  <li>- Vải bị xù</li>
                  <li>- Kĩ thuật may bung chỉ bung nút</li>
                </ul>
                <li className="italic">* Trong khả năng AISH có thể bảo hành</li>
              </ul>
            </div>

            {/* Thời gian áp dụng */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-black">Thời gian áp dụng</h2>
              <ul className="text-xs md:text-sm leading-relaxed text-black space-y-2">
                <li>• 30 ngày kể từ ngày bạn nhận được sản phẩm, bạn có thể trải nghiệm sản phẩm thoải mái</li>
                <li>• Thời gian gửi bảo hành tại AISH: Tối đa 30 ngày từ ngày AISH nhận được sản phẩm bảo hành</li>
              </ul>
            </div>

            {/* Không bảo hành */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-black">Không bảo hành</h2>
              <p className="text-xs md:text-sm leading-relaxed text-black">
              • AISH không bảo hành được với những sản phẩm bạn giặt và phơi không đúng cách, có chất tẩy, nước nóng, hư hỏng nặng do vấn đề sử dụng lâu, vết cắt….
              </p>
            </div>

            {/* Lưu ý */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-black">Lưu ý</h2>
              <p className="text-xs md:text-sm leading-relaxed text-black font-medium">
              • Bảo hành là việc AISH sửa chữa trên sản phẩm bạn đã thanh toán, KHÔNG phải đổi sang một sản phẩm khác.
              </p>
            </div>

            {/* Phí ship */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-black">Phí ship</h2>
              <p className="text-xs md:text-sm leading-relaxed text-black">
              • AISH hỗ trợ 100% phí ship
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="relative inline-flex flex-col items-center"
          >
            <motion.div 
              className="relative group cursor-pointer"
              onClick={() => setIsHelpOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <h2 className="text-sm md:text-base font-bold text-black">
                MAY WE HELP YOU?
              </h2>
              <div className="absolute -bottom-1 left-0 w-full h-[1px] overflow-hidden">
                <div className="absolute bottom-0 left-0 w-full h-full bg-black"></div>
                <div 
                  className="absolute bottom-0 left-0 w-full h-full bg-black transform -translate-x-full transition-transform duration-500 ease-in-out group-hover:translate-x-0"
                ></div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Help Panel */}
      <HelpPanel 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
      />
    </div>
  );
} 