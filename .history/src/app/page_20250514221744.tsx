{menuItems.map((item, index) => (
  <Link
    key={index}
    href={item.href || '#'}
    className="text-gray-600 hover:text-gray-900"
  >
    {item.label}
  </Link>
))} 