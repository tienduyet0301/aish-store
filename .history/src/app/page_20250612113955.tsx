import useSWR from 'swr';
import Image from 'next/image';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const { data: products, error } = useSWR('/api/products', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000 // Cache trong 1 phút
  });

  if (error) return <div>Failed to load</div>;
  if (!products) return <div>Loading...</div>;

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