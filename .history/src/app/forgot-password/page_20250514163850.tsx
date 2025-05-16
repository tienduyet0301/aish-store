"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email || !isValidEmail(email)) {
      setError("Vui lòng nhập email hợp lệ");
      return;
    }
    setIsLoading(true);
    // Giả lập gửi email thành công
    setTimeout(() => {
      setSuccess("Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu cho bạn.");
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-20">
      <h1 className="text-5xl font-bold text-black text-center my-8 tracking-wide">
        QUÊN MẬT KHẨU
      </h1>
      <div className="w-full max-w-xs flex flex-col gap-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <div className="relative w-full mt-4">
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
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`w-full px-4 pt-6 pb-2 text-base text-black border rounded-md focus:outline-none focus:ring-2 ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-black"}`}
              autoComplete="email"
              required
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            {success && <p className="text-green-600 text-xs mt-1">{success}</p>}
          </div>
          <button
            type="submit"
            className="w-full max-w-[325px] bg-black text-white py-3 rounded-md font-semibold mt-1 hover:bg-gray-800 transition"
            disabled={isLoading}
          >
            {isLoading ? "Đang gửi..." : "GỬI HƯỚNG DẪN"}
          </button>
        </form>
        <div className="mt-8 text-center">
          <button
            type="button"
            className="text-xs text-black underline hover:text-gray-700"
            onClick={() => router.push("/login")}
          >
            Quay lại đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
} 