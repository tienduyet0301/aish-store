"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

export default function LoginPage() {
  const router = useRouter();
  const [isFocused, setIsFocused] = useState({ email: false, password: false });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);

  // Giả lập danh sách email đã đăng ký
  const registeredEmails = ["test@example.com", "user@gmail.com"];

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

  // Xử lý khi nhập email
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setError("");

    // Kiểm tra email có tồn tại không
    if (isValidEmail(newEmail)) {
      setIsExistingUser(registeredEmails.includes(newEmail));
    } else {
      setIsExistingUser(false);
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

    if (isExistingUser) {
      if (!password) {
        setError("Please enter your password");
        return;
      }
      // TODO: Xử lý đăng nhập với email và password
      router.push("/dashboard");
    } else {
      router.push(`/register?email=${email}`);
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

        {/* Ô nhập email */}
        <div className="relative w-full mt-4">
          {/* Label động */}
          <motion.label
            className={`absolute text-sm bg-white px-1 left-4 ${error ? "text-red-500" : "text-gray-500"}`}
            animate={{
              top: isFocused.email || email ? "4px" : "40%",
              left: "8px",
              scale: isFocused.email || email ? 0.75 : 1,
              translateY: isFocused.email || email ? "0" : "-50%",
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
            onFocus={() => setIsFocused(prev => ({ ...prev, email: true }))}
            onBlur={() => {
              setIsFocused(prev => ({ ...prev, email: false }));
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
        </div>

        {/* Ô nhập mật khẩu (chỉ hiện khi email đã tồn tại) */}
        {isExistingUser && (
          <div className="relative w-full mt-4">
            <motion.label
              className={`absolute text-sm bg-white px-1 left-4 ${error ? "text-red-500" : "text-gray-500"}`}
              animate={{
                top: isFocused.password || password ? "4px" : "40%",
                left: "8px",
                scale: isFocused.password || password ? 0.75 : 1,
                translateY: isFocused.password || password ? "0" : "-50%",
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              PASSWORD*
            </motion.label>

            <div className="relative">
              <input
                type={isPasswordVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsFocused(prev => ({ ...prev, password: true }))}
                onBlur={() => setIsFocused(prev => ({ ...prev, password: false }))}
                className={`w-full px-4 pt-6 pb-2 text-base text-black border rounded-md focus:outline-none focus:ring-2 ${
                  error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-black"
                }`}
              />
              <div
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              >
                {isPasswordVisible ? (
                  <AiOutlineEye className="text-gray-500" />
                ) : (
                  <AiOutlineEyeInvisible className="text-gray-500" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Hiển thị lỗi nếu có */}
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

        {/* Nút CONTINUE */}
        <button
          onClick={handleContinue}
          className="w-full max-w-[325px] bg-black text-white py-3 rounded-md font-semibold mt-1 hover:bg-gray-800 transition"
        >
          CONTINUE
        </button>

        {/* Dòng JOIN MY AISH */}
        <div className="mt-15 mb-12 text-black font-semibold text-2xl text-center">
          JOIN MY AISH
        </div>
      </div>
    </div>
  );
} 