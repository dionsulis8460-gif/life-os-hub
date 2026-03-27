import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Transaction, TransactionType, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types/finance';

function rowToTransaction(r: Record<string, unknown>): Transaction {
  return {
    id: r.id as string,
    type: r.type as TransactionType,
    amount: r.amount as number,
    description: r.description as string,
    category: r.category as string,
    date: r.date as string,
    createdAt: r.created_at as string,
  };
}

export function useFinances() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const KEY = ['transactions', user?.id];

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(rowToTransaction);
    },
    enabled: !!user,
  });

  const addTransactionMut = useMutation({
    mutationFn: async (data: Omit<Transaction, 'id' | 'createdAt'>) => {
      const { error } = await supabase.from('transactions').insert({ ...data, user_id: user!.id });
      if (error) throw error;
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const prev = queryClient.getQueryData<Transaction[]>(KEY);
      queryClient.setQueryData<Transaction[]>(KEY, (old = []) => [
        { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
        ...old,
      ]);
      return { prev };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(KEY, ctx?.prev),
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });

  const deleteTransactionMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const prev = queryClient.getQueryData<Transaction[]>(KEY);
      queryClient.setQueryData<Transaction[]>(KEY, (old = []) => old.filter((t) => t.id !== id));
      return { prev };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(KEY, ctx?.prev),
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });

  const currentMonth = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    return transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });
  }, [transactions]);

  const totalIncome = useMemo(
    () => currentMonth.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    [currentMonth]
  );
  const totalExpense = useMemo(
    () => currentMonth.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    [currentMonth]
  );
  const balance = totalIncome - totalExpense;

  const expenseByCategory = useMemo(() => {
    const map = new Map<string, number>();
    currentMonth.filter((t) => t.type === 'expense').forEach((t) => {
      map.set(t.category, (map.get(t.category) || 0) + t.amount);
    });
    return EXPENSE_CATEGORIES.filter((c) => map.has(c.id)).map((c) => ({
      name: c.name,
      icon: c.icon,
      value: map.get(c.id) || 0,
    }));
  }, [currentMonth]);

  const getCategoryName = useCallback(
    (id: string, type: TransactionType) => {
      const cats = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
      return cats.find((c) => c.id === id)?.name || id;
    },
    []
  );

  const getCategoryIcon = useCallback(
    (id: string, type: TransactionType) => {
      const cats = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
      return cats.find((c) => c.id === id)?.icon || '📦';
    },
    []
  );

  return {
    transactions,
    currentMonth,
    totalIncome,
    totalExpense,
    balance,
    expenseByCategory,
    addTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>) => addTransactionMut.mutate(data),
    deleteTransaction: (id: string) => deleteTransactionMut.mutate(id),
    getCategoryName,
    getCategoryIcon,
  };
}
