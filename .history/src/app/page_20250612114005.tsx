import useSWR from 'swr';
import Image from 'next/image';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
);

export default function Home() {
  const { data: products, error } = useSWR('/api/products', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000 // Cache trong 1 phút
  });

  if (error) return <div>Failed to load</div>;
  if (!products) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <LoadingSkeleton key={i} />
      ))}
    </div>
  );

  // ... existing code ...

  return (
    <div>
      {products.map((product) => (
        <div key={product.id}>
          <Image
            src={product.image}
            alt={product.name}
            width={800}
            height={600}
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,..."
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{
              width: '100%',
              height: 'auto',
              objectFit: 'cover'
            }}
          />
        </div>
      ))}
    </div>
  );
} 