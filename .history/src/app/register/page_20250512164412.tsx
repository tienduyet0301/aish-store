"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { FiEdit2 } from "react-icons/fi";
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineCheck, AiOutlineClose } from "react-icons/ai";
import { motion } from "framer-motion";
import Head from 'next/head';

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
  confirmPassword: string;
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
          className={`w-full px-4 pt-6 pb-2 text-sm text-black border rounded-md focus:outline-none focus:ring-2 
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
              <AiOutlineCheck className="text-green-500 min-w-[16px]" />
            ) : (
              <AiOutlineClose className={`${isPasswordTouched ? "text-red-500" : "text-gray-400"} min-w-[16px]`} />
            )}
            <p className={`text-xs ${passwordValidation[req.key as keyof PasswordValidation] ? "text-green-500" : isPasswordTouched ? "text-red-500" : "text-gray-500"}`}>
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
              className={`w-full pl-3.5 pt-6 pb-2 text-sm text-black border rounded-md focus:outline-none focus:ring-2 
                ${showError ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-black"}`}
              maxLength={type === "year" ? 4 : 2}
            />
          </div>
        ))}
      </div>
      {showError && (
        <p className="text-red-400 text-xs -mt-2.5 space-y-1 pl-1">Please enter a valid date of birth</p>
      )}
    </>
  );
};

