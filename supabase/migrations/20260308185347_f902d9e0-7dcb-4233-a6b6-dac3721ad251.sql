
CREATE TABLE public.practice_lab_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  section_id TEXT NOT NULL,
  chapter_slug TEXT NOT NULL,
  total_questions INTEGER NOT NULL,
  correct INTEGER NOT NULL DEFAULT 0,
  incorrect INTEGER NOT NULL DEFAULT 0,
  unanswered INTEGER NOT NULL DEFAULT 0,
  score_pct INTEGER NOT NULL DEFAULT 0,
  time_used_seconds INTEGER NOT NULL DEFAULT 0,
  answers_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.practice_lab_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own attempts"
  ON public.practice_lab_attempts
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read own attempts"
  ON public.practice_lab_attempts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX idx_practice_attempts_user ON public.practice_lab_attempts (user_id, created_at DESC);
CREATE INDEX idx_practice_attempts_chapter ON public.practice_lab_attempts (user_id, section_id, chapter_slug);
