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
    <div className="min-h-screen bg-white flex flex-col items-center pt-20">
      <h1 className="text-5xl font-bold text-black text-center my-8 tracking-wide">
        FORGOT PASSWORD
      </h1>

      <div className="w-full max-w-xs flex flex-col items-center gap-4">
        <div className="text-center mb-4">
          <p className="text-black text-sm">
            Don't worry! It happens. Please enter your email address and we'll send you a new password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-4">
          <div className="relative w-[350px]">
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
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={`w-[350px] px-4 pt-6 pb-2 text-base text-black border rounded-none focus:outline-none focus:ring-2 ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-black"}`}
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          </div>

          {message && (
            <div className="w-[350px] bg-green-50 p-4 border border-green-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">{message}</p>
                  <p className="mt-1 text-sm text-green-700">
                    Redirecting to login page in 3 seconds...
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="w-[350px] bg-red-50 p-4 border border-red-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-[350px] bg-black text-white py-4 rounded-none text-base font-normal tracking-wide hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'inherit', letterSpacing: '1px' }}
          >
            <span className="text-base font-semibold tracking-widest">
              {isLoading ? 'Sending...' : 'Send new password'}
            </span>
          </button>

          <Link
            href="/login"
            className="text-sm text-black hover:underline flex items-center justify-center mt-2"
          >
            <FiArrowLeft className="mr-2" />
            Back to login
          </Link>
        </form>
      </div>
    </div>
  );
}
