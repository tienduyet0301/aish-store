"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FiEdit2 } from "react-icons/fi";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import Head from "next/head";
import { PasswordField } from "./PasswordField";
import { DateOfBirthSection } from "./DateOfBirthSection";
import { validatePassword, validateEmail } from "@/utils/validation";

interface RegisterFormProps {
  initialEmail: string;
  initialName: string;
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

interface Errors {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  date?: string;
  receiveUpdates?: string;
  api?: string;
  [key: string]: string | undefined;
}

interface Touched {
  [key: string]: boolean;
}

export default function RegisterForm({ initialEmail, initialName }: RegisterFormProps) {
  const router = useRouter();
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [isEmailEditable, setIsEmailEditable] = useState(false);
  const [isEditingIcon, setIsEditingIcon] = useState(false);
  const [isFocused, setIsFocused] = useState<{ [key: string]: boolean }>({});
  const [touched, setTouched] = useState<Touched>({});
  const [formData, setFormData] = useState<FormData>({
    email: initialEmail,
    password: "",
    firstName: "",
    lastName: "",
    day: "",
    month: "",
    year: "",
    receiveUpdates: false,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleFocus = useCallback((field: string) => {
    setIsFocused((prev) => ({ ...prev, [field]: true }));
  }, []);

  const handleBlur = useCallback((field: string) => {
    setIsFocused((prev) => ({ ...prev, [field]: false }));
    setTouched((prev) => ({ ...prev, [field]: true }));
    const newErrors = validateForm(formData);
    setErrors(newErrors);
  }, [formData]);

  const handleEditEmail = useCallback(() => {
    setIsEmailEditable(true);
    setIsEditingIcon(true);
    setTimeout(() => {
      emailInputRef.current?.focus();
      setIsEditingIcon(false);
    }, 500);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }, [touched]);

  const handleCheckboxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  }, []);

  const validatePassword = (password: string) => {
    return {
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  };

  const validateForm = (formData: FormData): Errors => {
    const errors: Errors = {};
    const passwordValid = validatePassword(formData.password);

    if (!formData.email || !validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!formData.password || !Object.values(passwordValid).every(Boolean)) {
      errors.password = "Please enter a valid password";
    }
    if (!formData.firstName) {
      errors.firstName = "Please enter your first name";
    }
    if (!formData.lastName) {
      errors.lastName = "Please enter your last name";
    }
    if (!formData.day || !formData.month || !formData.year) {
      errors.date = "Please enter your full date of birth";
    }
    if (!formData.receiveUpdates) {
      errors.receiveUpdates = "You must agree to receive updates";
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validate form
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.firstName + ' ' + formData.lastName,
          email: formData.email,
          password: formData.password,
          day: formData.day,
          month: formData.month,
          year: formData.year,
          receiveUpdates: formData.receiveUpdates,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Đăng ký thất bại");
      }

      // Chuyển hướng đến trang đăng nhập sau khi đăng ký thành công
      router.push("/login");
    } catch (error) {
      setErrors({ api: error instanceof Error ? error.message : "Có lỗi xảy ra" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <>
      <Head>
        <title>Register | My AISH</title>
      </Head>
      <div className="min-h-screen bg-white flex flex-col items-center pt-12 md:pt-20">
        <h1 className="text-3xl md:text-5xl font-bold text-black text-center my-4 md:my-8 tracking-wide whitespace-nowrap">
          MY AISH ACCOUNT
        </h1>
        <div className="w-full max-w-[280px] md:max-w-[350px] flex flex-col gap-4">
          <button 
            onClick={handleGoogleSignIn}
            className="flex items-center justify-center w-full md:w-[350px] border border-black text-black py-2.5 md:py-4 rounded-none text-xs md:text-base font-normal tracking-wide hover:bg-gray-100 transition mb-2"
            style={{ fontFamily: 'inherit', letterSpacing: '1px' }}
          >
            <FcGoogle className="text-lg md:text-2xl mr-2 md:mr-3" />
            <span className="text-xs md:text-base font-semibold tracking-widest">CONTINUE WITH GOOGLE</span>
          </button>
          <div className="flex items-center justify-center mt-2 md:mt-3">
            <span className="text-black font-semibold text-sm md:text-base">OR</span>
          </div>
          <div className="flex justify-center w-full">
            <h2 className="text-black text-[10px] md:text-3xl font-semibold text-center md:whitespace-nowrap">
              CONTINUE WITH YOUR EMAIL ADDRESS
            </h2>
          </div>
          <div className="flex justify-center w-full text-center px-2 md:px-4 md:whitespace-nowrap">
            <p className="text-black text-[7px] md:text-xs font-semibold">
              SIGN IN WITH YOUR EMAIL AND PASSWORD OR CREATE A PROFILE IF YOU ARE NEW
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Email Field */}
            <div className="relative w-full mt-2">
              <label htmlFor="email" className="sr-only">Email</label>
              <motion.label
                className={`absolute text-xs md:text-sm bg-white px-1 z-10 ${errors.email ? "text-red-400" : "text-gray-500"}`}
                initial={{ 
                  top: formData.email ? "5px" : "50%", 
                  left: formData.email ? "4px" : "12px",
                  scale: formData.email ? 0.75 : 1,
                  translateY: formData.email ? "0" : "-50%",
                }}
                animate={{
                  top: isFocused.email || formData.email ? "5px" : "50%",
                  left: isFocused.email || formData.email ? "4px" : "12px",
                  scale: isFocused.email || formData.email ? 0.75 : 1,
                  translateY: isFocused.email || formData.email ? "0" : "-50%",
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                htmlFor="email"
              >
                EMAIL*
              </motion.label>
              <div className="relative">
                <input
                  ref={emailInputRef}
                  type="text"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={() => handleFocus("email")}
                  onBlur={() => handleBlur("email")}
                  className={`w-full px-4 pt-6 pb-2 text-sm text-black border rounded-none focus:outline-none focus:ring-2 
                    ${errors.email ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-black"}`}
                  readOnly={!isEmailEditable}
                  aria-label="Email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  title="Email"
                />
                <motion.div
                  animate={{ rotate: isEditingIcon ? 20 : 0 }}
                  transition={{ duration: 0.3, yoyo: 3 }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                  onClick={handleEditEmail}
                  aria-label="Edit email"
                  title="Edit email"
                  tabIndex={0}
                  role="button"
                >
                  <FiEdit2 className="text-gray-500 w-4 h-4 md:w-5 md:h-5" />
                </motion.div>
              </div>
              {errors.email && touched.email && (
                <p className="text-red-400 text-[7px] md:text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* First Name and Last Name Fields */}
            {"firstName lastName".split(" ").map((field) => (
              <div key={field} className="relative w-full mt-2">
                <label htmlFor={field} className="sr-only">{field === "firstName" ? "First Name" : "Last Name"}</label>
                <motion.label
                  className={`absolute text-xs md:text-sm bg-white px-1 z-10 ${errors[field] ? "text-red-400" : "text-gray-500"}`}
                  initial={{ 
                    top: formData[field as keyof FormData] ? "5px" : "50%", 
                    left: formData[field as keyof FormData] ? "4px" : "12px",
                    scale: formData[field as keyof FormData] ? 0.75 : 1,
                    translateY: formData[field as keyof FormData] ? "0" : "-50%",
                  }}
                  animate={{
                    top: isFocused[field] || formData[field as keyof FormData] ? "5px" : "50%",
                    left: isFocused[field] || formData[field as keyof FormData] ? "4px" : "12px",
                    scale: isFocused[field] || formData[field as keyof FormData] ? 0.75 : 1,
                    translateY: isFocused[field] || formData[field as keyof FormData] ? "0" : "-90%",
                  }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  htmlFor={field}
                >
                  {field === "firstName" ? "FIRST NAME*" : "LAST NAME*"}
                </motion.label>
                <div className="relative">
                  <input
                    type="text"
                    id={field}
                    name={field}  
                    value={(formData[field as keyof FormData] as string) || ""}
                    onChange={handleInputChange}
                    onFocus={() => handleFocus(field)}
                    onBlur={() => handleBlur(field)}
                    className={`w-full px-4 pt-6 pb-2 text-sm text-black border rounded-none focus:outline-none focus:ring-2 
                      ${errors[field] ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-black"}`}
                    aria-label={field === "firstName" ? "First Name" : "Last Name"}
                    autoComplete={field === "firstName" ? "given-name" : "family-name"}
                    title={field === "firstName" ? "First Name" : "Last Name"}
                  />
                </div>
                {errors[field] && touched[field] && (
                  <p className="text-red-400 text-[7px] md:text-xs mt-1">{errors[field]}</p>
                )}
              </div>
            ))}

            {/* Password Field */}
            <div className="relative w-full mt-2">
              <label htmlFor="password" className="sr-only">Password</label>
              <PasswordField 
                value={formData.password}
                onChange={handleInputChange}
                isFocused={isFocused.password}
                onFocus={() => handleFocus("password")}
                onBlur={() => handleBlur("password")}
                hasError={!!errors.password && touched.password}
              />
            </div>

            {/* Date of Birth Section */}
            <DateOfBirthSection 
              formData={formData} 
              handleInputChange={handleInputChange} 
              errors={errors} 
              touched={touched} 
              setTouched={setTouched}
            />

            {/* Checkbox for Updates */}
            <div className="mt-2 w-full">
              <label className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  name="receiveUpdates"
                  checked={formData.receiveUpdates}
                  onChange={handleCheckboxChange}
                  className="form-checkbox h-3 w-3 md:h-4 md:w-4 text-black border-gray-300 rounded focus:ring-black mt-1"
                  aria-label="Receive updates"
                  title="Receive updates"
                  required
                />
                <span className="text-[8px] md:text-[10px] text-gray-700 flex-1">
                  I would like to receive updates (including by email, SMS, MMS, social media, phone...) about AISH new activities, exclusive products, tailored services and to have a personalised client experience based on my interests.
                </span>
              </label>
              {errors.receiveUpdates && touched.receiveUpdates && (
                <p className="text-red-400 text-[7px] md:text-xs mt-1">{errors.receiveUpdates}</p>
              )}
            </div>

            {/* Continue Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full md:w-[350px] flex justify-center py-2.5 md:py-4 border border-transparent text-xs md:text-base font-normal tracking-wide text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
                style={{ fontFamily: 'inherit', letterSpacing: '1px' }}
              >
                <span className="text-xs md:text-base font-semibold tracking-widest">
                  {isLoading ? "REGISTERING..." : "REGISTER"}
                </span>
              </button>
            </div>

            {/* Dòng JOIN MY AISH */}
            <div className="mt-8 md:mt-15 mb-8 md:mb-12 text-black font-semibold text-xl md:text-2xl text-center">
              JOIN MY AISH
            </div>

            {/* Hiển thị lỗi API nếu có */}
            {errors.api && (
              <p className="text-red-400 text-[7px] md:text-xs mt-1">{errors.api}</p>
            )}
          </form>
        </div>
      </div>
    </>
  );
} 