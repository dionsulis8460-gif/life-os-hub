import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { StudySession, Subject, Topic, DEFAULT_SUBJECTS } from '@/types/study';
import { startOfWeek, endOfWeek, isWithinInterval, parseISO, format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ─── useSubjects ────────────────────────────────────────────────────────────

export function useSubjects() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const KEY = ['study_subjects', user?.id];

  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: KEY,
    queryFn: async () => {
      const { data: subs, error: subsError } = await supabase
        .from('study_subjects')
        .select('*, study_topics(*)')
        .eq('user_id', user!.id)
        .order('position');
      if (subsError) throw subsError;

      if (!subs || subs.length === 0) {
        // Seed default subjects for new users
        const inserts = DEFAULT_SUBJECTS.map((s, i) => ({
          user_id: user!.id,
          label: s.label,
          color: s.color,
          completed: false,
          position: i,
        }));
        const { data: inserted, error: insertError } = await supabase
          .from('study_subjects')
          .insert(inserts)
          .select('*, study_topics(*)');
        if (insertError) throw insertError;
        return (inserted ?? []).map(rowToSubject);
      }

      return subs.map(rowToSubject);
    },
    enabled: !!user,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: KEY });

  const addSubject = useCallback(async (label: string, color: string) => {
    const position = subjects.length;
    const { error } = await supabase
      .from('study_subjects')
      .insert({ user_id: user!.id, label, color, completed: false, position });
    if (error) throw error;
    invalidate();
  }, [subjects, user]);

  const deleteSubject = useCallback(async (id: string) => {
    const { error } = await supabase.from('study_subjects').delete().eq('id', id);
    if (error) throw error;
    queryClient.setQueryData<Subject[]>(KEY, (old = []) => old.filter((s) => s.id !== id));
    invalidate();
  }, [user]);

  const toggleSubjectCompleted = useCallback(async (id: string) => {
    const subject = subjects.find((s) => s.id === id);
    if (!subject) return;
    const newCompleted = !subject.completed;
    const { error } = await supabase
      .from('study_subjects')
      .update({ completed: newCompleted })
      .eq('id', id);
    if (error) throw error;
    // Also toggle all topics
    if (subject.topics.length > 0) {
      await supabase
        .from('study_topics')
        .update({ completed: newCompleted })
        .in('id', subject.topics.map((t) => (t as Topic).id).filter(Boolean) as string[]);
    }
    invalidate();
  }, [subjects, user]);

  const addTopic = useCallback(async (subjectId: string, topicName: string) => {
    const subject = subjects.find((s) => s.id === subjectId);
    const position = subject ? subject.topics.length : 0;
    const { error } = await supabase
      .from('study_topics')
      .insert({ subject_id: subjectId, name: topicName, completed: false, position });
    if (error) throw error;
    invalidate();
  }, [subjects, user]);

  const deleteTopic = useCallback(async (subjectId: string, topicIndex: number) => {
    const subject = subjects.find((s) => s.id === subjectId);
    if (!subject) return;
    const topic = subject.topics[topicIndex];
    if (!topic?.id) return;
    const { error } = await supabase.from('study_topics').delete().eq('id', topic.id);
    if (error) throw error;
    invalidate();
  }, [subjects, user]);

  const toggleTopicCompleted = useCallback(async (subjectId: string, topicIndex: number) => {
    const subject = subjects.find((s) => s.id === subjectId);
    if (!subject) return;
    const topic = subject.topics[topicIndex];
    if (!topic?.id) return;
    const newCompleted = !topic.completed;
    const { error } = await supabase
      .from('study_topics')
      .update({ completed: newCompleted })
      .eq('id', topic.id);
    if (error) throw error;
    // Check if all topics are now done → mark subject complete
    const newTopics = subject.topics.map((t, i) =>
      i === topicIndex ? { ...t, completed: newCompleted } : t
    );
    const allDone = newTopics.length > 0 && newTopics.every((t) => t.completed);
    if (allDone !== subject.completed) {
      await supabase.from('study_subjects').update({ completed: allDone }).eq('id', subjectId);
    }
    invalidate();
  }, [subjects, user]);

  return {
    subjects,
    addSubject,
    deleteSubject,
    addTopic,
    deleteTopic,
    toggleSubjectCompleted,
    toggleTopicCompleted,
  };
}

