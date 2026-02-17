
-- Activity log for daily completion tracking
CREATE TABLE public.planner_activity (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number text NOT NULL,
  date date NOT NULL,
  subject text NOT NULL,
  completed boolean NOT NULL DEFAULT true,
  time_spent_minutes integer,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_planner_activity_phone ON public.planner_activity(phone_number);
CREATE UNIQUE INDEX idx_planner_activity_unique ON public.planner_activity(phone_number, date, subject);

ALTER TABLE public.planner_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous insert planner_activity" ON public.planner_activity FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous select planner_activity" ON public.planner_activity FOR SELECT USING (true);
CREATE POLICY "Allow anonymous update planner_activity" ON public.planner_activity FOR UPDATE USING (true);

-- Heat score for lead scoring
CREATE TABLE public.planner_heat_score (
  phone_number text NOT NULL PRIMARY KEY,
  total_active_days integer NOT NULL DEFAULT 0,
  consistency_score double precision NOT NULL DEFAULT 0,
  mock_attempts integer NOT NULL DEFAULT 0,
  crash_mode boolean NOT NULL DEFAULT false,
  days_since_join integer NOT NULL DEFAULT 0,
  heat_score integer NOT NULL DEFAULT 0,
  lead_category text NOT NULL DEFAULT 'Cold',
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.planner_heat_score ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous insert planner_heat_score" ON public.planner_heat_score FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous select planner_heat_score" ON public.planner_heat_score FOR SELECT USING (true);
CREATE POLICY "Allow anonymous update planner_heat_score" ON public.planner_heat_score FOR UPDATE USING (true);
