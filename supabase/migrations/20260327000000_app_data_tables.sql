-- ============================================================
-- App data tables: tasks, habits, finances, goals, meals, study
-- Data is isolated per user via Row-Level Security (RLS).
-- Every table has ON DELETE CASCADE to auth.users so all user
-- data is removed automatically when an account is deleted.
-- ============================================================

-- ---------- Tasks ----------
CREATE TABLE IF NOT EXISTS public.tasks (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL,
  description TEXT        NOT NULL DEFAULT '',
  priority    TEXT        NOT NULL DEFAULT 'media'
                          CHECK (priority IN ('alta', 'media', 'baixa')),
  time        TEXT        NOT NULL DEFAULT '',
  done        BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tasks"
  ON public.tasks FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------- Habits ----------
CREATE TABLE IF NOT EXISTS public.habits (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  icon        TEXT        NOT NULL DEFAULT '🎯',
  color       TEXT        NOT NULL DEFAULT '12 90% 60%',
  frequency   TEXT        NOT NULL DEFAULT 'daily'
                          CHECK (frequency IN ('daily', 'weekdays', 'weekends')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own habits"
  ON public.habits FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- One row per day the habit was completed.
CREATE TABLE IF NOT EXISTS public.habit_completions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id       UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL,
  UNIQUE (habit_id, completed_date)
);

ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own habit completions"
  ON public.habit_completions FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------- Financial transactions ----------
CREATE TABLE IF NOT EXISTS public.transactions (
  id          UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID           NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT           NOT NULL CHECK (type IN ('income', 'expense')),
  amount      NUMERIC(12, 2) NOT NULL,
  description TEXT           NOT NULL DEFAULT '',
  category    TEXT           NOT NULL,
  date        DATE           NOT NULL,
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own transactions"
  ON public.transactions FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------- Goals ----------
CREATE TABLE IF NOT EXISTS public.goals (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL,
  description TEXT        NOT NULL DEFAULT '',
  category    TEXT        NOT NULL DEFAULT 'pessoal',
  progress    INTEGER     NOT NULL DEFAULT 0
                          CHECK (progress >= 0 AND progress <= 100),
  deadline    DATE        NOT NULL,
  completed   BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own goals"
  ON public.goals FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.milestones (
  id        UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id   UUID    NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  title     TEXT    NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  position  INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own milestones"
  ON public.milestones FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.goals
    WHERE goals.id = milestones.goal_id AND goals.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.goals
    WHERE goals.id = milestones.goal_id AND goals.user_id = auth.uid()
  ));

-- ---------- Meals / nutrition ----------
CREATE TABLE IF NOT EXISTS public.meals (
  id        UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID           NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name      TEXT           NOT NULL,
  type      TEXT           NOT NULL
                           CHECK (type IN ('cafe', 'almoco', 'lanche', 'janta', 'outro')),
  calories  INTEGER        NOT NULL DEFAULT 0,
  protein   NUMERIC(6, 1)  NOT NULL DEFAULT 0,
  carbs     NUMERIC(6, 1)  NOT NULL DEFAULT 0,
  fat       NUMERIC(6, 1)  NOT NULL DEFAULT 0,
  date      TIMESTAMPTZ    NOT NULL DEFAULT now()
);

ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own meals"
  ON public.meals FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------- Study ----------
CREATE TABLE IF NOT EXISTS public.study_subjects (
  id        UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label     TEXT    NOT NULL,
  color     TEXT    NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  position  INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.study_subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own study subjects"
  ON public.study_subjects FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.study_topics (
  id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID    NOT NULL REFERENCES public.study_subjects(id) ON DELETE CASCADE,
  name       TEXT    NOT NULL,
  completed  BOOLEAN NOT NULL DEFAULT false,
  position   INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.study_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own study topics"
  ON public.study_topics FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.study_subjects
    WHERE study_subjects.id = study_topics.subject_id
      AND study_subjects.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.study_subjects
    WHERE study_subjects.id = study_topics.subject_id
      AND study_subjects.user_id = auth.uid()
  ));

CREATE TABLE IF NOT EXISTS public.study_sessions (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject             TEXT        NOT NULL,
  topic               TEXT,
  duration            INTEGER     NOT NULL,       -- minutes
  date                TIMESTAMPTZ NOT NULL DEFAULT now(),
  type                TEXT        NOT NULL DEFAULT 'free'
                                  CHECK (type IN ('pomodoro', 'free')),
  completed_pomodoros INTEGER     NOT NULL DEFAULT 0
);

ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own study sessions"
  ON public.study_sessions FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
