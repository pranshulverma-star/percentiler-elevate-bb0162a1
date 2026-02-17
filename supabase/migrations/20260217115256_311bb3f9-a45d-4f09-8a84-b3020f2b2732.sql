
-- 1. Drop redundant CONSTRAINT on leads
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_phone_number_unique;

-- 2. Unique constraint on planner_entries(phone_number, date)
ALTER TABLE public.planner_entries
  ADD CONSTRAINT planner_entries_phone_date_unique UNIQUE (phone_number, date);

-- 3. Unique constraint on webinar_engagement(phone_number)
ALTER TABLE public.webinar_engagement
  ADD CONSTRAINT webinar_engagement_phone_unique UNIQUE (phone_number);

-- 4. Unique constraint on study_plan_days(phone_number, day_number)
ALTER TABLE public.study_plan_days
  ADD CONSTRAINT study_plan_days_phone_day_unique UNIQUE (phone_number, day_number);

-- 5. Unique constraint on profile_percentile_planner(phone_number)
ALTER TABLE public.profile_percentile_planner
  ADD CONSTRAINT profile_percentile_planner_phone_unique UNIQUE (phone_number);

-- 6. Index on readiness_quiz(phone)
CREATE INDEX IF NOT EXISTS idx_readiness_quiz_phone ON public.readiness_quiz (phone);
