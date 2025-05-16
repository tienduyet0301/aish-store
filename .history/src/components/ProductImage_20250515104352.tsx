import Image from 'next/image';

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
      <Image
        src={src}
        alt={alt}
        width={width || 300}
        height={height || 400}
        className="object-cover"
        loading="lazy"
      />
    </div>
  );
} 