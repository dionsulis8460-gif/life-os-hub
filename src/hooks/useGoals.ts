import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
    milestones: (row.milestones ?? []).map((m) => ({
      id: m.id,
      title: m.title,
      completed: m.completed,
    })),
  };
}

export function useGoals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const KEY = ['goals', user?.id];

  const { data: goals = [] } = useQuery<Goal[]>({
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

  const addGoal = useCallback(async (goal: Omit<Goal, 'id' | 'createdAt' | 'completed' | 'milestones'>) => {
    const { error } = await supabase
      .from('goals')
      .insert({ ...goal, user_id: user!.id, completed: false });
    if (error) throw error;
    invalidate();
  }, [user]);

  const deleteGoal = useCallback(async (id: string) => {
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (error) throw error;
    queryClient.setQueryData<Goal[]>(KEY, (old = []) => old.filter((g) => g.id !== id));
    invalidate();
  }, [user]);

  const updateProgress = useCallback(async (id: string, progress: number) => {
    const clamped = Math.min(100, Math.max(0, progress));
    const { error } = await supabase
      .from('goals')
      .update({ progress: clamped, completed: clamped >= 100 })
      .eq('id', id);
    if (error) throw error;
    queryClient.setQueryData<Goal[]>(KEY, (old = []) =>
      old.map((g) => (g.id === id ? { ...g, progress: clamped, completed: clamped >= 100 } : g))
    );
    invalidate();
  }, [user]);

  const toggleComplete = useCallback(async (id: string) => {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;
    const newCompleted = !goal.completed;
    const newProgress = newCompleted ? 100 : goal.progress;
    const { error } = await supabase
      .from('goals')
      .update({ completed: newCompleted, progress: newProgress })
      .eq('id', id);
    if (error) throw error;
    queryClient.setQueryData<Goal[]>(KEY, (old = []) =>
      old.map((g) => (g.id === id ? { ...g, completed: newCompleted, progress: newProgress } : g))
    );
    invalidate();
  }, [goals, user]);

  const addMilestone = useCallback(async (goalId: string, title: string) => {
    const goal = goals.find((g) => g.id === goalId);
    const position = goal ? goal.milestones.length : 0;
    const { error } = await supabase
      .from('milestones')
      .insert({ goal_id: goalId, title, completed: false, position });
    if (error) throw error;
    invalidate();
  }, [goals, user]);

  const toggleMilestone = useCallback(async (goalId: string, milestoneId: string) => {
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
    // Recompute goal progress from updated milestones
    const newMilestones = goal.milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: newCompleted } : m
    );
    const completedCount = newMilestones.filter((m) => m.completed).length;
    const newProgress = newMilestones.length > 0
      ? Math.round((completedCount / newMilestones.length) * 100)
      : goal.progress;
    await supabase
      .from('goals')
      .update({ progress: newProgress, completed: newProgress >= 100 })
      .eq('id', goalId);
    invalidate();
  }, [goals, user]);

  const deleteMilestone = useCallback(async (goalId: string, milestoneId: string) => {
    const { error } = await supabase.from('milestones').delete().eq('id', milestoneId);
    if (error) throw error;
    invalidate();
  }, [user]);

  const activeGoals = goals.filter((g) => !g.completed);
  const completedGoals = goals.filter((g) => g.completed);
  const avgProgress = activeGoals.length > 0
    ? Math.round(activeGoals.reduce((s, g) => s + g.progress, 0) / activeGoals.length)
    : 0;

  return {
    goals,
    addGoal,
    deleteGoal,
    updateProgress,
    toggleComplete,
    addMilestone,
    toggleMilestone,
    deleteMilestone,
    activeGoals,
    completedGoals,
    avgProgress,
  };
}
