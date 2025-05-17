"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import { motion } from "framer-motion";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        // Chuyển hướng về trang đăng nhập sau 3 giây
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-12 md:pt-20">
      <h1 className="text-3xl md:text-5xl font-bold text-black text-center my-4 md:my-8 tracking-wide">
        FORGOT PASSWORD
      </h1>

      <div className="w-full max-w-[280px] md:max-w-[350px] flex flex-col items-center gap-4">
        <div className="text-center mb-4">
          <p className="text-black text-[8px] md:text-sm">
            Don&apos;t worry! It happens. Please enter your email address and we&apos;ll send you a new password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-4">
          <div className="relative w-full">
            <motion.label
              className={`absolute text-[10px] md:text-sm bg-white px-1 left-4 ${error ? "text-red-500" : "text-gray-500"}`}
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
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={`w-full px-4 pt-6 pb-2 text-[10px] md:text-base text-black border rounded-none focus:outline-none focus:ring-2 ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-black"}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          </div>

          {message && (
            <div className="w-full bg-green-50 p-3 md:p-4 border border-green-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 md:h-5 md:w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-[8px] md:text-sm font-medium text-green-800">{message}</p>
                  <p className="mt-1 text-[8px] md:text-sm text-green-700">
                    Redirecting to login page in 3 seconds...
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="w-full bg-red-50 p-3 md:p-4 border border-red-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 md:h-5 md:w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-[8px] md:text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-2.5 md:py-4 rounded-none text-xs md:text-base font-normal tracking-wide hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'inherit', letterSpacing: '1px' }}
          >
            <span className="text-xs md:text-base font-semibold tracking-widest">
              {isLoading ? 'SENDING...' : 'SEND NEW PASSWORD'}
            </span>
          </button>

          <Link
            href="/login"
            className="text-[8px] md:text-sm text-black hover:underline flex items-center justify-center mt-2"
          >
            <FiArrowLeft className="mr-2 w-3 h-3 md:w-4 md:h-4" />
            Back to login
          </Link>
        </form>
      </div>
    </div>
  );
}