// Main Register Page Component
const RegisterPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromLogin = searchParams.get("email") || "";
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [isEmailEditable, setIsEmailEditable] = useState(false);
  const [isEditingIcon, setIsEditingIcon] = useState(false);
  const [isFocused, setIsFocused] = useState<{ [key: string]: boolean }>({});
  const [touched, setTouched] = useState<Touched>({});
  const [formData, setFormData] = useState<FormData>({
    email: emailFromLogin,
    password: "",
    firstName: "",
    lastName: "",
    day: "",
    month: "",
    year: "",
    receiveUpdates: false,
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (emailFromLogin) {
      setFormData((prev) => ({ ...prev, email: emailFromLogin }));
    }
  }, [emailFromLogin]);

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
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    return errors;
  };

  const handleContinue = async () => {
    console.log('Continue button clicked');
    console.log('Form data:', formData);
    
    const newTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Touched);
    setTouched(newTouched);
    
    const newErrors = validateForm(formData);
    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      console.log('No validation errors, proceeding with registration');
      setIsLoading(true);
      try {
        console.log('Sending registration request...');
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: formData.firstName + ' ' + formData.lastName,
            day: formData.day,
            month: formData.month,
            year: formData.year,
            receiveUpdates: formData.receiveUpdates,
          }),
        });
        const data = await res.json();
        console.log('Registration response:', data);
        
        if (res.ok) {
          console.log('Registration successful, redirecting to login');
          router.push("/login");
        } else {
          console.log('Registration failed:', data.error);
          setErrors({ ...newErrors, api: data.error || "Registration failed" });
        }
      } catch (error) {
        console.error('Registration error:', error);
        setErrors({ ...newErrors, api: "An error occurred during registration" });
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log('Validation failed, not proceeding with registration');
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setFormData((prev) => ({ ...prev, email: newEmail }));
    setErrors((prev) => ({ ...prev, email: undefined }));
    setIsExistingUser(false);

    if (validateEmail(newEmail)) {
      setIsExistingUser(true);
    }
  };

  return (
    <>
      <Head>
        <title>Register | My AISH</title>
      </Head>
      <div className="min-h-screen bg-white flex flex-col items-center pt-20">
        <h1 className="text-5xl font-bold text-black text-center my-8 tracking-wide">
          MY AISH ACCOUNT
        </h1>
        <div className="w-full max-w-xs flex flex-col gap-4">
          <button 
            className="flex items-center justify-center w-full border border-black text-black py-2 rounded-full text-sm font-semibold hover:bg-gray-100 transition"
            aria-label="Continue with Google"
            title="Continue with Google"
            type="button"
          >
            <FcGoogle className="text-3xl mr-2" /> CONTINUE WITH GOOGLE
          </button>
          <button 
            className="flex items-center justify-center w-full border border-black text-black py-2 rounded-full text-sm font-semibold hover:bg-gray-100 transition"
            aria-label="Continue with Apple"
            title="Continue with Apple"
            type="button"
          >
            <FaApple className="text-3xl mr-2" /> CONTINUE WITH APPLE
          </button>
          <div className="flex items-center justify-center mt-3">
            <span className="text-black font-semibold">OR</span>
          </div>
          <div className="flex justify-center w-full">
            <h2 className="text-black text-3xl font-semibold text-center whitespace-nowrap">
              CONTINUE WITH YOUR EMAIL ADDRESS
            </h2>
          </div>
          <div className="flex justify-center w-full text-center px-4 whitespace-nowrap">
            <p className="text-black text-2xs font-semibold">
            SIGN IN WITH YOUR EMAIL AND PASSWORD OR CREATE A PROFILE IF YOU ARE NEW
            </p>
          </div>

          {/* Email Field */}
          <div className="relative w-full mt-2">
            <label htmlFor="email" className="sr-only">Email</label>
            <motion.label
              className={`absolute text-sm bg-white px-1 z-10 ${errors.email ? "text-red-400" : "text-gray-500"}`}
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
                onChange={handleEmailChange}
                onFocus={() => handleFocus("email")}
                onBlur={() => handleBlur("email")}
                className={`w-full px-4 pt-6 pb-2 text-sm text-black border rounded-md focus:outline-none focus:ring-2 
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
                <FiEdit2 className="text-gray-500" />
              </motion.div>
            </div>
            {errors.email && touched.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* First Name and Last Name Fields */}
          {"firstName lastName".split(" ").map((field) => (
            <div key={field} className="relative w-full mt-2">
              <label htmlFor={field} className="sr-only">{field === "firstName" ? "First Name" : "Last Name"}</label>
              <motion.label
                className={`absolute text-sm bg-white px-1 z-10 ${errors[field] ? "text-red-400" : "text-gray-500"}`}
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
                  className={`w-full px-4 pt-6 pb-2 text-sm text-black border rounded-md focus:outline-none focus:ring-2 
                    ${errors[field] ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-black"}`}
                  aria-label={field === "firstName" ? "First Name" : "Last Name"}
                  autoComplete={field === "firstName" ? "given-name" : "family-name"}
                  title={field === "firstName" ? "First Name" : "Last Name"}
                />
              </div>
              {errors[field] && touched[field] && (
                <p className="text-red-400 text-xs mt-1">{errors[field]}</p>
              )}
            </div>
          ))}
          {/* Password Field sau last name */}
          <div className="relative w-full mt-4">
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
                className="form-checkbox h-4 w-8 text-black border-gray-300 rounded focus:ring-black mt-1"
                aria-label="Receive updates"
                title="Receive updates"
              />
              <span className="text-sm text-gray-700 flex-1">
                I would like to receive updates (including by email, SMS, MMS, social media, phone...) about AISH new activities, exclusive products, tailored services and to have a personalised client experience based on my interests.
              </span>
            </label>
            {errors.receiveUpdates && touched.receiveUpdates && (
              <p className="text-red-400 text-xs mt-1">{errors.receiveUpdates}</p>
            )}
          </div>

          {/* Continue Button */}
          <button 
            onClick={(e) => {
              e.preventDefault();
              handleContinue();
            }}
            disabled={isLoading}
            aria-label={isLoading ? "Processing registration" : "Continue with registration"}
            title={isLoading ? "Processing registration" : "Continue with registration"}
            className={`w-full max-w-[325px] bg-black text-white py-3 rounded-md font-semibold mt-2 hover:bg-gray-800 transition ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            type="submit"
          >
            {isLoading ? 'PROCESSING...' : 'CONTINUE'}
          </button>
          {/* Dòng JOIN MY AISH */}
          <div className="mt-15 mb-12 text-black font-semibold text-2xl text-center">
            JOIN MY AISH
          </div>

          {/* Hiển thị lỗi API nếu có */}
          {errors.api && (
            <p className="text-red-400 text-xs mt-1">{errors.api}</p>
          )}
        </div>
      </div>
    </>
  );
};

export default RegisterPage; 