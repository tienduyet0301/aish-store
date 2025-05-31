import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

const MyOrdersPage: React.FC = () => {
  const session = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!session?.user?.email) return;

      try {
        const response = await fetch(`/api/orders?userId=${session.user.email}`);
        const data = await response.json();

        if (data.ok) {
          setOrders(data.orders);
        } else {
          toast.error(data.message || 'Failed to fetch orders');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to fetch orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [session]);

  return (
    <div>
      {/* Render your orders component here */}
    </div>
  );
};

export default MyOrdersPage; 