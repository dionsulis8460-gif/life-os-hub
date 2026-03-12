export interface Goal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  progress: number; // 0-100
  deadline: string; // ISO date
  createdAt: string;
  completed: boolean;
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
}

export type GoalCategory = 'saude' | 'carreira' | 'financeiro' | 'educacao' | 'pessoal' | 'outro';

export const GOAL_CATEGORIES: { value: GoalCategory; label: string; icon: string; color: string }[] = [
  { value: 'saude', label: 'Saúde', icon: '💪', color: 'hsl(152, 69%, 53%)' },
  { value: 'carreira', label: 'Carreira', icon: '💼', color: 'hsl(200, 80%, 55%)' },
  { value: 'financeiro', label: 'Financeiro', icon: '💰', color: 'hsl(45, 90%, 55%)' },
  { value: 'educacao', label: 'Educação', icon: '📚', color: 'hsl(270, 70%, 60%)' },
  { value: 'pessoal', label: 'Pessoal', icon: '🎯', color: 'hsl(12, 90%, 60%)' },
  { value: 'outro', label: 'Outro', icon: '⭐', color: 'hsl(215, 20%, 65%)' },
];
