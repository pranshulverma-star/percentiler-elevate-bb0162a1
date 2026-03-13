-- Allow all authenticated users to read practice_lab_attempts for leaderboard
CREATE POLICY "Authenticated users can read all attempts for leaderboard"
ON public.practice_lab_attempts
FOR SELECT
TO authenticated
USING (true);

-- Drop the restrictive old policy
DROP POLICY IF EXISTS "Users can read own attempts" ON public.practice_lab_attempts;