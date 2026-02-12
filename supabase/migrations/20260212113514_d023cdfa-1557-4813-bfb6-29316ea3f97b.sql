
CREATE TABLE public.readiness_quiz (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  attempted_before TEXT NOT NULL,
  mock_percentile TEXT NOT NULL,
  hours_per_day TEXT NOT NULL,
  target_percentile TEXT NOT NULL,
  recommendation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.readiness_quiz ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert quiz responses"
ON public.readiness_quiz
FOR INSERT
WITH CHECK (true);
