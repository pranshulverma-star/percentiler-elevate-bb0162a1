
-- Daily Sprint goals table
CREATE TABLE public.daily_sprint_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  sprint_date DATE NOT NULL DEFAULT CURRENT_DATE,
  subject TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  position INTEGER NOT NULL DEFAULT 0
);

-- Indexes
CREATE UNIQUE INDEX idx_sprint_goals_user_date_pos ON public.daily_sprint_goals(user_id, sprint_date, position);
CREATE INDEX idx_sprint_goals_user_date ON public.daily_sprint_goals(user_id, sprint_date);

-- Enable RLS
ALTER TABLE public.daily_sprint_goals ENABLE ROW LEVEL SECURITY;

-- Users can read own goals + their buddy's goals
CREATE POLICY "Users can read own and buddy sprint goals"
ON public.daily_sprint_goals FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.buddy_pairs
    WHERE status = 'active'
    AND (
      (student_a_id = auth.uid() AND student_b_id = daily_sprint_goals.user_id)
      OR (student_b_id = auth.uid() AND student_a_id = daily_sprint_goals.user_id)
    )
  )
);

CREATE POLICY "Users can insert own sprint goals"
ON public.daily_sprint_goals FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sprint goals"
ON public.daily_sprint_goals FOR UPDATE TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own sprint goals"
ON public.daily_sprint_goals FOR DELETE TO authenticated
USING (user_id = auth.uid());
