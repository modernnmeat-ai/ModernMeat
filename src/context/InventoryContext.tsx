import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { API_URL } from '../config';

export type MeatCategory = 'mol' | 'qoy' | 'tovuq' | 'other';
export type EntryType = 'kirim' | 'chiqim';

export interface InventoryEntry {
  id: string;
  type: EntryType;
  category: MeatCategory;
  weight: number;
  pricePerKg?: number;
  note: string;
  date: string;
  createdAt: string;
  addedBy?: string;
}

export interface StockSummary {
  category: MeatCategory;
  label: string;
  totalKirim: number;
  totalChiqim: number;
  remaining: number;
}

interface InventoryContextType {
  entries: InventoryEntry[];
  addEntry: (entry: Omit<InventoryEntry, 'id' | 'createdAt'>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  getStock: () => StockSummary[];
  getTodayEntries: () => InventoryEntry[];
}

const CATEGORY_LABELS: Record<MeatCategory, string> = {
  mol: "Mol Go'shti",
  qoy: "Qo'y Go'shti",
  tovuq: "Tovuq Go'shti",
  other: "Boshqa",
};

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<InventoryEntry[]>([]);

  const fetchInventory = async () => {
    try {
      const res = await fetch(`${API_URL}/inventory`);
      const data = await res.json();
      setEntries(data);
    } catch (err) {
      console.error('Inventory fetch failed', err);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const addEntry = async (entry: Omit<InventoryEntry, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch(`${API_URL}/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      const newEntry = await res.json();
      setEntries(prev => [newEntry, ...prev]);
    } catch (err) {
      console.error('Failed to add inventory entry', err);
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      await fetch(`${API_URL}/inventory/${id}`, { method: 'DELETE' });
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error('Failed to delete inventory entry', err);
    }
  };

  const getStock = (): StockSummary[] => {
    const cats: MeatCategory[] = ['mol', 'qoy', 'tovuq', 'other'];
    return cats.map(cat => {
      const catEntries = entries.filter(e => e.category === cat);
      const totalKirim = catEntries.filter(e => e.type === 'kirim').reduce((s, e) => s + e.weight, 0);
      const totalChiqim = catEntries.filter(e => e.type === 'chiqim').reduce((s, e) => s + e.weight, 0);
      return {
        category: cat,
        label: CATEGORY_LABELS[cat],
        totalKirim,
        totalChiqim,
        remaining: totalKirim - totalChiqim,
      };
    });
  };

  const getTodayEntries = () => {
    const today = new Date().toISOString().slice(0, 10);
    return entries.filter(e => e.date === today);
  };

  return (
    <InventoryContext.Provider value={{ entries, addEntry, deleteEntry, getStock, getTodayEntries }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be within InventoryProvider');
  return ctx;
};

export { CATEGORY_LABELS };
