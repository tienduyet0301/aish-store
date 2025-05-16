import { motion } from "framer-motion";
import { RefObject } from "react";

interface SortOption {
  value: string;
  label: string;
}

interface SortSectionProps {
  isSortOpen: boolean;
  sortRef: RefObject<HTMLDivElement | null>;
  selectedSort: string;
  handleSortChange: (value: string) => void;
  handleCloseSort: () => void;
  handleApplySort: () => void;
  sortOptions: SortOption[];
  hoveredButton?: string | null;
  activeButton?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function SortSection({
  isSortOpen,
  sortRef,
  selectedSort,
  handleSortChange,
  handleCloseSort,
  handleApplySort,
  sortOptions = [],
  hoveredButton,
  activeButton,
  onMouseEnter,
  onMouseLeave,
}: SortSectionProps) {
  const getSortOptionText = () => {
    if (!sortOptions || sortOptions.length === 0) return "";
    const found = sortOptions.find((opt) => opt.value === selectedSort);
    return found ? found.label : "";
  };

  return (
    <div className="inline-block" ref={sortRef}>
      <button
        onClick={handleApplySort}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className="text-[10px] sm:text-[10px] font-bold uppercase tracking-wider text-black hover:text-gray-600 flex items-center relative py-1"
      >
        <span className="px-1">Sort by: {getSortOptionText()}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-2 w-2 sm:h-3 sm:w-3 ml-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        <div className="absolute bottom-[-2px] left-0 right-0 h-[1px] overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ width: "100%", left: 0 }}
            animate={{ width: "100%", left: 0 }}
            transition={{ duration: 0 }}
          />
        </div>
      </button>

      {isSortOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="absolute right-0 mt-1 bg-white border border-gray-200 shadow-md z-10 min-w-[200px]"
        >
          <ul className="py-2">
            {sortOptions.map((option) => (
              <li key={option.value}>
                <button
                  onClick={() => {
                    handleSortChange(option.value);
                    handleCloseSort();
                  }}
                  className={`w-full text-left px-4 py-2 text-sm font-medium ${
                    selectedSort === option.value ? "bg-black text-white" : "text-black hover:bg-gray-100"
                  }`}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}