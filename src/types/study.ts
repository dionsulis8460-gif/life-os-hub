export interface StudySession {
  id: string;
  subject: string;
  duration: number; // in minutes
  date: string; // ISO date
  type: 'pomodoro' | 'free';
  completedPomodoros?: number;
}

export const SUBJECTS = [
  { label: 'Matemática', color: 'hsl(12, 90%, 60%)' },
  { label: 'Português', color: 'hsl(200, 80%, 55%)' },
  { label: 'Ciências', color: 'hsl(152, 69%, 53%)' },
  { label: 'História', color: 'hsl(340, 90%, 65%)' },
  { label: 'Programação', color: 'hsl(270, 70%, 60%)' },
  { label: 'Inglês', color: 'hsl(45, 90%, 55%)' },
  { label: 'Física', color: 'hsl(180, 60%, 50%)' },
  { label: 'Outro', color: 'hsl(215, 20%, 65%)' },
] as const;
