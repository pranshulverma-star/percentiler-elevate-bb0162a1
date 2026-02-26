ALTER TABLE public.campaign_state
  ADD COLUMN course_pitch_sent boolean DEFAULT false,
  ADD COLUMN free_call_sent boolean DEFAULT false,
  ADD COLUMN webinar_nudge_sent boolean DEFAULT false,
  ADD COLUMN money_constraint_sent boolean DEFAULT false;