export type TransactionType = 'income' | 'expense';

export type Category = {
  id: string;
  name: string;
  icon: string;
  type: TransactionType;
};

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: string;
  createdAt: string;
};

export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'food', name: 'Alimentação', icon: '🍔', type: 'expense' },
  { id: 'transport', name: 'Transporte', icon: '🚗', type: 'expense' },
  { id: 'housing', name: 'Moradia', icon: '🏠', type: 'expense' },
  { id: 'health', name: 'Saúde', icon: '💊', type: 'expense' },
  { id: 'education', name: 'Educação', icon: '📚', type: 'expense' },
  { id: 'entertainment', name: 'Lazer', icon: '🎮', type: 'expense' },
  { id: 'shopping', name: 'Compras', icon: '🛍️', type: 'expense' },
  { id: 'other-expense', name: 'Outros', icon: '📦', type: 'expense' },
];

export const INCOME_CATEGORIES: Category[] = [
  { id: 'salary', name: 'Salário', icon: '💰', type: 'income' },
  { id: 'freelance', name: 'Freelance', icon: '💻', type: 'income' },
  { id: 'investment', name: 'Investimentos', icon: '📈', type: 'income' },
  { id: 'other-income', name: 'Outros', icon: '💵', type: 'income' },
];
