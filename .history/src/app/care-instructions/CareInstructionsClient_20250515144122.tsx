"use client";
import { motion } from "framer-motion";
import { useLanguage } from '../../context/LanguageContext';

export default function CareInstructionsClient() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('care.title')}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('care.description')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Washing Instructions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-50 p-6 rounded-lg"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('care.washing.title')}
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-gray-600 mr-2">•</span>
                <span>{t('care.washing.tip1')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-600 mr-2">•</span>
                <span>{t('care.washing.tip2')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-600 mr-2">•</span>
                <span>{t('care.washing.tip3')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-600 mr-2">•</span>
                <span>{t('care.washing.tip4')}</span>
              </li>
            </ul>
          </motion.div>

          {/* Drying Instructions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gray-50 p-6 rounded-lg"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('care.drying.title')}
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-gray-600 mr-2">•</span>
                <span>{t('care.drying.tip1')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-600 mr-2">•</span>
                <span>{t('care.drying.tip2')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-600 mr-2">•</span>
                <span>{t('care.drying.tip3')}</span>
              </li>
            </ul>
          </motion.div>

          {/* Ironing Instructions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gray-50 p-6 rounded-lg"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('care.ironing.title')}
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-gray-600 mr-2">•</span>
                <span>{t('care.ironing.tip1')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-600 mr-2">•</span>
                <span>{t('care.ironing.tip2')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-600 mr-2">•</span>
                <span>{t('care.ironing.tip3')}</span>
              </li>
            </ul>
          </motion.div>

          {/* Storage Instructions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-gray-50 p-6 rounded-lg"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('care.storage.title')}
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-gray-600 mr-2">•</span>
                <span>{t('care.storage.tip1')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-600 mr-2">•</span>
                <span>{t('care.storage.tip2')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-600 mr-2">•</span>
                <span>{t('care.storage.tip3')}</span>
              </li>
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-600">
            {t('care.footer')}
          </p>
        </motion.div>
      </div>
    </div>
  );
} 