
CREATE TABLE public.question_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  question_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  section_id TEXT NOT NULL,
  chapter_slug TEXT NOT NULL,
  options JSONB,
  correct_answer TEXT,
  question_type TEXT DEFAULT 'mcq',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, question_id)
);

ALTER TABLE public.question_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own bookmarks"
  ON public.question_bookmarks
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own bookmarks"
  ON public.question_bookmarks
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own bookmarks"
  ON public.question_bookmarks
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
