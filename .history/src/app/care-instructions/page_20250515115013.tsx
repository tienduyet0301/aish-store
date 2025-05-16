import { Metadata } from "next";
import { motion } from "framer-motion";
import { useState } from "react";
import HelpPanel from '../../components/HelpPanel';

export const metadata: Metadata = {
  title: "Care Instructions | AISH",
};

export default function CareInstructions() {
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
            HƯỚNG DẪN BẢO QUẢN
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xs md:text-sm leading-relaxed text-black text-center italic"
          >
            Tất cả chất liệu của sản phẩm luôn được AISH lựa chọn với yêu cầu bền màu, giữ form dáng tốt nhất. Tuy nhiên chất liệu nào cũng sẽ bị bào mòn theo thời gian và số lần sử dụng.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xs md:text-sm leading-relaxed text-black text-center mt-4"
          >
            Bạn có thể tham khảo những cách bảo quản sản phẩm sau đây để luôn giữ được tình trạng quần áo tốt nhất.
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
            {/* Cách thức giặt */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-black">Cách thức giặt</h2>
              <ul className="text-xs md:text-sm leading-relaxed text-black space-y-2">
                <li>• Luôn lộn mặt trái sản phẩm để giặt khi giặt tại máy</li>
                <li>• Phân loại sản phẩm khi giặt (Đồ màu không để cùng đồ trắng)</li>
                <li>• Giặt ở chế độ vừa</li>
                <li>• Không giặt với nước trên 30 độ</li>
                <li>• Không giặt với chất tẩy, kim loại, những vật làm hư tổn đến sản phẩm</li>
              </ul>
            </div>

            {/* Cách thức phơi */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-black">Cách thức phơi</h2>
              <ul className="text-xs md:text-sm leading-relaxed text-black space-y-2">
                <li>• Luôn móc áo từ dưới thân áo lên</li>
                <li>• Luôn phơi với mặt trái của sản phẩm</li>
                <li>• Không phơi dưới trời nắng gắt</li>
                <li>• Không phơi dưới trời mưa</li>
              </ul>
            </div>

            {/* Cách thức ủi */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-black">Cách thức ủi</h2>
              <ul className="text-xs md:text-sm leading-relaxed text-black space-y-2">
                <li>• Không ủi trực tiếp lên hình in, hình thêu</li>
                <li>• Không để bàn ủi quá lâu trên bề mặt sản phẩm</li>
                <li>• Không sử dụng nhiệt độ quá cao với các chất liệu cotton, lụa, len</li>
              </ul>
            </div>

            {/* Những điều không nên làm */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-black">Những điều không nên làm với sản phẩm</h2>
              <ul className="text-xs md:text-sm leading-relaxed text-black space-y-2">
                <li>• Không sử dụng chất tẩy</li>
                <li>• Không treo ở nơi ẩm móc</li>
                <li>• Không dùng bàn chải trên sản phẩm len, hình in, thêu</li>
                <li>• Không giặt sản phẩm tối màu cùng với sản phẩm sáng màu</li>
                <li>• Không được sấy nóng sản phẩm</li>
              </ul>
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