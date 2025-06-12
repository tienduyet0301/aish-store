import useSWR from 'swr';

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
} 