import { motion } from "framer-motion";
import { RefObject } from "react";

interface FilterSectionProps {
  isFilterOpen: boolean;
  filterRef: React.RefObject<HTMLDivElement>;
  selectedColors: string[];
  selectedSizes: string[];
  handleColorChange: (color: string) => void;
  handleSizeChange: (size: string) => void;
  handleCloseFilter: () => void;
  handleApplyFilter: () => void;
  colors: string[];
  sizes: string[];
  capitalizeFirstLetter: (str: string) => string;
  groupedColors: string[];
  title: string;
  colorLabel: string;
  sizeLabel: string;
  applyLabel: string;
  resetLabel: string;
  allColorsLabel: string;
  allSizesLabel: string;
}

export default function FilterSection({
  isFilterOpen,
  filterRef,
  selectedColors,
  selectedSizes,
  handleColorChange,
  handleSizeChange,
  handleCloseFilter,
  handleApplyFilter,
  colors,
  sizes,
  capitalizeFirstLetter,
  groupedColors,
  title,
  colorLabel,
  sizeLabel,
  applyLabel,
  resetLabel,
  allColorsLabel,
  allSizesLabel
}: FilterSectionProps) {
  return (
    <div
      ref={filterRef}
      className={`fixed inset-0 bg-white z-50 transform transition-transform duration-300 ease-in-out ${
        isFilterOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            onClick={handleCloseFilter}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-bold mb-2">{colorLabel}</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleColorChange("all")}
              className={`px-3 py-1 text-xs border ${
                selectedColors.length === 0
                  ? "bg-black text-white"
                  : "bg-white text-black"
              }`}
            >
              {allColorsLabel}
            </button>
            {groupedColors.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className={`px-3 py-1 text-xs border ${
                  selectedColors.includes(color)
                    ? "bg-black text-white"
                    : "bg-white text-black"
                }`}
              >
                {capitalizeFirstLetter(color)}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-bold mb-2">{sizeLabel}</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleSizeChange("all")}
              className={`px-3 py-1 text-xs border ${
                selectedSizes.length === 0
                  ? "bg-black text-white"
                  : "bg-white text-black"
              }`}
            >
              {allSizesLabel}
            </button>
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => handleSizeChange(size)}
                className={`px-3 py-1 text-xs border ${
                  selectedSizes.includes(size)
                    ? "bg-black text-white"
                    : "bg-white text-black"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => {
              handleColorChange("all");
              handleSizeChange("all");
            }}
            className="px-4 py-2 text-sm border border-black"
          >
            {resetLabel}
          </button>
          <button
            onClick={handleApplyFilter}
            className="px-4 py-2 text-sm bg-black text-white"
          >
            {applyLabel}
          </button>
        </div>
      </div>
    </div>
  );
}