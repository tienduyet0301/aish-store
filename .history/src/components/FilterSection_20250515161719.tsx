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
  allSizesLabel,
}: FilterSectionProps) {
  return (
    isFilterOpen && (
      <motion.div
        ref={filterRef}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-200 shadow-2xl p-10 z-50 rounded-lg max-w-4xl w-full"
      >
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="w-full">
            <h3 className="text-base uppercase tracking-wider mb-5 border-b pb-2 text-black">Colour</h3>
            <div className="grid grid-cols-2 gap-y-5 gap-x-12">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selectedColors.length === 0}
                    onChange={() => handleColorChange("all")}
                    className="appearance-none h-4 w-4 border border-gray-300 rounded checked:bg-black checked:border-black focus:outline-none transition cursor-pointer"
                  />
                  {selectedColors.length === 0 && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 text-white absolute"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-[11px] font-normal tracking-wider text-black group-hover:text-gray-700">All</span>
              </label>
              {colors.map((color) => (
                <label key={color} className="flex items-center space-x-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={selectedColors.includes(color)}
                      onChange={() => handleColorChange(color)}
                      className="appearance-none h-4 w-4 border border-gray-300 rounded checked:bg-black checked:border-black focus:outline-none transition cursor-pointer"
                    />
                    {selectedColors.includes(color) && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 text-white absolute"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-[11px] font-normal tracking-wider text-black group-hover:text-gray-700">
                    {capitalizeFirstLetter(color)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="w-full">
            <h3 className="text-base uppercase tracking-wider mb-5 border-b pb-2 text-black">Size</h3>
            <div className="grid grid-cols-2 gap-y-5 gap-x-12">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selectedSizes.length === 0}
                    onChange={() => handleSizeChange("all")}
                    className="appearance-none h-4 w-4 border border-gray-300 rounded checked:bg-black checked:border-black focus:outline-none transition cursor-pointer"
                  />
                  {selectedSizes.length === 0 && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 text-white absolute"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-[11px] font-normal tracking-wider text-black group-hover:text-gray-700">All</span>
              </label>
              {sizes.map((size) => (
                <label key={size} className="flex items-center space-x-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={selectedSizes.includes(size)}
                      onChange={() => handleSizeChange(size)}
                      className="appearance-none h-4 w-4 border border-gray-300 rounded checked:bg-black checked:border-black focus:outline-none transition cursor-pointer"
                    />
                    {selectedSizes.includes(size) && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 text-white absolute"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-[11px] font-normal tracking-wider text-black group-hover:text-gray-700">
                    {size.toUpperCase()}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-600 text-center mb-4">You can select several options at once.</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleApplyFilter}
              className="bg-black text-white text-xs uppercase tracking-wider px-8 py-2 hover:bg-gray-800 transition duration-300"
            >
              APPLY
            </button>
            <button
              onClick={handleCloseFilter}
              className="border border-black text-black text-xs uppercase tracking-wider px-8 py-2 hover:bg-gray-100 transition duration-300"
            >
              CLOSE
            </button>
          </div>
        </div>
      </motion.div>
    )
  );
}