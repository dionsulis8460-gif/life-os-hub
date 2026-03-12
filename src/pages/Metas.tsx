import { useState } from "react";
import ModuleGate from "@/components/layout/ModuleGate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Slider } from "@/components/ui/slider";
import { Target, Plus, Trash2, CalendarIcon, CheckCircle2, Clock, TrendingUp, ChevronDown, ChevronRight, X, RotateCcw, Trophy } from "lucide-react";
import { useGoals } from "@/hooks/useGoals";
import { GoalCategory, GOAL_CATEGORIES } from "@/types/goal";
import { motion, AnimatePresence } from "framer-motion";
import { GoalCelebrationDialog } from "@/components/metas/GoalCelebrationDialog";
import { format, differenceInDays, isPast, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const Metas = () => {
  const { goals, addGoal, deleteGoal, updateProgress, toggleComplete, addMilestone, toggleMilestone, deleteMilestone, activeGoals, completedGoals, avgProgress } = useGoals();

  const [showDialog, setShowDialog] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GoalCategory>('pessoal');
  const [deadline, setDeadline] = useState<Date | undefined>();
  const [progress, setProgress] = useState(0);

  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [newMilestone, setNewMilestone] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{ open: boolean; title: string; number: number }>({ open: false, title: '', number: 0 });

  const resetForm = () => {
    setTitle(''); setDescription(''); setCategory('pessoal'); setDeadline(undefined); setProgress(0);
  };

  const handleAdd = () => {
    if (!title.trim() || !deadline) return;
    addGoal({ title: title.trim(), description: description.trim(), category, progress, deadline: deadline.toISOString() });
    toast.success("Meta criada!");
    resetForm();
    setShowDialog(false);
  };

  const handleAddMilestone = (goalId: string) => {
    if (!newMilestone.trim()) return;
    addMilestone(goalId, newMilestone.trim());
    setNewMilestone('');
  };

  const getDaysLeft = (deadline: string) => {
    const days = differenceInDays(parseISO(deadline), new Date());
    if (days < 0) return { text: 'Atrasado', urgent: true };
    if (days === 0) return { text: 'Hoje', urgent: true };
    if (days === 1) return { text: '1 dia', urgent: true };
    return { text: `${days} dias`, urgent: days <= 7 };
  };

  const getCatInfo = (cat: GoalCategory) => GOAL_CATEGORIES.find(c => c.value === cat)!;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Metas</h1>
          <p className="text-muted-foreground text-sm">Defina objetivos e acompanhe seu progresso</p>
        </div>
        <Button onClick={() => setShowDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova meta
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Metas ativas</p>
              <p className="text-lg font-bold">{activeGoals.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[hsl(152,69%,53%)]/10">
              <TrendingUp className="h-5 w-5 text-[hsl(152,69%,53%)]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Progresso médio</p>
              <p className="text-lg font-bold">{avgProgress}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[hsl(152,69%,53%)]/10">
              <CheckCircle2 className="h-5 w-5 text-[hsl(152,69%,53%)]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Concluídas</p>
              <p className="text-lg font-bold">{completedGoals.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active goals */}
      {activeGoals.length === 0 && completedGoals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Comece definindo suas metas!</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-1">
              Ter metas claras é o primeiro passo para transformar sonhos em conquistas. Pessoas que definem objetivos têm <span className="font-medium text-foreground">10x mais chances</span> de alcançá-los.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Estabeleça prazos, acompanhe seu progresso e celebre cada vitória. Sua jornada de crescimento começa agora! 🚀
            </p>
            <Button className="gap-2" onClick={() => setShowDialog(true)}>
              <Plus className="h-4 w-4" /> Criar minha primeira meta
            </Button>
          </CardContent>
        </Card>
      ) : activeGoals.length === 0 && completedGoals.length > 0 ? (
        <Card>
          <CardContent className="py-12 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-[hsl(152,69%,53%)]/10 flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-8 w-8 text-[hsl(152,69%,53%)]" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {completedGoals.length === 1 ? 'Você já conquistou 1 meta!' : `Você já conquistou ${completedGoals.length} metas!`} 🏆
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-1">
              Incrível! Você provou que é capaz de alcançar seus objetivos. Agora é hora de mirar ainda mais alto.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Quem para nunca chegou lá. Defina sua próxima meta e continue essa sequência de vitórias! 💪
            </p>
            <Button className="gap-2" onClick={() => setShowDialog(true)}>
              <Plus className="h-4 w-4" /> Criar próxima meta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {activeGoals.map(goal => {
              const cat = getCatInfo(goal.category);
              const daysLeft = getDaysLeft(goal.deadline);
              const isExpanded = expandedGoal === goal.id;
              return (
                <motion.div key={goal.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} layout>
                  <Card className="overflow-hidden">
                    <div
                      className="p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
                      onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <span className="text-lg mt-0.5">{cat.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-sm truncate">{goal.title}</h3>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full shrink-0" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                                {cat.label}
                              </span>
                            </div>
                            {goal.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{goal.description}</p>}
                            <div className="flex items-center gap-3 mt-2">
                              <div className="flex-1">
                                <Progress value={goal.progress} className="h-2" />
                              </div>
                              <span className="text-xs font-medium tabular-nums w-9 text-right">{goal.progress}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className={`flex items-center gap-1 text-xs ${daysLeft.urgent ? 'text-destructive' : 'text-muted-foreground'}`}>
                            <Clock className="h-3 w-3" />
                            {daysLeft.text}
                          </div>
                          {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                            {/* Progress slider */}
                            <div>
                              <Label className="text-xs text-muted-foreground">Progresso manual</Label>
                              <div className="flex items-center gap-3 mt-1">
                                <Slider value={[goal.progress]} onValueChange={([v]) => updateProgress(goal.id, v)} max={100} step={1} className="flex-1" />
                                <span className="text-xs font-medium tabular-nums w-9">{goal.progress}%</span>
                              </div>
                            </div>

                            {/* Milestones */}
                            <div>
                              <Label className="text-xs text-muted-foreground">Etapas</Label>
                              <div className="space-y-1.5 mt-1.5">
                                {goal.milestones.map(ms => (
                                  <div key={ms.id} className="flex items-center justify-between py-1.5 px-3 rounded-md bg-secondary/50 group">
                                    <div className="flex items-center gap-2.5">
                                      <Checkbox checked={ms.completed} onCheckedChange={() => toggleMilestone(goal.id, ms.id)} className="h-4 w-4" />
                                      <span className={`text-sm ${ms.completed ? 'line-through text-muted-foreground' : ''}`}>{ms.title}</span>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => deleteMilestone(goal.id, ms.id)}>
                                      <X className="h-3 w-3 text-muted-foreground" />
                                    </Button>
                                  </div>
                                ))}
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="Nova etapa..."
                                    value={isExpanded ? newMilestone : ''}
                                    onChange={e => setNewMilestone(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddMilestone(goal.id)}
                                    className="h-8 text-sm"
                                  />
                                  <Button size="sm" variant="secondary" className="h-8 px-3" onClick={() => handleAddMilestone(goal.id)}>
                                    <Plus className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2 pt-1">
                              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => {
                                const newCompletedCount = completedGoals.length + 1;
                                toggleComplete(goal.id);
                                setCelebrationData({ open: true, title: goal.title, number: newCompletedCount });
                              }}>
                                <CheckCircle2 className="h-3.5 w-3.5" /> Concluir
                              </Button>
                              <Button size="sm" variant="ghost" className="gap-1.5 text-destructive" onClick={() => { deleteGoal(goal.id); toast.success("Meta removida."); }}>
                                <Trash2 className="h-3.5 w-3.5" /> Excluir
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Completed goals */}
      {completedGoals.length > 0 && (
        <div>
          <button onClick={() => setShowCompleted(!showCompleted)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3">
            {showCompleted ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            Concluídas ({completedGoals.length})
          </button>
          <AnimatePresence>
            {showCompleted && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-2 overflow-hidden">
                {completedGoals.map(goal => {
                  const cat = getCatInfo(goal.category);
                  return (
                    <div key={goal.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-[hsl(152,69%,53%)]/20 group">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-[hsl(152,69%,53%)]" />
                        <span className="text-sm line-through text-muted-foreground">{goal.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>{cat.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleComplete(goal.id)}>
                          <RotateCcw className="h-3 w-3 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => deleteGoal(goal.id)}>
                          <Trash2 className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Add goal dialog */}
      <Dialog open={showDialog} onOpenChange={(v) => { setShowDialog(v); if (!v) resetForm(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova meta</DialogTitle>
            <DialogDescription>Defina um objetivo com prazo e acompanhe seu progresso.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Categoria</Label>
              <div className="flex gap-1.5 flex-wrap">
                {GOAL_CATEGORIES.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setCategory(c.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${category === c.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
                  >
                    {c.icon} {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Título</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Correr 5km sem parar" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Descrição (opcional)</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Detalhes sobre a meta..." rows={2} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Prazo</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal mt-1", !deadline && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deadline ? format(deadline, "PPP", { locale: ptBR }) : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={deadline}
                    onSelect={setDeadline}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
            <Button onClick={handleAdd} disabled={!title.trim() || !deadline}>Criar meta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <GoalCelebrationDialog
        open={celebrationData.open}
        onOpenChange={(open) => setCelebrationData(prev => ({ ...prev, open }))}
        goalTitle={celebrationData.title}
        goalNumber={celebrationData.number}
      />
    </div>
  );
};

export default Metas;
