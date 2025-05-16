'use client';

import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Login() {
  const t = useTranslations();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) {
      setError("");
    }
  };

  const handleContinue = async () => {
    if (!email || !isValidEmail(email)) {
      setError(t('validation.requiredEmail'));
      return;
    }
    setIsLoading(true);
    // Xử lý logic đăng nhập ở đây
    router.push("/register");
  };

  const handleGoogleSignIn = () => {
    // Xử lý đăng nhập bằng Google
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-xs flex flex-col items-center gap-4">
        {/* Nút đăng nhập Google */}
        <button 
          onClick={handleGoogleSignIn}
          className="w-[350px] flex items-center justify-center border border-black text-black py-4 rounded-none text-base font-normal tracking-wide hover:bg-gray-100 transition mb-2"
          style={{ fontFamily: 'inherit', letterSpacing: '1px' }}
        >
          <FcGoogle className="text-2xl mr-3" />
          <span className="text-base font-semibold tracking-widest">{t('common.continueWithGoogle')}</span>
        </button>

        {/* Dòng OR */}
        <div className="flex items-center justify-center mt-3">
          <span className="text-black font-semibold">{t('common.or')}</span>
        </div>

        {/* Dòng tiếp tục bằng email */}
        <div className="flex justify-center w-full">
          <h2 className="text-black text-3xl font-semibold text-center whitespace-nowrap">
            {t('common.continueWithEmail')}
          </h2>
        </div>
        <div className="flex justify-center w-full text-center px-4 whitespace-nowrap">
          <p className="text-black text-xs font-semibold">
            {t('common.signInWithEmail')}
          </p>
        </div>

        {/* Container cho email và continue button */}
        <div className="flex flex-col items-center gap-4 mt-4">
          {/* Ô nhập email */}
          <div className="relative w-[350px]">
            {/* Label động */}
            <motion.label
              className={`absolute text-sm bg-white px-1 left-4 ${error ? "text-red-500" : "text-gray-500"}`}
              animate={{
                top: isFocused || email ? "4px" : "40%",
                left: "8px",
                scale: isFocused || email ? 0.75 : 1,
                translateY: isFocused || email ? "0" : "-50%",
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {t('common.email')}
            </motion.label>

            {/* Input */}
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                setIsFocused(false);
                if (!email || !isValidEmail(email)) {
                  setError(t('validation.requiredEmail'));
                } else {
                  setError("");
                }
              }}
              className={`w-[350px] px-4 pt-6 pb-2 text-base text-black border rounded-none focus:outline-none focus:ring-2 ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-black"}`}
              autoComplete="email"
              required
            />
            {/* Hiển thị lỗi nếu có */}
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          {/* Nút CONTINUE */}
          <button
            onClick={handleContinue}
            className="w-[350px] bg-black text-white py-4 rounded-none text-base font-normal tracking-wide hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'inherit', letterSpacing: '1px' }}
            disabled={isLoading}
          >
            <span className="text-base font-semibold tracking-widest">
              {isLoading ? t('common.sending') : t('common.continue')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
} 