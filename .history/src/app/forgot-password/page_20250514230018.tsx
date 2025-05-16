"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^"]+\.[^"]+$/.test(email);
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
        setSuccess(data.message);
      } else {
        setError(data.error || "Có lỗi xảy ra, vui lòng thử lại sau.");
      }
    } catch (error) {
      setError("Có lỗi xảy ra, vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-32">
      <h1 className="text-2xl font-bold text-black text-center mb-6 tracking-wide">
        QUÊN MẬT KHẨU
      </h1>
      <div className="w-full max-w-xs flex flex-col gap-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <label htmlFor="forgot-email" className="text-sm text-black mb-1">Email</label>
          <input
            id="forgot-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={`w-full px-4 py-3 text-base text-black border border-gray-400 focus:outline-none focus:ring-2 focus:ring-black rounded-none`}
            autoComplete="email"
            required
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          {success && <p className="text-green-600 text-xs mt-1">{success}</p>}
          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-none font-semibold mt-1 hover:bg-gray-800 transition"
            disabled={isLoading}
          >
            {isLoading ? "Đang gửi..." : "GỬI HƯỚNG DẪN"}
          </button>
        </form>
        <div className="mt-6 text-center">
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
