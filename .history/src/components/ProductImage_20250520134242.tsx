import CloudinaryImage from './CloudinaryImage';

interface ProductImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function ProductImage({ src, alt, width, height, className }: ProductImageProps) {
  return (
    <div className={`relative ${className}`}>
      <CloudinaryImage
        src={src}
        alt={alt}
        width={width || 300}
        height={height || 400}
        className="object-cover"
      />
    </div>
  );
} 