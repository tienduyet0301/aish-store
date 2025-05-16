declare module './ProductImage' {
  interface ProductImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
  }
  const ProductImage: React.FC<ProductImageProps>;
  export default ProductImage;
}

declare module './ProductDetailImage' {
  interface ProductDetailImageProps {
    src: string;
    alt: string;
    className?: string;
  }
  const ProductDetailImage: React.FC<ProductDetailImageProps>;
  export default ProductDetailImage;
} 