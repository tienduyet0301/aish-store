import { useState } from "react";

interface SizeSelectorProps {
  quantityM: number;
  quantityL: number;
  quantityXL: number;
  onSizeSelect: (size: string | null) => void;
  selectedSize: string | null;
}

export const SizeSelector = ({
  quantityM,
  quantityL,
  quantityXL,
  onSizeSelect,
  selectedSize,
}: SizeSelectorProps) => {
  const sizes = [
    { label: "M", quantity: quantityM },
    { label: "L", quantity: quantityL },
    { label: "XL", quantity: quantityXL },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <button
            key={size.label}
            onClick={() => onSizeSelect(size.label)}
            disabled={size.quantity <= 0}
            className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors
              ${
                selectedSize === size.label
                  ? "bg-black text-white border-black"
                  : "border-gray-300 text-gray-700 hover:border-black"
              }
              ${
                size.quantity <= 0
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }
            `}
          >
            {size.label} - Còn {size.quantity} sản phẩm
          </button>
        ))}
      </div>
      {selectedSize && (
        <p className="text-sm text-gray-500">
          Đã chọn size: {selectedSize}
        </p>
      )}
    </div>
  );
}; 