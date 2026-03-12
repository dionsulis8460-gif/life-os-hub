import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MealType, MEAL_TYPES } from "@/types/meal";

interface MealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (meal: { name: string; type: MealType; calories: number; protein: number; carbs: number; fat: number }) => void;
}

const MealDialog = ({ open, onOpenChange, onAdd }: MealDialogProps) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<MealType>('almoco');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const reset = () => {
    setName(''); setType('almoco'); setCalories(''); setProtein(''); setCarbs(''); setFat('');
  };

  const handleSubmit = () => {
    if (!name.trim() || !calories) return;
    onAdd({
      name: name.trim(),
      type,
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar refeição</DialogTitle>
          <DialogDescription>Adicione os detalhes da sua refeição.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Tipo</Label>
            <div className="flex gap-1.5 flex-wrap">
              {MEAL_TYPES.map(mt => (
                <button
                  key={mt.value}
                  onClick={() => setType(mt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${type === mt.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
                >
                  {mt.icon} {mt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Nome</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Frango grelhado com arroz" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Calorias (kcal)</Label>
              <Input type="number" value={calories} onChange={e => setCalories(e.target.value)} placeholder="0" min={0} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Proteína (g)</Label>
              <Input type="number" value={protein} onChange={e => setProtein(e.target.value)} placeholder="0" min={0} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Carboidrato (g)</Label>
              <Input type="number" value={carbs} onChange={e => setCarbs(e.target.value)} placeholder="0" min={0} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Gordura (g)</Label>
              <Input type="number" value={fat} onChange={e => setFat(e.target.value)} placeholder="0" min={0} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || !calories}>Adicionar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MealDialog;
