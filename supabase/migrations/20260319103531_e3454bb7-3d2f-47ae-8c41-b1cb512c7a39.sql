
-- buddy_invites: stores generated invite codes
CREATE TABLE public.buddy_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invite_code VARCHAR(8) UNIQUE NOT NULL,
  inviter_id UUID NOT NULL,
  inviter_name VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days')
);

CREATE INDEX idx_buddy_invites_code ON public.buddy_invites(invite_code);
CREATE INDEX idx_buddy_invites_inviter ON public.buddy_invites(inviter_id);

-- Validation trigger for status
CREATE OR REPLACE FUNCTION public.validate_buddy_invite_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status NOT IN ('pending', 'accepted', 'expired') THEN
    RAISE EXCEPTION 'Invalid buddy_invites status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_validate_buddy_invite_status
BEFORE INSERT OR UPDATE ON public.buddy_invites
FOR EACH ROW EXECUTE FUNCTION public.validate_buddy_invite_status();

ALTER TABLE public.buddy_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own invites"
ON public.buddy_invites FOR SELECT TO authenticated
USING (inviter_id = auth.uid());

CREATE POLICY "Users can insert own invites"
ON public.buddy_invites FOR INSERT TO authenticated
WITH CHECK (inviter_id = auth.uid());

CREATE POLICY "Users can update own invites"
ON public.buddy_invites FOR UPDATE TO authenticated
USING (inviter_id = auth.uid());

-- Anyone authenticated can read invites by code (for accepting)
CREATE POLICY "Authenticated users can read invites by code"
ON public.buddy_invites FOR SELECT TO authenticated
USING (true);

-- buddy_pairs: active partnerships
CREATE TABLE public.buddy_pairs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_a_id UUID NOT NULL,
  student_a_name VARCHAR(100),
  student_b_id UUID NOT NULL,
  student_b_name VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  dissolved_at TIMESTAMPTZ,
  invite_id UUID REFERENCES public.buddy_invites(id)
);

CREATE INDEX idx_buddy_pairs_a ON public.buddy_pairs(student_a_id);
CREATE INDEX idx_buddy_pairs_b ON public.buddy_pairs(student_b_id);

CREATE OR REPLACE FUNCTION public.validate_buddy_pair_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status NOT IN ('active', 'dissolved') THEN
    RAISE EXCEPTION 'Invalid buddy_pairs status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_validate_buddy_pair_status
BEFORE INSERT OR UPDATE ON public.buddy_pairs
FOR EACH ROW EXECUTE FUNCTION public.validate_buddy_pair_status();

ALTER TABLE public.buddy_pairs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own pairs"
ON public.buddy_pairs FOR SELECT TO authenticated
USING (student_a_id = auth.uid() OR student_b_id = auth.uid());

CREATE POLICY "Users can insert pairs they belong to"
ON public.buddy_pairs FOR INSERT TO authenticated
WITH CHECK (student_a_id = auth.uid() OR student_b_id = auth.uid());

CREATE POLICY "Users can update own pairs"
ON public.buddy_pairs FOR UPDATE TO authenticated
USING (student_a_id = auth.uid() OR student_b_id = auth.uid());

-- buddy_activity_log: daily snapshot
CREATE TABLE public.buddy_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pair_id UUID NOT NULL REFERENCES public.buddy_pairs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  planner_completed BOOLEAN NOT NULL DEFAULT false,
  quiz_attempted BOOLEAN NOT NULL DEFAULT false,
  streak_count INTEGER NOT NULL DEFAULT 0,
  bonus_earned BOOLEAN NOT NULL DEFAULT false,
  nudge_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(pair_id, user_id, activity_date)
);

CREATE INDEX idx_buddy_activity_pair_date ON public.buddy_activity_log(pair_id, activity_date);

ALTER TABLE public.buddy_activity_log ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user belongs to a pair
CREATE OR REPLACE FUNCTION public.is_buddy_pair_member(_user_id UUID, _pair_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.buddy_pairs
    WHERE id = _pair_id
      AND (student_a_id = _user_id OR student_b_id = _user_id)
  )
$$;

CREATE POLICY "Users can read activity for own pairs"
ON public.buddy_activity_log FOR SELECT TO authenticated
USING (public.is_buddy_pair_member(auth.uid(), pair_id));

CREATE POLICY "Users can insert activity for own pairs"
ON public.buddy_activity_log FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() AND public.is_buddy_pair_member(auth.uid(), pair_id));

CREATE POLICY "Users can update own activity"
ON public.buddy_activity_log FOR UPDATE TO authenticated
USING (user_id = auth.uid() AND public.is_buddy_pair_member(auth.uid(), pair_id));
