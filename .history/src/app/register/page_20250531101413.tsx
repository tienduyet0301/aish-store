"use client";
import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { FiEdit2 } from "react-icons/fi";
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineCheck, AiOutlineClose } from "react-icons/ai";
import { motion } from "framer-motion";
import Head from 'next/head';
import { signIn } from "next-auth/react";
import Image from "next/image";
import RegisterForm from '@/components/RegisterForm';

interface PasswordValidation {
  hasLength: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

interface FormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  day: string;
  month: string;
  year: string;
  receiveUpdates: boolean;
}

interface Touched {
  [key: string]: boolean;
}

interface Errors {
  [key: string]: string | undefined;
}

// Password validation logic
const validatePassword = (password: string): PasswordValidation => ({
  hasLength: password.length >= 8,
  hasNumber: /\d/.test(password),
  hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
});

// Email validation logic
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

interface PasswordFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  hasError: boolean;
}

// Password Field Component
const PasswordField: React.FC<PasswordFieldProps> = ({ value, onChange, isFocused, onFocus, onBlur, hasError }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordTouched, setIsPasswordTouched] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>(validatePassword(value));

  useEffect(() => {
    setPasswordValidation(validatePassword(value));
  }, [value]);

  const handlePasswordBlur = useCallback(() => {
    setIsPasswordTouched(true);
    onBlur();
  }, [onBlur]);

  const isValid = Object.values(passwordValidation).every(Boolean);
  const showError = hasError || (isPasswordTouched && !isValid);

  return (
    <div className="relative w-full mt-2">
      <div className="relative">
        <motion.label
          className={`absolute text-sm bg-white px-1 z-10 ${showError ? "text-red-400" : "text-gray-500"}`}
          initial={{ 
            top: value ? "5px" : "50%", 
            left: value ? "4px" : "12px",
            scale: value ? 0.75 : 1,
            translateY: value ? "0" : "-50%",
          }}
          animate={{
            top: isFocused || value ? "5px" : "50%",
            left: isFocused || value ? "4px" : "12px",
            scale: isFocused || value ? 0.75 : 1,
            translateY: isFocused || value ? "0" : "-50%",
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          PASSWORD*
        </motion.label>
        <input
          type={isPasswordVisible ? "text" : "password"}
          name="password"
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={handlePasswordBlur}
          className={`w-full px-4 pt-6 pb-2 text-sm text-black border rounded-none focus:outline-none focus:ring-2 
            ${isValid && isPasswordTouched ? "border-green-500 focus:ring-green-500" : 
              showError ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-black"}`}
          title="Password"
          aria-label="Password"
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
      
      {/* Password Requirements */}
      <div className="mt-1 space-y-1 pl-1">
        {[
          { key: "hasLength", text: "Please enter at least 8 characters" },
          { key: "hasNumber", text: "Please enter at least one number" },
          { key: "hasSpecialChar", text: "Please enter one special character (!@#$%^&*(),.?\":{}|<>)" },
        ].map((req) => (
          <div key={req.key} className="flex items-center gap-2">
            {passwordValidation[req.key as keyof PasswordValidation] ? (
              <AiOutlineCheck className="text-green-500 min-w-[12px] w-3 h-3 md:min-w-[16px] md:w-4 md:h-4" />
            ) : (
              <AiOutlineClose className={`${isPasswordTouched ? "text-red-500" : "text-gray-400"} min-w-[12px] w-3 h-3 md:min-w-[16px] md:w-4 md:h-4`} />
            )}
            <p className={`text-[7px] md:text-xs ${passwordValidation[req.key as keyof PasswordValidation] ? "text-green-500" : isPasswordTouched ? "text-red-500" : "text-gray-500"}`}>
              {req.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

interface DateOfBirthSectionProps {
  formData: FormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors: Errors;
  touched: Touched;
  setTouched: React.Dispatch<React.SetStateAction<Touched>>;
}

// Date of Birth Section Component
const DateOfBirthSection: React.FC<DateOfBirthSectionProps> = ({ formData, handleInputChange, errors, touched, setTouched }) => {
  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const { value } = e.target;
    let newValue = value.replace(/\D/g, ""); // Chỉ cho phép nhập số

    // Giới hạn giá trị nhập
    if (type === "month" && Number(newValue) > 12) {
      newValue = "12";
    } else if (type === "day" && Number(newValue) > 31) {
      newValue = "31";
    } else if (type === "year" && Number(newValue) > 9999) {
      newValue = "9999";
    }

    // Cập nhật giá trị
    e.target.value = newValue;
    handleInputChange(e);
  };

  const isDateTouched = touched.day || touched.month || touched.year;
  const isDateValid = formData.day && formData.month && formData.year;
  const showError = isDateTouched && !isDateValid;

  return (
    <>
      <label className="text-gray-500 text-xs font-semibold mt-2">DATE OF BIRTH</label>
      <div className="flex gap-2">
        {["month", "day", "year"].map((type) => (
          <div key={type} className="w-1/3 flex flex-col relative">
            <motion.label
              className={`absolute text-sm bg-white px-1 z-10 ${showError ? "text-red-400" : "text-gray-500"}`}
              initial={{ 
                top: "50%", 
                left: "12px",
                scale: 1,
                translateY: "-50%",
              }}
              animate={{
                top: formData[type as keyof FormData] || touched[type] ? "5px" : "50%",
                left: formData[type as keyof FormData] || touched[type] ? "4px" : "12px",
                scale: formData[type as keyof FormData] || touched[type] ? 0.75 : 1,
                translateY: formData[type as keyof FormData] || touched[type] ? "0" : "-35%",
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {type.toUpperCase()}*
            </motion.label>
            <input
              type="text"
              name={type}
              placeholder={type === "month" ? "MM" : type === "day" ? "DD" : "YYYY"}
              value={(formData[type as keyof FormData] as string) || ""}
              onChange={(e) => handleDateInput(e, type)}
              onFocus={() => setTouched((prev) => ({ ...prev, [type]: true }))}
              onBlur={() => setTouched((prev) => ({ ...prev, [type]: true }))}
              className={`w-full pl-3.5 pt-6 pb-2 text-[10px] md:text-[11px] text-black border rounded-none focus:outline-none focus:ring-2 
                ${showError ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-black"}`}
              maxLength={type === "year" ? 4 : 2}
            />
          </div>
        ))}
      </div>
      {showError && (
        <p className="text-red-400 text-[7px] md:text-xs -mt-2.5 space-y-1 pl-1">Please enter a valid date of birth</p>
      )}
    </>
  );
};

function RegisterContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const name = searchParams.get("name") || "";

  return <RegisterForm initialEmail={email} initialName={name} />;
}

export default function RegisterPage() {
  return (
    <>
      <Head>
        <title>Register | My AISH</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 mt-10">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
          </div>
          <Suspense fallback={<div>Loading...</div>}>
            <RegisterContent />
          </Suspense>
        </div>
      </div>
    </>
  );
} 