// ─── useStudy ────────────────────────────────────────────────────────────────

export function useStudy() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const KEY = ['study_sessions', user?.id];

  const { data: sessions = [] } = useQuery<StudySession[]>({
    queryKey: KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) => ({
        id: r.id,
        subject: r.subject,
        topic: r.topic ?? undefined,
        duration: r.duration,
        date: r.date,
        type: r.type as StudySession['type'],
        completedPomodoros: r.completed_pomodoros,
      }));
    },
    enabled: !!user,
  });

  const addSessionMut = useMutation({
    mutationFn: async (session: Omit<StudySession, 'id'>) => {
      const { error } = await supabase.from('study_sessions').insert({
        user_id: user!.id,
        subject: session.subject,
        topic: session.topic ?? null,
        duration: session.duration,
        date: session.date,
        type: session.type,
        completed_pomodoros: session.completedPomodoros ?? 0,
      });
      if (error) throw error;
    },
    onMutate: async (session) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const prev = queryClient.getQueryData<StudySession[]>(KEY);
      queryClient.setQueryData<StudySession[]>(KEY, (old = []) => [
        { ...session, id: crypto.randomUUID() },
        ...old,
      ]);
      return { prev };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(KEY, ctx?.prev),
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });

  const deleteSessionMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('study_sessions').delete().eq('id', id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const prev = queryClient.getQueryData<StudySession[]>(KEY);
      queryClient.setQueryData<StudySession[]>(KEY, (old = []) => old.filter((s) => s.id !== id));
      return { prev };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(KEY, ctx?.prev),
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  const weekSessions = sessions.filter((s) => {
    const d = parseISO(s.date);
    return isWithinInterval(d, { start: weekStart, end: weekEnd });
  });

  const totalWeekMinutes = weekSessions.reduce((sum, s) => sum + s.duration, 0);
  const totalPomodoros = weekSessions.reduce((sum, s) => sum + (s.completedPomodoros || 0), 0);

  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(today, 6 - i);
    const dayStr = format(day, 'yyyy-MM-dd');
    const mins = sessions
      .filter((s) => s.date.startsWith(dayStr))
      .reduce((sum, s) => sum + s.duration, 0);
    return {
      day: format(day, 'EEE', { locale: ptBR }),
      minutos: mins,
    };
  });

  const todayStr = format(today, 'yyyy-MM-dd');
  const todayMinutes = sessions
    .filter((s) => s.date.startsWith(todayStr))
    .reduce((sum, s) => sum + s.duration, 0);

  return {
    sessions,
    addSession: (session: Omit<StudySession, 'id'>) => addSessionMut.mutate(session),
    deleteSession: (id: string) => deleteSessionMut.mutate(id),
    weekSessions,
    totalWeekMinutes,
    totalPomodoros,
    dailyData,
    todayMinutes,
  };
}

// ─── usePomodoro (timer only — no Supabase) ──────────────────────────────────

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
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (!isBreak) {
              setCompletedPomodoros((p) => p + 1);
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

  const toggle = useCallback(() => setIsRunning((r) => !r), []);
  const reset = useCallback(() => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(workMinutes * 60);
    setCompletedPomodoros(0);
  }, [workMinutes]);

  const changeWorkMinutes = useCallback(
    (mins: number) => {
      setWorkMinutes(mins);
      if (!isRunning && !isBreak) {
        setTimeLeft(mins * 60);
      }
    },
    [isRunning, isBreak]
  );

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return {
    display,
    isRunning,
    isBreak,
    toggle,
    reset,
    progress,
    completedPomodoros,
    timeLeft,
    totalSeconds,
    workMinutes,
    changeWorkMinutes,
  };
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function rowToSubject(row: Record<string, unknown>): Subject {
  const topics = (row.study_topics as Array<Record<string, unknown>> | null) ?? [];
  return {
    id: row.id as string,
    label: row.label as string,
    color: row.color as string,
    completed: row.completed as boolean,
    topics: topics
      .sort((a, b) => (a.position as number) - (b.position as number))
      .map((t) => ({
        id: t.id as string,
        name: t.name as string,
        completed: t.completed as boolean,
      })) as Array<Topic & { id: string }>,
  };
}
