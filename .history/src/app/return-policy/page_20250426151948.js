"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import HelpPanel from '../../components/HelpPanel';

export default function ReturnPolicy() {
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
            CHÍNH SÁCH ĐỔI TRẢ
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xs md:text-sm leading-relaxed text-black text-center italic"
          >
            AISH áp dụng cách thức "CHĂM SÓC TẠI NHÀ" để các bạn có trải nghiệm mua hàng và chăm sóc tốt nhất.
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
            {/* Điều kiện đổi trả */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-black">Điều kiện đổi trả</h2>
              <ul className="text-xs md:text-sm leading-relaxed text-black space-y-2">
                <li>• Áp dụng 01 lần đổi / 01 đơn hàng</li>
                <li>• Áp dụng đổi hàng với tất cả sản phẩm còn đầy đủ tem, tag</li>
                <li>• Sản phẩm chưa qua sử dụng và không có vết bẩn, rác, mùi hương lạ</li>
                <li>• Đổi sản phẩm khác với giá trị tương đồng hoặc giá trị cao hơn (Bạn thanh toán giá trị chênh lệch nếu có)</li>
                <li>• Cân nhắc đổi sang sản phẩm giá trị thấp hơn, vì AISH sẽ không hoàn lại tiền thừa</li>
              </ul>
            </div>

            {/* Quy trình đổi trả */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-black">Quy trình đổi trả</h2>
              <ul className="text-xs md:text-sm leading-relaxed text-black space-y-2">
                <li>• Shipper sẽ đến lấy hàng tận nơi</li>
                <li>• Bạn không cần phải ra bưu cục gửi hàng</li>
                <li>• Không cần tự tạo đơn hàng</li>
              </ul>
            </div>

            {/* Thời gian áp dụng */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-black">Thời gian áp dụng</h2>
              <p className="text-xs md:text-sm leading-relaxed text-black">
              • 7 ngày kể từ ngày nhận được sản phẩm, áp dụng với tất cả đơn hàng nội thành và ngoại thành
              </p>
            </div>

            {/* Chính sách phí ship */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-black">Chính sách phí ship</h2>
              
              <div className="space-y-2">
                <p className="text-xs md:text-sm font-semibold text-black">AISH hỗ trợ 100% phí ship trong các trường hợp:</p>
                <ul className="text-xs md:text-sm leading-relaxed text-black space-y-1 ml-4">
                  <li>• Sản phẩm bị lỗi từ phía sản xuất</li>
                  <li>• Sản phẩm giao nhầm size, giao nhầm phân loại sản phẩm</li>
                </ul>
              </div>

              <div className="space-y-2">
                <p className="text-xs md:text-sm font-semibold text-black">AISH hỗ trợ 50% phí ship trong trường hợp:</p>
                <ul className="text-xs md:text-sm leading-relaxed text-black space-y-1 ml-4">
                  <li>• Bạn mong muốn đổi sang sản phẩm khác</li>
                </ul>
              </div>

              <div className="mt-4">
                <p className="text-xs md:text-sm leading-relaxed text-black italic">
                  Không có trường hợp nào AISH để bạn chịu hoàn toàn phí ship cả. Vì thế bạn hãy cứ yên tâm thoải mái trải nghiệm mua sắm nhé.
                </p>
              </div>
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