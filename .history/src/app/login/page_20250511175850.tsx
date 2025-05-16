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
  const [error, setError] = useState("");
  const [showAccountFound, setShowAccountFound] = useState(false);

  // Hàm kiểm tra định dạng email
  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Xử lý đăng nhập bằng Google
  const handleGoogleSignIn = async () => {
    try {
      const result = await signIn("google", { redirect: false });
      if (result?.error) {
        setError("Failed to sign in with Google");
      }
    } catch (error) {
      setError("An error occurred during sign in");
    }
  };

  // Xử lý khi nhấn CONTINUE
  const handleContinue = () => {
    if (!email) {
      setError("Please enter a valid email address");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Invalid email format");
      return;
    }

    setError(""); // Xóa lỗi nếu email hợp lệ

    // Kiểm tra email có tồn tại hay không
    if (registeredEmails.includes(email)) {
      setShowAccountFound(true); // Hiển thị thông báo tìm thấy tài khoản
    } else {
      router.push(`/register?email=${email}`); // Nếu chưa có, chuyển sang đăng ký
    }
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
          className="flex items-center justify-center w-full border border-black text-black py-2 rounded-full text-sm font-semibold hover:bg-gray-100 transition"
        >
          <FcGoogle className="text-3xl mr-2" /> CONTINUE WITH GOOGLE
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

        {/* Thông báo tìm thấy tài khoản */}
        {showAccountFound && (
          <div className="flex flex-col items-center justify-center w-full mt-10">
            <h2 className="text-xl font-light tracking-wide text-black mb-4 text-center uppercase whitespace-nowrap">
              WE FOUND YOUR ACCOUNT
            </h2>
            <p className="text-sm text-center text-black mb-6 whitespace-nowrap">
              You are registered with <span className="font-semibold">{email}</span>
            </p>
            <button
              onClick={handleGoogleSignIn}
              className="flex items-center justify-center w-[350px] border border-black text-black py-4 rounded-none text-base font-normal tracking-wide hover:bg-gray-100 transition mb-2"
              style={{ fontFamily: 'inherit', letterSpacing: '1px' }}
            >
              <FcGoogle className="text-2xl mr-3" />
              <span className="text-base font-semibold tracking-widest">CONTINUE WITH GOOGLE</span>
            </button>
          </div>
        )}

        {/* Ô nhập email */}
        {!showAccountFound && (
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
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                setIsFocused(false); // Reset isFocused khi rời input
                if (!email || !isValidEmail(email)) {
                  setError("Please enter a valid email address");
                } else {
                  setError("");
                }
              }}
              className={`w-full px-4 pt-6 pb-2 text-base text-black border rounded-md focus:outline-none focus:ring-2 ${
                error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-black"
              }`}
            />
            {/* Hiển thị lỗi nếu có */}
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        )}

        {/* Nút CONTINUE */}
        {!showAccountFound && (
          <button
            onClick={handleContinue}
            className="w-full max-w-[325px] bg-black text-white py-3 rounded-md font-semibold mt-1 hover:bg-gray-800 transition"
          >
            CONTINUE
          </button>
        )}

        {/* Dòng JOIN MY AISH */}
        <div className="mt-15 mb-12 text-black font-semibold text-2xl text-center">
          JOIN MY AISH
        </div>
      </div>
    </div>
  );
} 