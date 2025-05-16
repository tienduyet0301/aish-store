import Link from 'next/link';

const menuItems = [
  { label: 'TSHIRT', href: '/tshirt' },
  { label: 'SHIRT', href: '/shirt' },
  { label: 'POLO', href: '/polo' },
  { label: 'SWEATER', href: '/sweater' },
  { label: 'HOODIE', href: '/hoodie' },
  { label: 'ACCEPT THE PROBLEM', href: '/accept-the-problem' },
  { label: 'BACK TO SUMMER', href: '/back-to-summer' },
  { label: 'CHILL, CALM DOWN', href: '/chill-calm-down' },
  { label: 'RETURN POLICY', href: '/return-policy' },
  { label: 'WARRANTY POLICY', href: '/warranty-policy' },
  { label: 'CARE INSTRUCTIONS', href: '/care-instructions' }
];

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Menu</h1>
      <div className="flex flex-col space-y-2">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            href={item.href || '#'}
            className="text-gray-600 hover:text-gray-900"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
} 