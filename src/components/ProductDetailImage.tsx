import Image from 'next/image';

interface ProductDetailImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ProductDetailImage({ src, alt, className }: ProductDetailImageProps) {
  return (
    <div className={`relative w-full h-[600px] ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        loading="lazy"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
} 