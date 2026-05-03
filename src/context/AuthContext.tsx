import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_URL } from '../config';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  isAdmin: boolean;
  isSuperAdmin?: boolean;
  registeredAt?: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  login: (phone: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (firstName: string, lastName: string, phone: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  getAllUsers: () => User[];
  toggleAdminStatus: (userId: string) => Promise<boolean>;
  createAdmin: (firstName: string, lastName: string, phone: string, password: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('modern_meat_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('modern_meat_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('modern_meat_current_user');
    }
  }, [user]);

  // Fetch all users for admin panel
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users`);
      const data = await res.json();
      setAllUsers(data);
    } catch (err) {
      console.error(err);
      console.error('Failed to fetch users');
    }
  };

  useEffect(() => {
    if (user?.isAdmin) {
      fetchUsers();
    }
  }, [user]);

  const login = async (phone: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        return { success: true, message: 'Xush kelibsiz!' };
      }
      return { success: false, message: data.message || 'Xatolik yuz berdi' };
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Serverga ulanishda xatolik!' };
    }
  };

  const register = async (firstName: string, lastName: string, phone: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, phone, password })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        return { success: true, message: "Ro'yxatdan o'tdingiz!" };
      }
      return { success: false, message: data.message || 'Xatolik yuz berdi' };
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Serverga ulanishda xatolik!' };
    }
  };

  const toggleAdminStatus = async (userId: string) => {
    try {
      const res = await fetch(`${API_URL}/users/${userId}/toggle-admin`, {
        method: 'PATCH'
      });
      if (res.ok) {
        await fetchUsers();
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const createAdmin = async (firstName: string, lastName: string, phone: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/users/admin-create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, phone, password })
      });
      const data = await res.json();
      if (data.success) {
        await fetchUsers();
        return { success: true, message: "Yangi admin qo'shildi!" };
      }
      return { success: false, message: data.message || 'Xatolik yuz berdi' };
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Serverga ulanishda xatolik!' };
    }
  };

  const logout = () => {
    setUser(null);
  };

  const getAllUsers = () => allUsers;

  return (
    <AuthContext.Provider value={{ 
      user, isLoggedIn: !!user, isAdmin: !!user?.isAdmin, 
      login, register, logout, getAllUsers, toggleAdminStatus, createAdmin 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
