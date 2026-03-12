import { useState, useEffect, useCallback, useRef } from 'react';
import { StudySession } from '@/types/study';
import { startOfWeek, endOfWeek, isWithinInterval, parseISO, format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

export function usePomodoro(workMinutes = 25, breakMinutes = 5) {
  const [timeLeft, setTimeLeft] = useState(workMinutes * 60);
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

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return { display, isRunning, isBreak, toggle, reset, progress, completedPomodoros, timeLeft, totalSeconds };
}
