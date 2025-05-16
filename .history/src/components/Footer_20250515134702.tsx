'use client';

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <footer className="bg-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Cột 1 */}
          <div>
            <h3 className="text-black font-semibold mb-4">MY AISH</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/login" className="text-gray-600 hover:text-black">
                  {t('common.login')}
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-gray-600 hover:text-black">
                  {t('common.register')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 2 */}
          <div>
            <h3 className="text-black font-semibold mb-4">HELP</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-gray-600 hover:text-black">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-black">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3 */}
          <div>
            <h3 className="text-black font-semibold mb-4">ABOUT</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-black">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-600 hover:text-black">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 4 */}
          <div>
            <h3 className="text-black font-semibold mb-4">LANGUAGE</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setLanguage('en')}
                  className={`text-gray-600 hover:text-black ${language === 'en' ? 'font-bold' : ''}`}
                >
                  {t('common.english')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setLanguage('vi')}
                  className={`text-gray-600 hover:text-black ${language === 'vi' ? 'font-bold' : ''}`}
                >
                  {t('common.vietnamese')}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-600">
            © {new Date().getFullYear()} AISH. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 