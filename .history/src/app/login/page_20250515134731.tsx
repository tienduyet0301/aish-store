"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useLanguage } from "@/context/LanguageContext";

// Danh sách khách hàng đã đăng ký (giả lập)
const registeredEmails = ["test@example.com", "user@gmail.com"];

export default function LoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [isFocused, setIsFocused] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showAccountFound, setShowAccountFound] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Hàm kiểm tra định dạng email
  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Xử lý đăng nhập bằng Google
  const handleGoogleSignIn = async () => {
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      setError(t('validation.invalidEmail'));
    }
  };

  // Xử lý khi nhấn CONTINUE
  const handleContinue = async () => {
    if (!email) {
      setError(t('validation.requiredEmail'));
      return;
    }
    if (!isValidEmail(email)) {
      setError(t('validation.invalidEmail'));
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });
      const data = await res.json();
      if (data.exists) {
        setShowAccountFound(true);
      } else {
        router.push(`/register?email=${email.toLowerCase()}`);
      }
    } catch (err) {
      setError(t('validation.requiredEmail'));
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý đăng nhập bằng email + mật khẩu
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError(t('validation.requiredPassword'));
      } else {
        router.push("/");
      }
    } catch (error) {
      setError(t('validation.requiredPassword'));
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password when email changes
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setPassword("");
    if (error) {
      setError("");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-20">
      {/* Tiêu đề */}
      <h1 className="text-5xl font-bold text-black text-center my-8 tracking-wide">
        {t('common.myAishAccount')}
      </h1>

      {/* Container cho tất cả các nút và input */}
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

        {/* Nếu đã tìm thấy tài khoản, hiển thị form nhập mật khẩu */}
        {showAccountFound ? (
          <form onSubmit={handlePasswordLogin} className="flex flex-col items-center gap-4 mt-6">
            <div className="flex flex-col items-center justify-center">
              <h2 className="text-xl font-light tracking-wide text-black mb-4 text-center uppercase whitespace-nowrap">
                {t('common.myAishAccount')}
              </h2>
              <p className="text-sm text-center text-black mb-6 whitespace-nowrap">
                {t('common.signInWithEmail')}
              </p>
            </div>
            <div className="relative w-[350px]">
              <label htmlFor="password" className="sr-only">{t('common.password')}</label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-[350px] px-4 pt-6 pb-2 text-base text-black border rounded-none focus:outline-none focus:ring-2 border-gray-300 focus:ring-black"
                placeholder={t('common.password')}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
                tabIndex={0}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/></svg>
                ) : (
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.06 10.06 0 0 1 12 19c-5.52 0-10-7-10-7a17.92 17.92 0 0 1 4.06-5.94M1 1l22 22"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
            {/* Thêm mục Quên mật khẩu */}
            <div className="w-[350px] flex justify-end mt-1">
              <a href="/forgot-password" className="text-xs text-black hover:underline">{t('common.forgotPassword')}</a>
            </div>
            {error && <p className="text-red-500 text-xs mt-1 text-center">{error}</p>}
            <button
              type="submit"
              className="w-[350px] bg-black text-white py-4 rounded-none text-base font-normal tracking-wide hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'inherit', letterSpacing: '1px' }}
              disabled={isLoading}
            >
              <span className="text-base font-semibold tracking-widest">
                {isLoading ? t('common.sending') : t('common.login')}
              </span>
            </button>
          </form>
        ) : (
          <>
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
          </>
        )}

        {/* Dòng JOIN MY AISH */}
        <div className="mt-15 mb-12 text-black font-semibold text-2xl text-center">
          {t('common.joinMyAish')}
        </div>
      </div>
    </div>
  );
} 

