import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;
}

const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        })),
      clearCart: () => set({ items: [] }),
      setItems: (items) => set({ items }),
    }),
    {
      name: "cart-storage",
    }
  )
);

export const useCart = () => {
  const { data: session } = useSession();
  const { items, addItem, removeItem, updateQuantity, clearCart, setItems } = useCartStore();

  // Khi đăng nhập, lấy giỏ hàng từ database
  useEffect(() => {
    if (session?.user?.email) {
      fetch("/api/cart")
        .then((res) => res.json())
        .then((data) => {
          if (data.length > 0) {
            setItems(data);
          }
        })
        .catch((error) => console.error("Error fetching cart:", error));
    }
  }, [session]);

  // Khi giỏ hàng thay đổi và đã đăng nhập, lưu vào database
  useEffect(() => {
    if (session?.user?.email && items.length > 0) {
      fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(items),
      }).catch((error) => console.error("Error saving cart:", error));
    }
  }, [items, session]);

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
}; 