export interface StudySession {
  id: string;
  subject: string;
  topic?: string;
  duration: number; // in minutes
  date: string; // ISO date
  type: 'pomodoro' | 'free';
  completedPomodoros?: number;
}

export interface Subject {
  id: string;
  label: string;
  color: string;
  topics: string[];
}

const DEFAULT_COLORS = [
  'hsl(12, 90%, 60%)',
  'hsl(200, 80%, 55%)',
  'hsl(152, 69%, 53%)',
  'hsl(340, 90%, 65%)',
  'hsl(270, 70%, 60%)',
  'hsl(45, 90%, 55%)',
  'hsl(180, 60%, 50%)',
  'hsl(215, 20%, 65%)',
];

export const DEFAULT_SUBJECTS: Subject[] = [
  { id: '1', label: 'Matemática', color: DEFAULT_COLORS[0], topics: [] },
  { id: '2', label: 'Português', color: DEFAULT_COLORS[1], topics: [] },
  { id: '3', label: 'Ciências', color: DEFAULT_COLORS[2], topics: [] },
  { id: '4', label: 'História', color: DEFAULT_COLORS[3], topics: [] },
  { id: '5', label: 'Programação', color: DEFAULT_COLORS[4], topics: [] },
  { id: '6', label: 'Inglês', color: DEFAULT_COLORS[5], topics: [] },
  { id: '7', label: 'Física', color: DEFAULT_COLORS[6], topics: [] },
  { id: '8', label: 'Outro', color: DEFAULT_COLORS[7], topics: [] },
];

export { DEFAULT_COLORS };
