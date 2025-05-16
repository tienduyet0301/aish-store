"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

export default function SearchBar({ isSearchOpen, setIsSearchOpen }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsSearchOpen]);

  return (
    <motion.div
      ref={searchRef}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="absolute top-[55px] right-0 w-full sm:w-1/2 h-[10vh] bg-white shadow-md p-4 flex flex-col" // Full màn ở mobile
    >
      <div className="relative w-full flex items-center gap-2">
        <div className="relative flex-1">
          {searchQuery === "" && (
            <motion.span
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 font-semibold text-xs pointer-events-none"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              What are you looking for?
            </motion.span>
          )}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full pt-2 pb-2 text-sm text-black font-semibold focus:outline-none border-b-2 border-gray-300 pl-3"
          />
          <motion.span
            className="absolute left-0 bottom-0 h-[2px] bg-black"
            initial={{ width: "0%" }}
            animate={isFocused ? { width: "100%" } : { width: "0%" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
        <button
          className="text-gray-700 text-sm font-semibold px-2 relative group"
          onClick={() => {
            setIsSearchOpen(false);
            setSearchQuery("");
          }}
        >
          Cancel
          <span className="absolute left-1/2 bottom-0 h-[2px] bg-black transition-all duration-300 w-0 group-hover:w-[70%] -translate-x-1/2"></span>
        </button>
      </div>
      <div className="flex-1"></div>
    </motion.div>
  );
}