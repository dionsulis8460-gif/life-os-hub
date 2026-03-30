import { useState } from "react";
import ModuleGate from "@/components/layout/ModuleGate";
import { PageSkeleton } from "@/components/layout/PageSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Flame, Beef, Wheat, Droplets, Trash2 } from "lucide-react";
import { useMeals } from "@/hooks/useMeals";
import { MEAL_TYPES, MACRO_COLORS } from "@/types/meal";
import MealDialog from "@/components/alimentacao/MealDialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { toast } from "sonner";

const Alimentacao = () => {
  const { meals, addMeal, deleteMeal, todayMeals, todayCalories, todayProtein, todayCarbs, todayFat, dailyData, isLoading } = useMeals();
  const [showDialog, setShowDialog] = useState(false);

  if (isLoading) return <PageSkeleton rows={3} />;

  const handleAdd = (data: Parameters<typeof addMeal>[0] extends infer T ? Omit<T, 'id' | 'date'> : never) => {
    addMeal({ ...data, date: new Date().toISOString() });
    toast.success("Refeição registrada!");
  };

  const macroData = [
    { name: 'Proteína', value: todayProtein, color: MACRO_COLORS.protein },
    { name: 'Carboidrato', value: todayCarbs, color: MACRO_COLORS.carbs },
    { name: 'Gordura', value: todayFat, color: MACRO_COLORS.fat },
  ].filter(d => d.value > 0);

  const totalMacroGrams = todayProtein + todayCarbs + todayFat;

  // Group today meals by type
  const groupedMeals = MEAL_TYPES.map(mt => ({
    ...mt,
    meals: todayMeals.filter(m => m.type === mt.value),
  })).filter(g => g.meals.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alimentação</h1>
          <p className="text-muted-foreground text-sm">Registre refeições e acompanhe seus macros</p>
        </div>
        <Button onClick={() => setShowDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova refeição
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Flame className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Calorias</p>
              <p className="text-lg font-bold">{todayCalories} <span className="text-xs font-normal text-muted-foreground">kcal</span></p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${MACRO_COLORS.protein}20` }}>
              <Beef className="h-5 w-5" style={{ color: MACRO_COLORS.protein }} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Proteína</p>
              <p className="text-lg font-bold">{todayProtein}g</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${MACRO_COLORS.carbs}20` }}>
              <Wheat className="h-5 w-5" style={{ color: MACRO_COLORS.carbs }} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Carboidrato</p>
              <p className="text-lg font-bold">{todayCarbs}g</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${MACRO_COLORS.fat}20` }}>
              <Droplets className="h-5 w-5" style={{ color: MACRO_COLORS.fat }} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Gordura</p>
              <p className="text-lg font-bold">{todayFat}g</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Macros pie chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Distribuição de macros</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            {macroData.length === 0 ? (
              <p className="text-sm text-muted-foreground">Registre refeições para ver os macros</p>
            ) : (
              <div className="flex items-center gap-6 w-full">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie data={macroData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} strokeWidth={0}>
                      {macroData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(220, 20%, 11%)', border: '1px solid hsl(217, 30%, 18%)', borderRadius: 8, color: 'hsl(210, 40%, 98%)' }}
                      formatter={(value: number) => [`${value}g`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {macroData.map(d => (
                    <div key={d.name} className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                      <div>
                        <p className="text-sm font-medium">{d.name}</p>
                        <p className="text-xs text-muted-foreground">{d.value}g · {totalMacroGrams > 0 ? Math.round((d.value / totalMacroGrams) * 100) : 0}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly calories chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Calorias semanais</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 30%, 18%)" />
                <XAxis dataKey="day" tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(220, 20%, 11%)', border: '1px solid hsl(217, 30%, 18%)', borderRadius: 8, color: 'hsl(210, 40%, 98%)' }}
                  formatter={(value: number) => [`${value} kcal`, 'Calorias']}
                />
                <Bar dataKey="calorias" fill="hsl(12, 90%, 60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Today's meals grouped */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Refeições de hoje</CardTitle>
        </CardHeader>
        <CardContent>
          {todayMeals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">Nenhuma refeição registrada hoje.</p>
              <Button variant="outline" className="mt-3 gap-2" onClick={() => setShowDialog(true)}>
                <Plus className="h-4 w-4" /> Adicionar refeição
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedMeals.map(group => (
                <div key={group.value}>
                  <p className="text-xs font-medium text-muted-foreground mb-2">{group.icon} {group.label}</p>
                  <div className="space-y-1.5">
                    <AnimatePresence>
                      {group.meals.map(meal => (
                        <motion.div
                          key={meal.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 group"
                        >
                          <div>
                            <p className="text-sm font-medium">{meal.name}</p>
                            <div className="flex gap-3 mt-0.5">
                              <span className="text-xs text-muted-foreground">{meal.calories} kcal</span>
                              <span className="text-xs" style={{ color: MACRO_COLORS.protein }}>P: {meal.protein}g</span>
                              <span className="text-xs" style={{ color: MACRO_COLORS.carbs }}>C: {meal.carbs}g</span>
                              <span className="text-xs" style={{ color: MACRO_COLORS.fat }}>G: {meal.fat}g</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => { deleteMeal(meal.id); toast.success("Refeição removida."); }}>
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <MealDialog open={showDialog} onOpenChange={setShowDialog} onAdd={handleAdd} />
    </div>
  );
};

const AlimentacaoPage = () => {
  // Pre-warm the cache in parallel with ModuleGate's subscription check.
  useMeals();
  return (
    <ModuleGate module="alimentacao" moduleName="Alimentação">
      <Alimentacao />
    </ModuleGate>
  );
};

export default AlimentacaoPage;
