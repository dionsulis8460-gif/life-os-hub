import { useState, useEffect, useCallback } from 'react';
import { Meal } from '@/types/meal';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function useMeals() {
  const [meals, setMeals] = useState<Meal[]>(() => {
    const saved = localStorage.getItem('meals-data');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('meals-data', JSON.stringify(meals));
  }, [meals]);

  const addMeal = useCallback((meal: Omit<Meal, 'id'>) => {
    setMeals(prev => [{ ...meal, id: crypto.randomUUID() }, ...prev]);
  }, []);

  const deleteMeal = useCallback((id: string) => {
    setMeals(prev => prev.filter(m => m.id !== id));
  }, []);

  const today = format(new Date(), 'yyyy-MM-dd');

  const todayMeals = meals.filter(m => m.date.startsWith(today));
  const todayCalories = todayMeals.reduce((s, m) => s + m.calories, 0);
  const todayProtein = todayMeals.reduce((s, m) => s + m.protein, 0);
  const todayCarbs = todayMeals.reduce((s, m) => s + m.carbs, 0);
  const todayFat = todayMeals.reduce((s, m) => s + m.fat, 0);

  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(new Date(), 6 - i);
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayMeals = meals.filter(m => m.date.startsWith(dayStr));
    return {
      day: format(day, 'EEE', { locale: ptBR }),
      calorias: dayMeals.reduce((s, m) => s + m.calories, 0),
      proteina: dayMeals.reduce((s, m) => s + m.protein, 0),
      carbos: dayMeals.reduce((s, m) => s + m.carbs, 0),
      gordura: dayMeals.reduce((s, m) => s + m.fat, 0),
    };
  });

  return { meals, addMeal, deleteMeal, todayMeals, todayCalories, todayProtein, todayCarbs, todayFat, dailyData };
}
