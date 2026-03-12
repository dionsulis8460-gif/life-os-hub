import { useState, useEffect, useCallback, useRef } from 'react';
import { StudySession, Subject, DEFAULT_SUBJECTS } from '@/types/study';
import { startOfWeek, endOfWeek, isWithinInterval, parseISO, format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('study-subjects');
    if (saved) {
      // Migrate old format (topics as string[]) to new format
      const parsed = JSON.parse(saved);
      return parsed.map((s: any) => ({
        ...s,
        completed: s.completed ?? false,
        topics: (s.topics || []).map((t: any) =>
          typeof t === 'string' ? { name: t, completed: false } : t
        ),
      }));
    }
    return DEFAULT_SUBJECTS;
  });

  useEffect(() => {
    localStorage.setItem('study-subjects', JSON.stringify(subjects));
  }, [subjects]);

  const addSubject = useCallback((label: string, color: string) => {
    setSubjects(prev => [...prev, { id: crypto.randomUUID(), label, color, topics: [], completed: false }]);
  }, []);

  const deleteSubject = useCallback((id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
  }, []);

  const toggleSubjectCompleted = useCallback((id: string) => {
    setSubjects(prev => prev.map(s => {
      if (s.id !== id) return s;
      const newCompleted = !s.completed;
      return {
        ...s,
        completed: newCompleted,
        topics: s.topics.map(t => ({ ...t, completed: newCompleted })),
      };
    }));
  }, []);

  const addTopic = useCallback((subjectId: string, topicName: string) => {
    setSubjects(prev => prev.map(s =>
      s.id === subjectId ? { ...s, topics: [...s.topics, { name: topicName, completed: false }], completed: false } : s
    ));
  }, []);

  const deleteTopic = useCallback((subjectId: string, topicIndex: number) => {
    setSubjects(prev => prev.map(s =>
      s.id === subjectId ? { ...s, topics: s.topics.filter((_, i) => i !== topicIndex) } : s
    ));
  }, []);

  const toggleTopicCompleted = useCallback((subjectId: string, topicIndex: number) => {
    setSubjects(prev => prev.map(s => {
      if (s.id !== subjectId) return s;
      const newTopics = s.topics.map((t, i) =>
        i === topicIndex ? { ...t, completed: !t.completed } : t
      );
      const allDone = newTopics.length > 0 && newTopics.every(t => t.completed);
      return { ...s, topics: newTopics, completed: allDone };
    }));
  }, []);

  return { subjects, addSubject, deleteSubject, addTopic, deleteTopic, toggleSubjectCompleted, toggleTopicCompleted };
}

export function useStudy() {
  const [sessions, setSessions] = useState<StudySession[]>(() => {
    const saved = localStorage.getItem('study-sessions');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('study-sessions', JSON.stringify(sessions));
  }, [sessions]);

  const addSession = useCallback((session: Omit<StudySession, 'id'>) => {
    setSessions(prev => [{ ...session, id: crypto.randomUUID() }, ...prev]);
  }, []);

  const deleteSession = useCallback((id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  }, []);

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  const weekSessions = sessions.filter(s => {
    const d = parseISO(s.date);
    return isWithinInterval(d, { start: weekStart, end: weekEnd });
  });

  const totalWeekMinutes = weekSessions.reduce((sum, s) => sum + s.duration, 0);
  const totalPomodoros = weekSessions.reduce((sum, s) => sum + (s.completedPomodoros || 0), 0);

  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(today, 6 - i);
    const dayStr = format(day, 'yyyy-MM-dd');
    const mins = sessions
      .filter(s => s.date.startsWith(dayStr))
      .reduce((sum, s) => sum + s.duration, 0);
    return {
      day: format(day, 'EEE', { locale: ptBR }),
      minutos: mins,
    };
  });

  const todayStr = format(today, 'yyyy-MM-dd');
  const todayMinutes = sessions
    .filter(s => s.date.startsWith(todayStr))
    .reduce((sum, s) => sum + s.duration, 0);

  return { sessions, addSession, deleteSession, weekSessions, totalWeekMinutes, totalPomodoros, dailyData, todayMinutes };
}

export function usePomodoro(initialWorkMinutes = 25, breakMinutes = 5) {
  const [workMinutes, setWorkMinutes] = useState(initialWorkMinutes);
  const [timeLeft, setTimeLeft] = useState(initialWorkMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = isBreak ? breakMinutes * 60 : workMinutes * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (!isBreak) {
              setCompletedPomodoros(p => p + 1);
              setIsBreak(true);
              return breakMinutes * 60;
            } else {
              setIsBreak(false);
              return workMinutes * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isBreak, workMinutes, breakMinutes]);

  const toggle = useCallback(() => setIsRunning(r => !r), []);
  const reset = useCallback(() => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(workMinutes * 60);
    setCompletedPomodoros(0);
  }, [workMinutes]);

  const changeWorkMinutes = useCallback((mins: number) => {
    setWorkMinutes(mins);
    if (!isRunning && !isBreak) {
      setTimeLeft(mins * 60);
    }
  }, [isRunning, isBreak]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return { display, isRunning, isBreak, toggle, reset, progress, completedPomodoros, timeLeft, totalSeconds, workMinutes, changeWorkMinutes };
}
