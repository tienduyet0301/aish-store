"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import { LazyHelpPanel } from '../../components/lazy';

export default function AboutUs() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Title Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-light text-center text-black"
          >
            ABOUT AISH
          </motion.h1>
        </div>
      </section>

      {/* Main Image Section */}
      <motion.section 
        className="relative w-full aspect-[16/9] max-w-6xl mx-auto mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.4 }}
      >
        <Image
          src="/images/image7.jpg"
          alt="AISH Brand"
          fill
          className="object-cover"
          priority
        />
      </motion.section>

      {/* Content Section */}
      <section className="py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="space-y-6 text-center"
          >
            <p className="text-xs md:text-sm leading-relaxed text-black">
              AISH là một thương hiệu thời trang được thành lập vào đầu năm 2025, ra đời từ niềm đam mê của những cá nhân yêu thích thiết kế tối giản, kết hợp một cách tinh tế với những chi tiết sắc sảo và sang trọng.
            </p>
            
            <p className="text-xs md:text-sm leading-relaxed text-black">
              AISH được tạo ra để đại diện cho thế hệ trẻ tự tin thể hiện phong cách cá nhân, sở hữu niềm tin vững chắc vào bản thân và không ngừng tìm kiếm những trải nghiệm mới mẻ, thú vị. Với tinh thần tích cực, AISH khao khát truyền cảm hứng và truyền tải những thông điệp ý nghĩa đến tất cả mọi người.
            </p>

            <p className="text-xs md:text-sm leading-relaxed text-black">
              Mỗi bộ sưu tập trong năm 2025 đánh dấu bước khởi đầu trong hành trình của AISH.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-16 pb-16 px-4">
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
      {isHelpOpen && (
        <LazyHelpPanel
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
        />
      )}
    </div>
  );
} 