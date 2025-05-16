import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Users, 
  ShoppingCart, 
  Settings,
  Tag,
  Bell
} from "lucide-react";

const routes = [
  {
    label: "Sản phẩm",
    icon: Package,
    href: "/admin/products",
    color: "text-sky-500",
  },
  {
    label: "Đơn hàng",
    icon: ShoppingCart,
    href: "/admin/orders",
    color: "text-violet-500",
  },
  {
    label: "Khách hàng",
    icon: Users,
    href: "/admin/customers",
    color: "text-pink-700",
  },
  {
    label: "Giảm giá",
    icon: Tag,
    href: "/admin/discounts",
    color: "text-orange-500",
  },
  {
    label: "Thông báo",
    icon: Bell,
    href: "/admin/notifications",
    color: "text-green-500",
  },
  {
    label: "Cài đặt",
    icon: Settings,
    href: "/admin/settings",
  },
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/admin" className="flex items-center pl-3 mb-14">
          <h1 className="text-2xl font-bold">
            Admin Panel
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400",
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 