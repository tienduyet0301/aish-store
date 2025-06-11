"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FiEye, FiEyeOff } from "react-icons/fi";

interface PasswordFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  hasError: boolean;
}

export function PasswordField({
  value,
  onChange,
  isFocused,
  onFocus,
  onBlur,
  hasError,
}: PasswordFieldProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <>
      <motion.label
        className={`absolute text-xs md:text-sm bg-white px-1 z-10 ${hasError ? "text-red-400" : "text-gray-500"}`}
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
        htmlFor="password"
      >
        PASSWORD*
      </motion.label>
      <div className="relative">
        <input
          type={isPasswordVisible ? "text" : "password"}
          id="password"
          name="password"
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          className={`w-full px-4 pt-6 pb-2 text-sm text-black border rounded-none focus:outline-none focus:ring-2 
            ${hasError ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-black"}`}
          aria-label="Password"
          autoComplete="new-password"
          title="Password"
        />
        <button
          type="button"
          onClick={() => setIsPasswordVisible(!isPasswordVisible)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          aria-label={isPasswordVisible ? "Hide password" : "Show password"}
          title={isPasswordVisible ? "Hide password" : "Show password"}
        >
          {isPasswordVisible ? (
            <FiEyeOff className="w-4 h-4 md:w-5 md:h-5" />
          ) : (
            <FiEye className="w-4 h-4 md:w-5 md:h-5" />
          )}
        </button>
      </div>
    </>
  );
} 