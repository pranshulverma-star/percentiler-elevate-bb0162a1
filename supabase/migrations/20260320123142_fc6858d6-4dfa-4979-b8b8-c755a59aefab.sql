
-- Table already exists from prior partial migration, so create if not exists
CREATE TABLE IF NOT EXISTS public.flashcard_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  card_id TEXT NOT NULL,
  category TEXT NOT NULL,
  knew BOOLEAN NOT NULL,
  practiced_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Validation trigger (function may already exist)
CREATE OR REPLACE FUNCTION public.validate_flashcard_category()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.category NOT IN ('vocab', 'idioms', 'quant_formulas', 'lrdi_tips') THEN
    RAISE EXCEPTION 'Invalid flashcard category: %', NEW.category;
  END IF;
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_validate_flashcard_category') THEN
    CREATE TRIGGER trg_validate_flashcard_category
    BEFORE INSERT OR UPDATE ON public.flashcard_progress
    FOR EACH ROW EXECUTE FUNCTION public.validate_flashcard_category();
  END IF;
END $$;

-- Immutable date extraction for index
CREATE OR REPLACE FUNCTION public.extract_date_from_timestamptz(ts TIMESTAMPTZ)
RETURNS DATE
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT ts::date;
$$;

-- Unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_flashcard_progress_user_card_date
ON public.flashcard_progress(user_id, card_id, public.extract_date_from_timestamptz(practiced_at));

-- Performance index
CREATE INDEX IF NOT EXISTS idx_flashcard_progress_user_date
ON public.flashcard_progress(user_id, category, practiced_at);

-- RLS
ALTER TABLE public.flashcard_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON public.flashcard_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON public.flashcard_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.flashcard_progress FOR UPDATE
  USING (auth.uid() = user_id);
