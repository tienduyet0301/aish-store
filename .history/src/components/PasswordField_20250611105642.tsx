"use client";

import { useState, useEffect } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai";

interface PasswordFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hasError: boolean;
  onBlur: () => void; // Keeping onBlur for touched state
}

interface PasswordValidation {
  hasLength: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

const validatePassword = (password: string): PasswordValidation => ({
  hasLength: password.length >= 8,
  hasNumber: /\d/.test(password),
  hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
});

export function PasswordField({
  value,
  onChange,
  hasError,
  onBlur,
}: PasswordFieldProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordTouched, setIsPasswordTouched] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>(validatePassword(value));

  useEffect(() => {
    setPasswordValidation(validatePassword(value));
  }, [value]);

  const handlePasswordBlur = () => {
    setIsPasswordTouched(true);
    onBlur();
  };

  const isValid = Object.values(passwordValidation).every(Boolean);
  const showError = hasError || (isPasswordTouched && !isValid);

  return (
    <div className="relative w-full mt-2">
      <div className="relative">
        <input
          type={isPasswordVisible ? "text" : "password"}
          id="password"
          name="password"
          value={value}
          onChange={onChange}
          onFocus={() => {}} // No action needed for placeholder
          onBlur={handlePasswordBlur}
          placeholder="PASSWORD*"
          className={`w-full px-4 py-4 text-sm text-black border rounded-none focus:outline-none focus:ring-2 
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
      
      {/* Password Requirements */}
      <div className="mt-1 space-y-1 pl-1">
        {[
          { key: "hasLength", text: "Please enter at least 8 characters" },
          { key: "hasNumber", text: "Please enter at least one number" },
          { key: "hasSpecialChar", text: "Please enter one special character (!@#$%^&*(),.?\":{}|<>]" },
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
}