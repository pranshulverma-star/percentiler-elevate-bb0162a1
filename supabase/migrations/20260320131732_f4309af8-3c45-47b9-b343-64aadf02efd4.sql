
-- Create daily_streaks table for unified streak tracking
CREATE TABLE public.daily_streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_date DATE DEFAULT CURRENT_DATE NOT NULL,
  activity_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, activity_date, activity_type)
);

-- Validation trigger for activity_type
CREATE OR REPLACE FUNCTION public.validate_streak_activity_type()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.activity_type NOT IN ('quiz', 'test', 'flashcards', 'practice_lab', 'sprint') THEN
    RAISE EXCEPTION 'Invalid activity_type: %', NEW.activity_type;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_streak_activity_type_trigger
BEFORE INSERT OR UPDATE ON public.daily_streaks
FOR EACH ROW EXECUTE FUNCTION public.validate_streak_activity_type();

-- Enable RLS
ALTER TABLE public.daily_streaks ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own streaks"
ON public.daily_streaks FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks"
ON public.daily_streaks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
