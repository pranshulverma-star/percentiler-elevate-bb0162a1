
-- Table: planner_entries
CREATE TABLE public.planner_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number text NOT NULL,
  date date NOT NULL,
  qa_topic text,
  qa_questions integer DEFAULT 0,
  lrdi_topic text,
  lrdi_sets integer DEFAULT 0,
  varc_topic text,
  varc_questions integer DEFAULT 0,
  is_mock_day boolean DEFAULT false,
  weekly_test boolean DEFAULT false,
  completion_status jsonb DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_planner_entries_phone ON public.planner_entries(phone_number);
CREATE INDEX idx_planner_entries_phone_date ON public.planner_entries(phone_number, date);

ALTER TABLE public.planner_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous insert planner_entries" ON public.planner_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous select planner_entries" ON public.planner_entries FOR SELECT USING (true);
CREATE POLICY "Allow anonymous update planner_entries" ON public.planner_entries FOR UPDATE USING (true);

-- Table: planner_stats
CREATE TABLE public.planner_stats (
  phone_number text NOT NULL PRIMARY KEY,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  target_year integer NOT NULL,
  crash_mode boolean DEFAULT false,
  current_phase text,
  last_generated_index integer DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.planner_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous insert planner_stats" ON public.planner_stats FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous select planner_stats" ON public.planner_stats FOR SELECT USING (true);
CREATE POLICY "Allow anonymous update planner_stats" ON public.planner_stats FOR UPDATE USING (true);
