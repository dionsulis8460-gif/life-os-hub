import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Goal, Milestone } from '@/types/goal';

type GoalRow = {
  id: string;
  title: string;
  description: string;
  category: string;
  progress: number;
  deadline: string;
  completed: boolean;
  created_at: string;
  milestones?: MilestoneRow[];
};

type MilestoneRow = {
  id: string;
  goal_id: string;
  title: string;
  completed: boolean;
  position: number;
};

function rowToGoal(row: GoalRow): Goal {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category as Goal['category'],
    progress: row.progress,
    deadline: row.deadline,
    completed: row.completed,
    createdAt: row.created_at,
    milestones: (row.milestones ?? [])
      .sort((a, b) => a.position - b.position)
      .map((m) => ({ id: m.id, title: m.title, completed: m.completed })),
  };
}

export function useGoals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const KEY = ['goals', user?.id];

  const { data: goals = [], isLoading, isError } = useQuery<Goal[]>({
    queryKey: KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*, milestones(*)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as GoalRow[]).map(rowToGoal);
    },
    enabled: !!user,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: KEY });

  // ─── Add goal ────────────────────────────────────────────────────────────────
  const addGoalMut = useMutation({
    mutationFn: async (goal: Omit<Goal, 'id' | 'createdAt' | 'completed' | 'milestones'>) => {
      const { error } = await supabase
        .from('goals')
        .insert({ ...goal, user_id: user!.id, completed: false });
      if (error) throw error;
    },
    onMutate: async (goal) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const prev = queryClient.getQueryData<Goal[]>(KEY);
      queryClient.setQueryData<Goal[]>(KEY, (old = []) => [
        {
          ...goal,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          completed: false,
          milestones: [],
        },
        ...old,
      ]);
      return { prev };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(KEY, ctx?.prev),
    onSettled: invalidate,
  });

  // ─── Delete goal ─────────────────────────────────────────────────────────────
  const deleteGoalMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('goals').delete().eq('id', id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const prev = queryClient.getQueryData<Goal[]>(KEY);
      queryClient.setQueryData<Goal[]>(KEY, (old = []) => old.filter((g) => g.id !== id));
      return { prev };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(KEY, ctx?.prev),
    onSettled: invalidate,
  });

  // ─── Update progress ─────────────────────────────────────────────────────────
  const updateProgressMut = useMutation({
    mutationFn: async ({ id, progress }: { id: string; progress: number }) => {
      const clamped = Math.min(100, Math.max(0, progress));
      const { error } = await supabase
        .from('goals')
        .update({ progress: clamped, completed: clamped >= 100 })
        .eq('id', id);
      if (error) throw error;
    },
    onMutate: async ({ id, progress }) => {
      const clamped = Math.min(100, Math.max(0, progress));
      await queryClient.cancelQueries({ queryKey: KEY });
      const prev = queryClient.getQueryData<Goal[]>(KEY);
      queryClient.setQueryData<Goal[]>(KEY, (old = []) =>
        old.map((g) => (g.id === id ? { ...g, progress: clamped, completed: clamped >= 100 } : g))
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(KEY, ctx?.prev),
    onSettled: invalidate,
  });

  // ─── Toggle complete ──────────────────────────────────────────────────────────
  const toggleCompleteMut = useMutation({
    mutationFn: async (id: string) => {
      const goal = goals.find((g) => g.id === id);
      if (!goal) return;
      const newCompleted = !goal.completed;
      const newProgress = newCompleted ? 100 : goal.progress;
      const { error } = await supabase
        .from('goals')
        .update({ completed: newCompleted, progress: newProgress })
        .eq('id', id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const prev = queryClient.getQueryData<Goal[]>(KEY);
      queryClient.setQueryData<Goal[]>(KEY, (old = []) =>
        old.map((g) => {
          if (g.id !== id) return g;
          const newCompleted = !g.completed;
          return { ...g, completed: newCompleted, progress: newCompleted ? 100 : g.progress };
        })
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(KEY, ctx?.prev),
    onSettled: invalidate,
  });

  // ─── Add milestone ────────────────────────────────────────────────────────────
  const addMilestoneMut = useMutation({
    mutationFn: async ({ goalId, title }: { goalId: string; title: string }) => {
      const goal = goals.find((g) => g.id === goalId);
      const position = goal ? goal.milestones.length : 0;
      const { error } = await supabase
        .from('milestones')
        .insert({ goal_id: goalId, title, completed: false, position });
      if (error) throw error;
    },
    onMutate: async ({ goalId, title }) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const prev = queryClient.getQueryData<Goal[]>(KEY);
      queryClient.setQueryData<Goal[]>(KEY, (old = []) =>
        old.map((g) =>
          g.id === goalId
            ? {
                ...g,
                milestones: [
                  ...g.milestones,
                  { id: crypto.randomUUID(), title, completed: false },
                ],
              }
            : g
        )
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(KEY, ctx?.prev),
    onSettled: invalidate,
  });

  // ─── Toggle milestone ─────────────────────────────────────────────────────────
  const toggleMilestoneMut = useMutation({
    mutationFn: async ({ goalId, milestoneId }: { goalId: string; milestoneId: string }) => {
      const goal = goals.find((g) => g.id === goalId);
      if (!goal) return;
      const milestone = goal.milestones.find((m) => m.id === milestoneId);
      if (!milestone) return;
      const newCompleted = !milestone.completed;
      const { error } = await supabase
        .from('milestones')
        .update({ completed: newCompleted })
        .eq('id', milestoneId);
      if (error) throw error;
      // Recompute goal progress
      const newMilestones = goal.milestones.map((m) =>
        m.id === milestoneId ? { ...m, completed: newCompleted } : m
      );
      const completedCount = newMilestones.filter((m) => m.completed).length;
      const newProgress =
        newMilestones.length > 0
          ? Math.round((completedCount / newMilestones.length) * 100)
          : goal.progress;
      await supabase
        .from('goals')
        .update({ progress: newProgress, completed: newProgress >= 100 })
        .eq('id', goalId);
    },
    onMutate: async ({ goalId, milestoneId }) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const prev = queryClient.getQueryData<Goal[]>(KEY);
      queryClient.setQueryData<Goal[]>(KEY, (old = []) =>
        old.map((g) => {
          if (g.id !== goalId) return g;
          const newMilestones = g.milestones.map((m) =>
            m.id === milestoneId ? { ...m, completed: !m.completed } : m
          );
          const completedCount = newMilestones.filter((m) => m.completed).length;
          const newProgress =
            newMilestones.length > 0
              ? Math.round((completedCount / newMilestones.length) * 100)
              : g.progress;
          return { ...g, milestones: newMilestones, progress: newProgress, completed: newProgress >= 100 };
        })
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(KEY, ctx?.prev),
    onSettled: invalidate,
  });

  // ─── Delete milestone ─────────────────────────────────────────────────────────
  const deleteMilestoneMut = useMutation({
    mutationFn: async ({ milestoneId }: { goalId: string; milestoneId: string }) => {
      const { error } = await supabase.from('milestones').delete().eq('id', milestoneId);
      if (error) throw error;
    },
    onMutate: async ({ goalId, milestoneId }) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const prev = queryClient.getQueryData<Goal[]>(KEY);
      queryClient.setQueryData<Goal[]>(KEY, (old = []) =>
        old.map((g) =>
          g.id === goalId
            ? { ...g, milestones: g.milestones.filter((m) => m.id !== milestoneId) }
            : g
        )
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(KEY, ctx?.prev),
    onSettled: invalidate,
  });

  const activeGoals = goals.filter((g) => !g.completed);
  const completedGoals = goals.filter((g) => g.completed);
  const avgProgress =
    activeGoals.length > 0
      ? Math.round(activeGoals.reduce((s, g) => s + g.progress, 0) / activeGoals.length)
      : 0;

  return {
    isLoading, isError,
    goals,
    addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'completed' | 'milestones'>) =>
      addGoalMut.mutate(goal),
    deleteGoal: (id: string) => deleteGoalMut.mutate(id),
    updateProgress: (id: string, progress: number) =>
      updateProgressMut.mutate({ id, progress }),
    toggleComplete: (id: string) => toggleCompleteMut.mutate(id),
    addMilestone: (goalId: string, title: string) =>
      addMilestoneMut.mutate({ goalId, title }),
    toggleMilestone: (goalId: string, milestoneId: string) =>
      toggleMilestoneMut.mutate({ goalId, milestoneId }),
    deleteMilestone: (goalId: string, milestoneId: string) =>
      deleteMilestoneMut.mutate({ goalId, milestoneId }),
    activeGoals,
    completedGoals,
    avgProgress,
  };
}
