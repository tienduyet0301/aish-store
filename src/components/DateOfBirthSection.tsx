"use client";

import { motion } from "framer-motion";

interface FormData {
  day: string;
  month: string;
  year: string;
}

interface Errors {
  date?: string;
}

interface Touched {
  [key: string]: boolean;
}

interface DateOfBirthSectionProps {
  formData: FormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors: Errors;
  touched: Touched;
  setTouched: React.Dispatch<React.SetStateAction<Touched>>;
}

export function DateOfBirthSection({
  formData,
  handleInputChange,
  errors,
  touched,
  setTouched,
}: DateOfBirthSectionProps) {
  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  return (
    <div className="mt-2">
      <label className="block text-xs md:text-sm text-gray-500 mb-2">DATE OF BIRTH*</label>
      <div className="grid grid-cols-3 gap-2">
        <div className="relative">
          <input
            type="text"
            name="day"
            value={formData.day}
            onChange={handleInputChange}
            onBlur={() => handleBlur("day")}
            placeholder="DD"
            maxLength={2}
            className={`w-full px-4 py-2 text-sm text-black border rounded-none focus:outline-none focus:ring-2 
              ${errors.date && touched.day ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-black"}`}
            aria-label="Day"
            title="Day"
          />
        </div>
        <div className="relative">
          <input
            type="text"
            name="month"
            value={formData.month}
            onChange={handleInputChange}
            onBlur={() => handleBlur("month")}
            placeholder="MM"
            maxLength={2}
            className={`w-full px-4 py-2 text-sm text-black border rounded-none focus:outline-none focus:ring-2 
              ${errors.date && touched.month ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-black"}`}
            aria-label="Month"
            title="Month"
          />
        </div>
        <div className="relative">
          <input
            type="text"
            name="year"
            value={formData.year}
            onChange={handleInputChange}
            onBlur={() => handleBlur("year")}
            placeholder="YYYY"
            maxLength={4}
            className={`w-full px-4 py-2 text-sm text-black border rounded-none focus:outline-none focus:ring-2 
              ${errors.date && touched.year ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-black"}`}
            aria-label="Year"
            title="Year"
          />
        </div>
      </div>
      {errors.date && (touched.day || touched.month || touched.year) && (
        <p className="text-red-400 text-[7px] md:text-xs mt-1">{errors.date}</p>
      )}
    </div>
  );
} 