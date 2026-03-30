import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Meal } from '@/types/meal';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { STORAGE_KEYS } from '@/lib/storage-keys';
import { localRead, localWrite } from '@/lib/local-store';

function rowToMeal(r: Record<string, unknown>): Meal {
  return {
    id: r.id as string,
    name: r.name as string,
    type: r.type as Meal['type'],
    calories: r.calories as number,
    protein: r.protein as number,
    carbs: r.carbs as number,
    fat: r.fat as number,
    date: r.date as string,
  };
}

export function useMeals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const KEY = ['meals', user?.id];
  const isLocal = !isSupabaseConfigured;
  const LKEY = STORAGE_KEYS.meals;

  const persist = () =>
    localWrite(LKEY, queryClient.getQueryData<Meal[]>(KEY) ?? []);

  const { data: meals = [], isLoading, isError } = useQuery<Meal[]>({
    queryKey: KEY,
    queryFn: async () => {
      if (isLocal) return localRead<Meal>(LKEY);
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(rowToMeal);
    },
    enabled: isLocal || !!user,
  });

  const addMealMut = useMutation({
    mutationFn: async (meal: Omit<Meal, 'id'>) => {
      if (isLocal) return;
      const { error } = await supabase
        .from('meals')
        .insert({ ...meal, user_id: user!.id });
      if (error) throw error;
    },
    onMutate: async (meal) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const prev = queryClient.getQueryData<Meal[]>(KEY);
      queryClient.setQueryData<Meal[]>(KEY, (old = []) => [
        { ...meal, id: crypto.randomUUID() },
        ...old,
      ]);
      return { prev };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(KEY, ctx?.prev),
    onSuccess: () => { if (isLocal) persist(); },
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });

  const deleteMealMut = useMutation({
    mutationFn: async (id: string) => {
      if (isLocal) return;
      const { error } = await supabase.from('meals').delete().eq('id', id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const prev = queryClient.getQueryData<Meal[]>(KEY);
      queryClient.setQueryData<Meal[]>(KEY, (old = []) => old.filter((m) => m.id !== id));
      return { prev };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(KEY, ctx?.prev),
    onSuccess: () => { if (isLocal) persist(); },
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayMeals = meals.filter((m) => m.date.startsWith(today));
  const todayCalories = todayMeals.reduce((s, m) => s + m.calories, 0);
  const todayProtein = todayMeals.reduce((s, m) => s + m.protein, 0);
  const todayCarbs = todayMeals.reduce((s, m) => s + m.carbs, 0);
  const todayFat = todayMeals.reduce((s, m) => s + m.fat, 0);

  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(new Date(), 6 - i);
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayMeals = meals.filter((m) => m.date.startsWith(dayStr));
    return {
      day: format(day, 'EEE', { locale: ptBR }),
      calorias: dayMeals.reduce((s, m) => s + m.calories, 0),
      proteina: dayMeals.reduce((s, m) => s + m.protein, 0),
      carbos: dayMeals.reduce((s, m) => s + m.carbs, 0),
      gordura: dayMeals.reduce((s, m) => s + m.fat, 0),
    };
  });

  return {
    isLoading,
    isError,
    meals,
    addMeal: (meal: Omit<Meal, 'id'>) => addMealMut.mutate(meal),
    deleteMeal: (id: string) => deleteMealMut.mutate(id),
    todayMeals,
    todayCalories,
    todayProtein,
    todayCarbs,
    todayFat,
    dailyData,
  };
}
