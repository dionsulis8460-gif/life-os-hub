import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TransactionType, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types/finance';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { type: TransactionType; amount: number; description: string; category: string; date: string }) => void;
}

export default function TransactionDialog({ open, onOpenChange, onSave }: Props) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const reset = () => {
    setType('expense');
    setAmount('');
    setDescription('');
    setCategory('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleSave = () => {
    if (!amount || !category) return;
    onSave({ type, amount: parseFloat(amount), description, category, date });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Nova transação</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Type toggle */}
          <div className="flex gap-2 p-1 bg-secondary rounded-lg">
            {(['expense', 'income'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setType(t); setCategory(''); }}
                className={cn(
                  'flex-1 py-2 rounded-md text-sm font-medium transition-all',
                  type === t
                    ? t === 'expense' ? 'bg-destructive text-destructive-foreground' : 'bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t === 'expense' ? 'Despesa' : 'Receita'}
              </button>
            ))}
          </div>

          <div>
            <Label className="text-muted-foreground">Valor (R$)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="mt-1 bg-secondary border-border"
            />
          </div>

          <div>
            <Label className="text-muted-foreground">Descrição (opcional)</Label>
            <Input
              placeholder="Ex: Almoço no restaurante"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="mt-1 bg-secondary border-border"
            />
          </div>

          <div>
            <Label className="text-muted-foreground">Categoria</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all',
                    category === c.id
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-secondary text-muted-foreground hover:border-primary/50'
                  )}
                >
                  <span className="text-lg">{c.icon}</span>
                  <span className="truncate w-full text-center">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground">Data</Label>
            <Input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="mt-1 bg-secondary border-border"
            />
          </div>

          <Button onClick={handleSave} disabled={!amount || !category} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
