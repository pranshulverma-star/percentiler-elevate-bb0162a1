CREATE TABLE public.question_attempts (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  practice_attempt_id  uuid REFERENCES public.practice_lab_attempts(id) ON DELETE CASCADE,
  battle_player_id     uuid REFERENCES public.battle_players(id) ON DELETE CASCADE,
  question_id          integer NOT NULL,
  chapter_slug         text NOT NULL,
  section_id           text NOT NULL,
  user_answer          text,
  is_correct           boolean NOT NULL,
  difficulty           text,
  attempted_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_qa_user_time    ON public.question_attempts(user_id, attempted_at DESC);
CREATE INDEX idx_qa_user_chapter ON public.question_attempts(user_id, chapter_slug);
CREATE INDEX idx_qa_question     ON public.question_attempts(question_id);

ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own attempts"
  ON public.question_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts"
  ON public.question_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);