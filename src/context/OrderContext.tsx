import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { API_URL } from '../config';

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
}

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error('Orders fetch failed', err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const addOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const newOrder = await res.json();
      setOrders(prev => [newOrder, ...prev]);
    } catch (err) {
      console.error('Failed to add order', err);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const updated = await res.json();
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
    } catch (err) {
      console.error('Failed to update order status', err);
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      await fetch(`${API_URL}/orders/${orderId}`, { method: 'DELETE' });
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (err) {
      console.error('Failed to delete order', err);
    }
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus, deleteOrder }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrders must be used within OrderProvider');
  return context;
};
