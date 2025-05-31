import CloudinaryImage from './CloudinaryImage';

interface ProductDetailImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ProductDetailImage({ src, alt, className }: ProductDetailImageProps) {
  return (
    <div className={`relative w-full h-[600px] ${className}`}>
      <CloudinaryImage
        src={src}
        alt={alt}
        width={800}
        height={600}
        className="object-cover w-full h-full"
      />
    </div>
  );
} 