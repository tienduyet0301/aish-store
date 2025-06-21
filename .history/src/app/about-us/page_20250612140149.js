"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import HelpPanel from '../../components/HelpPanel';
import { useLanguage } from '../../context/LanguageContext';

export default function AboutUs() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const { t } = useLanguage();

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
            {t('about.title')}
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
          alt={t('about.imageAlt')}
          fill
          className="object-cover"
          priority
          quality={100}
          sizes="(max-width: 768px) 100vw, 1200px"
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
              {t('about.paragraph1')}
            </p>
            
            <p className="text-xs md:text-sm leading-relaxed text-black">
              {t('about.paragraph2')}
            </p>

            <p className="text-xs md:text-sm leading-relaxed text-black">
              {t('about.paragraph3')}
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
                {t('common.mayWeHelpYou')}
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