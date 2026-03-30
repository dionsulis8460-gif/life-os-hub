import { useState } from 'react';
import ModuleGate from "@/components/layout/ModuleGate";
import { PageSkeleton } from "@/components/layout/PageSkeleton";
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, TrendingUp, TrendingDown, Wallet, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinances } from '@/hooks/useFinances';
import TransactionDialog from '@/components/financas/TransactionDialog';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';

const CHART_COLORS = [
  'hsl(12, 90%, 60%)',
  'hsl(340, 90%, 65%)',
  'hsl(200, 80%, 55%)',
  'hsl(152, 69%, 53%)',
  'hsl(45, 90%, 55%)',
  'hsl(270, 70%, 60%)',
  'hsl(180, 60%, 50%)',
  'hsl(30, 80%, 55%)',
];

function Financas() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const {
    currentMonth,
    totalIncome,
    totalExpense,
    balance,
    expenseByCategory,
    addTransaction,
    deleteTransaction,
    getCategoryName,
    getCategoryIcon,
    isLoading,
  } = useFinances();

  if (isLoading) return <PageSkeleton rows={4} />;

  const formatCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const sortedTransactions = [...currentMonth].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Finanças</h1>
          <p className="text-muted-foreground text-sm">Controle de gastos e receitas do mês</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
          <Plus className="w-4 h-4" /> Nova transação
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Receitas', value: totalIncome, icon: TrendingUp, color: 'text-[hsl(var(--success))]' },
          { label: 'Despesas', value: totalExpense, icon: TrendingDown, color: 'text-destructive' },
          { label: 'Saldo', value: balance, icon: Wallet, color: balance >= 0 ? 'text-[hsl(var(--success))]' : 'text-destructive' },
        ].map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="bg-card border-border">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={cn('p-3 rounded-xl bg-secondary', item.color)}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className={cn('text-xl font-bold', item.color)}>{formatCurrency(item.value)}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-card border-border h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-foreground">Despesas por categoria</CardTitle>
            </CardHeader>
            <CardContent>
              {expenseByCategory.length > 0 ? (
                <div className="flex flex-col items-center gap-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={expenseByCategory}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        strokeWidth={2}
                        stroke="hsl(220, 20%, 11%)"
                      >
                        {expenseByCategory.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ background: 'hsl(220, 20%, 14%)', border: '1px solid hsl(217, 30%, 18%)', borderRadius: 8, color: 'hsl(210, 40%, 98%)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm w-full">
                    {expenseByCategory.map((c, i) => (
                      <div key={c.name} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span className="text-muted-foreground truncate">{c.icon} {c.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-10">Nenhuma despesa registrada</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Transaction list */}
        <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-card border-border h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-foreground">Transações recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {sortedTransactions.length > 0 ? (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  <AnimatePresence>
                    {sortedTransactions.map(t => (
                      <motion.div
                        key={t.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary border border-border group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xl">{getCategoryIcon(t.category, t.type)}</span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {t.description || getCategoryName(t.category, t.type)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {getCategoryName(t.category, t.type)} · {new Date(t.date).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={cn('text-sm font-bold', t.type === 'income' ? 'text-[hsl(var(--success))]' : 'text-destructive')}>
                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                          </span>
                          <button
                            onClick={() => deleteTransaction(t.id)}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-10">Nenhuma transação este mês</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <TransactionDialog open={dialogOpen} onOpenChange={setDialogOpen} onSave={addTransaction} />
    </div>
  );
}

const FinancasPage = () => (
  <ModuleGate module="financas" moduleName="Finanças">
    <Financas />
  </ModuleGate>
);

export default FinancasPage;
