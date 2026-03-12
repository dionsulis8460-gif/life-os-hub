import { useState, useCallback, useMemo } from 'react';
import { Transaction, TransactionType, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types/finance';

const STORAGE_KEY = 'lifeos-finances';

function loadTransactions(): Transaction[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveTransactions(transactions: Transaction[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

export function useFinances() {
  const [transactions, setTransactions] = useState<Transaction[]>(loadTransactions);

  const update = useCallback((fn: (prev: Transaction[]) => Transaction[]) => {
    setTransactions(prev => {
      const next = fn(prev);
      saveTransactions(next);
      return next;
    });
  }, []);

  const addTransaction = useCallback((data: Omit<Transaction, 'id' | 'createdAt'>) => {
    update(prev => [...prev, { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]);
  }, [update]);

  const deleteTransaction = useCallback((id: string) => {
    update(prev => prev.filter(t => t.id !== id));
  }, [update]);

  const currentMonth = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });
  }, [transactions]);

  const totalIncome = useMemo(() => currentMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), [currentMonth]);
  const totalExpense = useMemo(() => currentMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [currentMonth]);
  const balance = totalIncome - totalExpense;

  const expenseByCategory = useMemo(() => {
    const map = new Map<string, number>();
    currentMonth.filter(t => t.type === 'expense').forEach(t => {
      map.set(t.category, (map.get(t.category) || 0) + t.amount);
    });
    return EXPENSE_CATEGORIES.filter(c => map.has(c.id)).map(c => ({
      name: c.name,
      icon: c.icon,
      value: map.get(c.id) || 0,
    }));
  }, [currentMonth]);

  const getCategoryName = useCallback((id: string, type: TransactionType) => {
    const cats = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    return cats.find(c => c.id === id)?.name || id;
  }, []);

  const getCategoryIcon = useCallback((id: string, type: TransactionType) => {
    const cats = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    return cats.find(c => c.id === id)?.icon || '📦';
  }, []);

  return {
    transactions,
    currentMonth,
    totalIncome,
    totalExpense,
    balance,
    expenseByCategory,
    addTransaction,
    deleteTransaction,
    getCategoryName,
    getCategoryIcon,
  };
}
