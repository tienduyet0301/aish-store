export const metadata = {
  title: 'Đăng nhập - AISH',
};

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";

// Danh sách khách hàng đã đăng ký (giả lập)
const registeredEmails = ["test@example.com", "user@gmail.com"];

export default function LoginPage() {
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
    return /^[^\s@]+@[^"]+\.[^"]+$/.test(email);
  };

  // Xử lý đăng nhập bằng Google
  const handleGoogleSignIn = async () => {
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      setError("An error occurred during sign in");
    }
  };

  // Xử lý khi nhấn CONTINUE
  const handleContinue = async () => {
    if (!email) {
      setError("Please enter a valid email address");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Invalid email format");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.exists) {
        setShowAccountFound(true);
      } else {
        router.push(`/register?email=${email}`);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
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
        setError("Email hoặc mật khẩu không đúng");
      } else {
        router.push("/");
      }
    } catch (error) {
      setError("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password when email changes
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setPassword("");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-20">
      {/* Tiêu đề */}
      <h1 className="text-5xl font-bold text-black text-center my-8 tracking-wide">
        MY AISH ACCOUNT
      </h1>

      {/* Nút đăng nhập */}
      <div className="w-full max-w-xs flex flex-col gap-4">
        <button 
          onClick={handleGoogleSignIn}
          className="flex items-center justify-center w-[350px] border border-black text-black py-4 rounded-none text-base font-normal tracking-wide hover:bg-gray-100 transition mb-2"
          style={{ fontFamily: 'inherit', letterSpacing: '1px' }}
        >
          <FcGoogle className="text-2xl mr-3" />
          <span className="text-base font-semibold tracking-widest">CONTINUE WITH GOOGLE</span>
        </button>

        {/* Dòng OR */}
        <div className="flex items-center justify-center mt-3">
          <span className="text-black font-semibold">OR</span>
        </div>

        {/* Dòng tiếp tục bằng email */}
        <div className="flex justify-center w-full">
          <h2 className="text-black text-3xl font-semibold text-center whitespace-nowrap">
            CONTINUE WITH YOUR EMAIL ADDRESS
          </h2>
        </div>
        <div className="flex justify-center w-full text-center px-4 whitespace-nowrap">
          <p className="text-black text-xs font-semibold">
            Sign in with your email and password or create a profile if you are new
          </p>
        </div>

        {/* Nếu đã tìm thấy tài khoản, hiển thị form nhập mật khẩu */}
        {showAccountFound ? (
          <form onSubmit={handlePasswordLogin} className="flex flex-col gap-4 mt-6 w-full">
            <div className="flex flex-col items-center justify-center w-full">
              <h2 className="text-xl font-light tracking-wide text-black mb-4 text-center uppercase whitespace-nowrap">
                WE FOUND YOUR ACCOUNT
              </h2>
              <p className="text-sm text-center text-black mb-6 whitespace-nowrap">
                You are registered with <span className="font-semibold">{email}</span>
              </p>
            </div>
            <div className="relative w-full">
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 text-base text-black border rounded-md focus:outline-none focus:ring-2 border-gray-300 focus:ring-black placeholder:text-left"
                placeholder="Password"
                autoComplete="current-password"
                required
                style={{ textAlign: 'left', height: '48px', lineHeight: '48px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
                tabIndex={0}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  // Basic eye open icon
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/></svg>
                ) : (
                  // Basic eye closed icon
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.06 10.06 0 0 1 12 19c-5.52 0-10-7-10-7a17.92 17.92 0 0 1 4.06-5.94M1 1l22 22"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
            {/* Thêm mục Quên mật khẩu */}
            <div className="w-full flex justify-end mt-1">
              <a href="/forgot-password" className="text-xs text-black hover:underline">Quên mật khẩu?</a>
            </div>
            {error && <p className="text-red-500 text-xs mt-1 text-center">{error}</p>}
            <button
              type="submit"
              className="w-full max-w-[325px] bg-black text-white py-3 rounded-md font-semibold mt-1 hover:bg-gray-800 transition"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        ) : (
          <>
            {/* Ô nhập email */}
            <div className="relative w-full mt-4">
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
                EMAIL*
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
                    setError("Please enter a valid email address");
                  } else {
                    setError("");
                  }
                }}
                className={`w-full px-4 pt-6 pb-2 text-base text-black border rounded-md focus:outline-none focus:ring-2 ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-black"}`}
                autoComplete="email"
                required
              />
              {/* Hiển thị lỗi nếu có */}
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>

            {/* Nút CONTINUE */}
            <button
              onClick={handleContinue}
              className="w-full max-w-[325px] bg-black text-white py-3 rounded-md font-semibold mt-1 hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Continue...' : 'Continue'}
            </button>
          </>
        )}

        {/* Dòng JOIN MY AISH */}
        <div className="mt-15 mb-12 text-black font-semibold text-2xl text-center">
          JOIN MY AISH
        </div>
      </div>
    </div>
  );
} 