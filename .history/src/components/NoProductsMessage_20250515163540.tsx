interface NoProductsMessageProps {
  resetFilters: () => void;
}

export default function NoProductsMessage({ resetFilters }: NoProductsMessageProps) {
  return (
    <div className="min-h-[200px] flex flex-col justify-center items-center text-center py-8">
      <p className="text-black text-lg font-semibold mb-6">Chưa có sản phẩm bạn tìm kiếm</p>
      <button
        onClick={resetFilters}
        className="text-base px-6 py-2 border border-black rounded hover:bg-black hover:text-white transition font-medium"
      >
        Quay lại
      </button>
    </div>
  );
}