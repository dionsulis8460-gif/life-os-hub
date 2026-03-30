import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Transaction, TransactionType, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types/finance';
import { STORAGE_KEYS } from '@/lib/storage-keys';
import { localRead, localWrite } from '@/lib/local-store';

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
  const isLocal = !isSupabaseConfigured;
  const LKEY = STORAGE_KEYS.finances;

  const persist = () =>
    localWrite(LKEY, queryClient.getQueryData<Transaction[]>(KEY) ?? []);

  const { data: transactions = [], isLoading, isError } = useQuery<Transaction[]>({
    queryKey: KEY,
    queryFn: async () => {
      if (isLocal) return localRead<Transaction>(LKEY);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(rowToTransaction);
    },
    enabled: isLocal || !!user,
  });

  const addTransactionMut = useMutation({
    mutationFn: async (data: Omit<Transaction, 'id' | 'createdAt'>) => {
      if (isLocal) return;
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
    onSuccess: () => { if (isLocal) persist(); },
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });

  const deleteTransactionMut = useMutation({
    mutationFn: async (id: string) => {
      if (isLocal) return;
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
    onSuccess: () => { if (isLocal) persist(); },
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
    isLoading,
    isError,
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
