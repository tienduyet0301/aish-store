"use client";
import { useState } from "react";
import { BsChatDots } from "react-icons/bs";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { language, setLanguage, t } = useLanguage();
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
  };

  // Fallback translations in case context is not available
  const fallbackTranslations = {
    "common.contact": "CONTACT US",
    "common.follow": "FOLLOW US",
    "common.service": "SERVICE",
    "common.about": "ABOUT AISH",
    "common.language": "LANGUAGE",
    "common.returnPolicy": "RETURN POLICY",
    "common.warrantyPolicy": "WARRANTY POLICY",
    "common.careInstructions": "CARE INSTRUCTIONS",
    "common.english": "ENGLISH",
    "common.vietnamese": "VIETNAMESE"
  };

  const safeTranslate = (key) => {
    try {
      return t(key) || fallbackTranslations[key] || key;
    } catch (error) {
      return fallbackTranslations[key] || key;
    }
  };

  return (
    <footer id="footer" className="w-full bg-black text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Column 1: Contact Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase relative inline-block group">
              {safeTranslate("common.contact")}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300 ease-out"></span>
            </h3>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => setShowEmail(!showEmail)}
                  className="block text-gray-400 hover:text-white transition-colors text-[10px] transform hover:translate-x-2 duration-200 text-left w-full"
                >
                  EMAIL
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${showEmail ? 'max-h-10 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                  <span className="text-[10px] text-gray-400">aish.aish.vn@gmail.com</span>
                </div>
              </li>
              <li>
                <button 
                  onClick={() => setShowPhone(!showPhone)}
                  className="block text-gray-400 hover:text-white transition-colors text-[10px] transform hover:translate-x-2 duration-200 text-left w-full"
                >
                  PHONE
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${showPhone ? 'max-h-10 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                  <span className="text-[10px] text-gray-400">0347272386</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Column 2: Follow Us */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase relative inline-block group">
              {safeTranslate("common.follow")}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300 ease-out"></span>
            </h3>
            <div className="space-y-2">
              <a href="https://www.facebook.com/profile.php?id=61564602818212" target="_blank" rel="noopener noreferrer" 
                 className="block text-gray-400 hover:text-white transition-colors text-[10px] transform hover:translate-x-2 duration-200">FACEBOOK</a>
              <a href="https://www.instagram.com/aish.aish.vn/" target="_blank" rel="noopener noreferrer"
                 className="block text-gray-400 hover:text-white transition-colors text-[10px] transform hover:translate-x-2 duration-200">INSTAGRAM</a>
            </div>
          </div>

          {/* Column 3: Service */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase relative inline-block group">
              {safeTranslate("common.service")}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300 ease-out"></span>
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/return-policy" className="text-gray-400 hover:text-white transition-colors transform hover:translate-x-2 duration-200 block text-[10px]">
                  {safeTranslate("common.returnPolicy")}
                </Link>
              </li>
              <li>
                <Link href="/warranty-policy" className="text-gray-400 hover:text-white transition-colors transform hover:translate-x-2 duration-200 block text-[10px]">
                  {safeTranslate("common.warrantyPolicy")}
                </Link>
              </li>
              <li>
                <Link href="/care-instructions" className="text-gray-400 hover:text-white transition-colors transform hover:translate-x-2 duration-200 block text-[10px]">
                  {safeTranslate("common.careInstructions")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: About AISH */}
          <div className="space-y-3">
            <Link href="/about-us" className="inline-block group">
              <h3 className="text-sm font-semibold uppercase relative inline-block">
                {safeTranslate("common.about")}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300 ease-out"></span>
              </h3>
            </Link>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold uppercase relative inline-block group">
                {safeTranslate("common.language")}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300 ease-out"></span>
              </h3>
              <div className="space-y-2">
                <button 
                  onClick={() => handleLanguageChange('en')} 
                  className={`block text-[10px] transform hover:translate-x-2 duration-200 ${language === 'en' ? 'text-white' : 'text-gray-400 hover:text-white'} transition-colors`}
                >
                  {safeTranslate("common.english")}
                </button>
                <button 
                  onClick={() => handleLanguageChange('vi')} 
                  className={`block text-[10px] transform hover:translate-x-2 duration-200 ${language === 'vi' ? 'text-white' : 'text-gray-400 hover:text-white'} transition-colors`}
                >
                  {safeTranslate("common.vietnamese")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom with Large Logo */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex justify-center items-center">
            <span className="text-6xl font-semibold tracking-wider">
              AISH<sup style={{ fontSize: "0.4em", marginLeft: "2px", marginTop: "100em" }}>®</sup>
            </span>
          </div>
        </div>
      </div>

      {/* Chatbot Icon */}
      <button className="fixed bottom-8 right-8 bg-white text-black p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
        title="Open chat support"
        aria-label="Open chat support"
      >
        <BsChatDots size={24} />
      </button>
    </footer>
  );
}