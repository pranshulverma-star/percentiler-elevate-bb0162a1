-- ============================================================
-- Fix CRIT-5: campaign_state had a fully open anonymous RLS policy.
-- Drop it. Service role bypasses RLS by default, so all access
-- through edge functions continues to work unchanged.
-- No user-facing RLS needed — clients must never read this table directly.
-- ============================================================

-- Drop the open all-access policy
DROP POLICY IF EXISTS "Allow all access campaign_state" ON public.campaign_state;

-- Ensure RLS is enabled (it already was, but be explicit)
ALTER TABLE public.campaign_state ENABLE ROW LEVEL SECURITY;

-- No replacement policies are added.
-- Result: anon and authenticated roles have zero access.
-- Service role (used by all edge functions) bypasses RLS and retains full access.
