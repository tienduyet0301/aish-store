"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useAddress } from "@/context/AddressContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useCheckout } from "@/context/CheckoutContext";

const shippingSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
}

export default function ShippingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { cartItems, total } = useCart();
  const { address, setAddress } = useAddress();
  const { setShippingInfo } = useCheckout();
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
  });

  useEffect(() => {
    if (session?.user?.email) {
      setValue('email', session.user.email);
    }
  }, [session, setValue]);

  useEffect(() => {
    if (cartItems.length === 0) {
      router.push("/cart");
    }
  }, [cartItems, router]);

  const onSubmit = async (data: ShippingFormData) => {
    if (!session) {
      setIsLoading(true);
      try {
        const result = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        if (result?.error) {
          toast.error("Email hoặc mật khẩu không đúng");
          return;
        }

        toast.success("Đăng nhập thành công");
        setShowLoginForm(false);
      } catch (error) {
        toast.error("Có lỗi xảy ra khi đăng nhập");
      } finally {
        setIsLoading(false);
      }
    } else {
      handleContinue();
    }
  };

  const handleContinue = () => {
    if (!address.fullName || !address.phone || !address.province || !address.district || !address.ward || !address.detail) {
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng");
      return;
    }

    if (!session?.user?.email) {
      toast.error("Vui lòng đăng nhập để tiếp tục");
      return;
    }

    setShippingInfo({
      email: session.user.email,
      fullName: address.fullName,
      phone: address.phone,
      province: address.province,
      district: address.district,
      ward: address.ward,
      detail: address.detail,
    });

    router.push("/checkout/payment");
  };

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Form bên trái */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-8">THÔNG TIN GIAO HÀNG</h1>

            {/* Phần đăng nhập */}
            {!session && !showLoginForm ? (
              <div className="mb-8 p-4 border border-gray-200">
                <p className="text-sm mb-4">Bạn đã có tài khoản? <button onClick={() => setShowLoginForm(true)} className="text-black underline">Đăng nhập</button></p>
              </div>
            ) : !session && showLoginForm ? (
              <form onSubmit={handleSubmit(onSubmit)} className="mb-8 p-4 border border-gray-200">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    {...register("email")}
                    className="w-full p-2 border border-gray-300 focus:outline-none focus:border-black"
                    placeholder="Email của bạn"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Mật khẩu</label>
                  <input
                    type="password"
                    {...register("password")}
                    className="w-full p-2 border border-gray-300 focus:outline-none focus:border-black"
                    placeholder="Mật khẩu của bạn"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-black text-white py-2 font-medium hover:bg-gray-900 transition"
                >
                  {isLoading ? "Đang xử lý..." : "Đăng nhập"}
                </button>
              </form>
            ) : (
              <div className="mb-8 p-4 border border-gray-200">
                <p className="text-sm">Đã đăng nhập với email: <span className="font-medium">{session.user?.email}</span></p>
              </div>
            )}

            {/* Form thông tin giao hàng */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Họ và tên</label>
                <input
                  type="text"
                  value={address.fullName}
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                  className="w-full p-2 border border-gray-300 focus:outline-none focus:border-black"
                  placeholder="Họ và tên của bạn"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Số điện thoại</label>
                <input
                  type="tel"
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  className="w-full p-2 border border-gray-300 focus:outline-none focus:border-black"
                  placeholder="Số điện thoại của bạn"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tỉnh/Thành phố</label>
                <input
                  type="text"
                  value={address.province}
                  onChange={(e) => setAddress({ ...address, province: e.target.value })}
                  className="w-full p-2 border border-gray-300 focus:outline-none focus:border-black"
                  placeholder="Tỉnh/Thành phố"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Quận/Huyện</label>
                <input
                  type="text"
                  value={address.district}
                  onChange={(e) => setAddress({ ...address, district: e.target.value })}
                  className="w-full p-2 border border-gray-300 focus:outline-none focus:border-black"
                  placeholder="Quận/Huyện"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phường/Xã</label>
                <input
                  type="text"
                  value={address.ward}
                  onChange={(e) => setAddress({ ...address, ward: e.target.value })}
                  className="w-full p-2 border border-gray-300 focus:outline-none focus:border-black"
                  placeholder="Phường/Xã"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Địa chỉ chi tiết</label>
                <textarea
                  value={address.detail}
                  onChange={(e) => setAddress({ ...address, detail: e.target.value })}
                  className="w-full p-2 border border-gray-300 focus:outline-none focus:border-black"
                  placeholder="Số nhà, tên đường, tên khu phố..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Order summary bên phải */}
          <div className="md:w-96">
            <div className="border border-gray-200 p-6">
              <h2 className="text-lg font-bold mb-4">ĐƠN HÀNG CỦA BẠN</h2>
              <div className="space-y-4">
                {cartItems.map((item: CartItem) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-20 h-20 relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-600">Size: {item.size}</p>
                      <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                      <p className="text-sm font-medium">
                        {(item.price * item.quantity).toLocaleString("vi-VN")} VND
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 my-4 pt-4">
                <div className="flex justify-between mb-2">
                  <span>Tạm tính</span>
                  <span>{total.toLocaleString("vi-VN")} VND</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Phí vận chuyển</span>
                  <span>Miễn phí</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Tổng cộng</span>
                  <span>{total.toLocaleString("vi-VN")} VND</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleContinue}
                className="w-full bg-black text-white py-3 font-medium hover:bg-gray-900 transition"
              >
                TIẾP TỤC THANH TOÁN
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 