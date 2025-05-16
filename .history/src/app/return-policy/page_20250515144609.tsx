"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import HelpPanel from '../../components/HelpPanel';
import { useLanguage } from '../../context/LanguageContext';

export default function ReturnPolicy() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const { t } = useLanguage();

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
            {t('return.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xs md:text-sm leading-relaxed text-black text-center italic"
          >
            {t('return.description')}
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
            {/* Return Conditions */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-black">{t('return.conditions.title')}</h2>
              <ul className="text-xs md:text-sm leading-relaxed text-black space-y-2">
                <li>• {t('return.conditions.tip1')}</li>
                <li>• {t('return.conditions.tip2')}</li>
                <li>• {t('return.conditions.tip3')}</li>
                <li>• {t('return.conditions.tip4')}</li>
                <li>• {t('return.conditions.tip5')}</li>
              </ul>
            </div>

            {/* Return Process */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-black">{t('return.process.title')}</h2>
              <ul className="text-xs md:text-sm leading-relaxed text-black space-y-2">
                <li>• {t('return.process.tip1')}</li>
                <li>• {t('return.process.tip2')}</li>
                <li>• {t('return.process.tip3')}</li>
                <li>• {t('return.process.tip4')}</li>
              </ul>
            </div>

            {/* Refund Policy */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-black">{t('return.refund.title')}</h2>
              <ul className="text-xs md:text-sm leading-relaxed text-black space-y-2">
                <li>• {t('return.refund.tip1')}</li>
                <li>• {t('return.refund.tip2')}</li>
                <li>• {t('return.refund.tip3')}</li>
              </ul>
            </div>

            {/* Exceptions */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-black">{t('return.exceptions.title')}</h2>
              <ul className="text-xs md:text-sm leading-relaxed text-black space-y-2">
                <li>• {t('return.exceptions.tip1')}</li>
                <li>• {t('return.exceptions.tip2')}</li>
                <li>• {t('return.exceptions.tip3')}</li>
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
                {t('return.help.title')}
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