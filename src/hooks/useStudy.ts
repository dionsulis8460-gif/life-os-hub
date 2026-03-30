import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { StudySession, Subject, Topic, DEFAULT_SUBJECTS } from '@/types/study';
import { startOfWeek, endOfWeek, isWithinInterval, parseISO, format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { STORAGE_KEYS } from '@/lib/storage-keys';
import { localRead, localWrite } from '@/lib/local-store';

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

// ─── useSubjects ────────────────────────────────────────────────────────────

export function useSubjects() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const KEY = ['study_subjects', user?.id];
  const isLocal = !isSupabaseConfigured;
  const LKEY = STORAGE_KEYS.studySubjects;

  const persist = () =>
    localWrite(LKEY, queryClient.getQueryData<Subject[]>(KEY) ?? []);

  const { data: subjects = [], isLoading: subjectsLoading } = useQuery<Subject[]>({
    queryKey: KEY,
    queryFn: async () => {
      if (isLocal) {
        const stored = localRead<Subject>(LKEY);
        if (stored.length > 0) return stored;
        // Seed defaults on first use
        const defaults: Subject[] = DEFAULT_SUBJECTS.map((s) => ({
          id: crypto.randomUUID(),
          label: s.label,
          color: s.color,
          completed: false,
          topics: [],
        }));
        localWrite(LKEY, defaults);
        return defaults;
      }
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
    enabled: isLocal || !!user,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: KEY });

  // ─── Add subject ────────────────────────────────────────────────────────────
  const addSubjectMut = useMutation({
    mutationFn: async ({ label, color }: { label: string; color: string }) => {
      if (isLocal) return;
      const { error } = await supabase.from('study_subjects').insert({
        user_id: user!.id,
        label,
        color,
        completed: false,
        position: subjects.length,
      });
      if (error) throw error;
    },
    onMutate: async ({ label, color }) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const prev = queryClient.getQueryData<Subject[]>(KEY);
      queryClient.setQueryData<Subject[]>(KEY, (old = []) => [
        ...old,
        { id: crypto.randomUUID(), label, color, completed: false, topics: [] },
      ]);
      return { prev };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(KEY, ctx?.prev),
    onSuccess: () => { if (isLocal) persist(); },
    onSettled: invalidate,
  });

  // ─── Delete subject ─────────────────────────────────────────────────────────
  const deleteSubjectMut = useMutation({
    mutationFn: async (id: string) => {
      if (isLocal) return;
      const { error } = await supabase.from('study_subjects').delete().eq('id', id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const prev = queryClient.getQueryData<Subject[]>(KEY);
      queryClient.setQueryData<Subject[]>(KEY, (old = []) => old.filter((s) => s.id !== id));
      return { prev };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(KEY, ctx?.prev),
    onSuccess: () => { if (isLocal) persist(); },
    onSettled: invalidate,
  });

  // ─── Toggle subject completed ───────────────────────────────────────────────
  const toggleSubjectMut = useMutation({
    mutationFn: async (id: string) => {
      if (isLocal) return;
      const subject = subjects.find((s) => s.id === id);
      if (!subject) return;
      const newCompleted = !subject.completed;
      const { error } = await supabase
        .from('study_subjects')
        .update({ completed: newCompleted })
        .eq('id', id);
      if (error) throw error;
      if (subject.topics.length > 0) {
        const topicIds = subject.topics
          .map((t) => (t as Topic & { id?: string }).id)
          .filter((x): x is string => !!x);
        if (topicIds.length > 0) {
          await supabase
            .from('study_topics')
            .update({ completed: newCompleted })
            .in('id', topicIds);
        }
      }
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const prev = queryClient.getQueryData<Subject[]>(KEY);
      queryClient.setQueryData<Subject[]>(KEY, (old = []) =>
        old.map((s) => {
          if (s.id !== id) return s;
          const newCompleted = !s.completed;
          return {
            ...s,
            completed: newCompleted,
            topics: s.topics.map((t) => ({ ...t, completed: newCompleted })),
          };
        })
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(KEY, ctx?.prev),
    onSuccess: () => { if (isLocal) persist(); },
    onSettled: invalidate,
  });

  // ─── Add topic ──────────────────────────────────────────────────────────────
  const addTopicMut = useMutation({
    mutationFn: async ({ subjectId, name }: { subjectId: string; name: string }) => {
      if (isLocal) return;
      const subject = subjects.find((s) => s.id === subjectId);
      const position = subject ? subject.topics.length : 0;
      const { error } = await supabase
        .from('study_topics')
        .insert({ subject_id: subjectId, name, completed: false, position });
      if (error) throw error;
    },
    onMutate: async ({ subjectId, name }) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const prev = queryClient.getQueryData<Subject[]>(KEY);
      queryClient.setQueryData<Subject[]>(KEY, (old = []) =>
        old.map((s) =>
          s.id === subjectId
            ? {
                ...s,
                topics: [
                  ...s.topics,
                  { id: crypto.randomUUID(), name, completed: false },
                ],
              }
            : s
        )
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(KEY, ctx?.prev),
    onSuccess: () => { if (isLocal) persist(); },
    onSettled: invalidate,
  });

  // ─── Delete topic ───────────────────────────────────────────────────────────
  const deleteTopicMut = useMutation({
    mutationFn: async ({ subjectId, topicIndex }: { subjectId: string; topicIndex: number }) => {
      if (isLocal) return;
      const subject = subjects.find((s) => s.id === subjectId);
      if (!subject) return;
      const topic = subject.topics[topicIndex] as Topic & { id?: string };
      if (!topic?.id) return;
      const { error } = await supabase.from('study_topics').delete().eq('id', topic.id);
      if (error) throw error;
    },
    onMutate: async ({ subjectId, topicIndex }) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const prev = queryClient.getQueryData<Subject[]>(KEY);
      queryClient.setQueryData<Subject[]>(KEY, (old = []) =>
        old.map((s) =>
          s.id === subjectId
            ? { ...s, topics: s.topics.filter((_, i) => i !== topicIndex) }
            : s
        )
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(KEY, ctx?.prev),
    onSuccess: () => { if (isLocal) persist(); },
    onSettled: invalidate,
  });

  // ─── Toggle topic completed ─────────────────────────────────────────────────
  const toggleTopicMut = useMutation({
    mutationFn: async ({ subjectId, topicIndex }: { subjectId: string; topicIndex: number }) => {
      if (isLocal) return;
      const subject = subjects.find((s) => s.id === subjectId);
      if (!subject) return;
      const topic = subject.topics[topicIndex] as Topic & { id?: string };
      if (!topic?.id) return;
      const newCompleted = !topic.completed;
      const { error } = await supabase
        .from('study_topics')
        .update({ completed: newCompleted })
        .eq('id', topic.id);
      if (error) throw error;
      const newTopics = subject.topics.map((t, i) =>
        i === topicIndex ? { ...t, completed: newCompleted } : t
      );
      const allDone = newTopics.length > 0 && newTopics.every((t) => t.completed);
      if (allDone !== subject.completed) {
        await supabase.from('study_subjects').update({ completed: allDone }).eq('id', subjectId);
      }
    },
    onMutate: async ({ subjectId, topicIndex }) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const prev = queryClient.getQueryData<Subject[]>(KEY);
      queryClient.setQueryData<Subject[]>(KEY, (old = []) =>
        old.map((s) => {
          if (s.id !== subjectId) return s;
          const newTopics = s.topics.map((t, i) =>
            i === topicIndex ? { ...t, completed: !t.completed } : t
          );
          const allDone = newTopics.length > 0 && newTopics.every((t) => t.completed);
          return { ...s, topics: newTopics, completed: allDone };
        })
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(KEY, ctx?.prev),
    onSuccess: () => { if (isLocal) persist(); },
    onSettled: invalidate,
  });

  return {
    subjects,
    isLoading: subjectsLoading,
    addSubject: (label: string, color: string) => addSubjectMut.mutate({ label, color }),
    deleteSubject: (id: string) => deleteSubjectMut.mutate(id),
    toggleSubjectCompleted: (id: string) => toggleSubjectMut.mutate(id),
    addTopic: (subjectId: string, name: string) => addTopicMut.mutate({ subjectId, name }),
    deleteTopic: (subjectId: string, topicIndex: number) =>
      deleteTopicMut.mutate({ subjectId, topicIndex }),
    toggleTopicCompleted: (subjectId: string, topicIndex: number) =>
      toggleTopicMut.mutate({ subjectId, topicIndex }),
  };
}

// ─── useStudy ────────────────────────────────────────────────────────────────

export function useStudy() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const KEY = ['study_sessions', user?.id];
  const isLocal = !isSupabaseConfigured;
  const LKEY = STORAGE_KEYS.studySessions;

  const persist = () =>
    localWrite(LKEY, queryClient.getQueryData<StudySession[]>(KEY) ?? []);

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<StudySession[]>({
    queryKey: KEY,
    queryFn: async () => {
      if (isLocal) return localRead<StudySession>(LKEY);
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
    enabled: isLocal || !!user,
  });

  const addSessionMut = useMutation({
    mutationFn: async (session: Omit<StudySession, 'id'>) => {
      if (isLocal) return;
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
    onSuccess: () => { if (isLocal) persist(); },
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });

  const deleteSessionMut = useMutation({
    mutationFn: async (id: string) => {
      if (isLocal) return;
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
    onSuccess: () => { if (isLocal) persist(); },
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
    isLoading: sessionsLoading,
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
