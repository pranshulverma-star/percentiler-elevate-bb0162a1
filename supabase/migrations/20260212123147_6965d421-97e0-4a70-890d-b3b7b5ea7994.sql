
-- Profile Percentile Planner table
CREATE TABLE public.profile_percentile_planner (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  tenth_score INT,
  twelfth_score INT,
  grad_score FLOAT,
  grad_stream TEXT,
  workex_months INT,
  gap_years INT,
  internships INT,
  certifications INT,
  competition_level TEXT,
  profile_score FLOAT,
  target_top10 FLOAT,
  target_top20 FLOAT,
  target_top30 FLOAT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profile_percentile_planner ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous insert" ON public.profile_percentile_planner
  FOR INSERT WITH CHECK (true);

-- Leads table
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL UNIQUE,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous insert leads" ON public.leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select by phone" ON public.leads
  FOR SELECT USING (true);

-- Allow select on planner by phone for "welcome back" check
CREATE POLICY "Allow select by phone planner" ON public.profile_percentile_planner
  FOR SELECT USING (true);
