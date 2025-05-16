interface NoProductsMessageProps {
  resetFilters: () => void;
}

export default function NoProductsMessage({ resetFilters }: NoProductsMessageProps) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-sm">Không tìm thấy sản phẩm nào phù hợp với bộ lọc của bạn.</p>
        <button
          onClick={resetFilters}
          className="mt-4 text-xs uppercase text-black underline hover:text-gray-600"
        >
          Xóa tất cả bộ lọc
        </button>
      </div>
    );
  }