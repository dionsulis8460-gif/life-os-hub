import { useState, useEffect, useCallback } from 'react';
import { Goal } from '@/types/goal';
import { STORAGE_KEYS } from '@/lib/storage-keys';

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.goals);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(goals));
  }, [goals]);

  const addGoal = useCallback((goal: Omit<Goal, 'id' | 'createdAt' | 'completed' | 'milestones'>) => {
    setGoals(prev => [{
      ...goal,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      completed: false,
      milestones: [],
    }, ...prev]);
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  }, []);

  const updateProgress = useCallback((id: string, progress: number) => {
    setGoals(prev => prev.map(g =>
      g.id === id ? { ...g, progress: Math.min(100, Math.max(0, progress)), completed: progress >= 100 } : g
    ));
  }, []);

  const toggleComplete = useCallback((id: string) => {
    setGoals(prev => prev.map(g =>
      g.id === id ? { ...g, completed: !g.completed, progress: !g.completed ? 100 : g.progress } : g
    ));
  }, []);

  const addMilestone = useCallback((goalId: string, title: string) => {
    setGoals(prev => prev.map(g =>
      g.id === goalId ? { ...g, milestones: [...g.milestones, { id: crypto.randomUUID(), title, completed: false }] } : g
    ));
  }, []);

  const toggleMilestone = useCallback((goalId: string, milestoneId: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      const newMilestones = g.milestones.map(m =>
        m.id === milestoneId ? { ...m, completed: !m.completed } : m
      );
      const completedCount = newMilestones.filter(m => m.completed).length;
      const newProgress = newMilestones.length > 0 ? Math.round((completedCount / newMilestones.length) * 100) : g.progress;
      return { ...g, milestones: newMilestones, progress: newProgress, completed: newProgress >= 100 };
    }));
  }, []);

  const deleteMilestone = useCallback((goalId: string, milestoneId: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      const newMilestones = g.milestones.filter(m => m.id !== milestoneId);
      const completedCount = newMilestones.filter(m => m.completed).length;
      const newProgress = newMilestones.length > 0 ? Math.round((completedCount / newMilestones.length) * 100) : g.progress;
      return { ...g, milestones: newMilestones, progress: newProgress };
    }));
  }, []);

  const activeGoals = goals.filter(g => !g.completed);
  const completedGoals = goals.filter(g => g.completed);
  const avgProgress = activeGoals.length > 0 ? Math.round(activeGoals.reduce((s, g) => s + g.progress, 0) / activeGoals.length) : 0;

  return { goals, addGoal, deleteGoal, updateProgress, toggleComplete, addMilestone, toggleMilestone, deleteMilestone, activeGoals, completedGoals, avgProgress };
}
