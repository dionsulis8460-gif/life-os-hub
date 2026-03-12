export interface StudySession {
  id: string;
  subject: string;
  topic?: string;
  duration: number; // in minutes
  date: string; // ISO date
  type: 'pomodoro' | 'free';
  completedPomodoros?: number;
}

export interface Topic {
  name: string;
  completed: boolean;
}

export interface Subject {
  id: string;
  label: string;
  color: string;
  topics: Topic[];
  completed: boolean;
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

export const DURATION_OPTIONS = [5, 10, 15, 20, 25, 30, 45, 60, 90, 120];

export const DEFAULT_SUBJECTS: Subject[] = [
  { id: '1', label: 'Matemática', color: DEFAULT_COLORS[0], topics: [], completed: false },
  { id: '2', label: 'Português', color: DEFAULT_COLORS[1], topics: [], completed: false },
  { id: '3', label: 'Ciências', color: DEFAULT_COLORS[2], topics: [], completed: false },
  { id: '4', label: 'História', color: DEFAULT_COLORS[3], topics: [], completed: false },
  { id: '5', label: 'Programação', color: DEFAULT_COLORS[4], topics: [], completed: false },
  { id: '6', label: 'Inglês', color: DEFAULT_COLORS[5], topics: [], completed: false },
  { id: '7', label: 'Física', color: DEFAULT_COLORS[6], topics: [], completed: false },
  { id: '8', label: 'Outro', color: DEFAULT_COLORS[7], topics: [], completed: false },
];

export { DEFAULT_COLORS };
