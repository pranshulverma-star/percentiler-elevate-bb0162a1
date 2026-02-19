
-- Add email and user_id columns to leads table
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Make phone_number nullable (currently NOT NULL)
ALTER TABLE public.leads ALTER COLUMN phone_number DROP NOT NULL;

-- Add unique constraint on email
ALTER TABLE public.leads ADD CONSTRAINT leads_email_unique UNIQUE (email);

-- Add unique constraint on user_id
ALTER TABLE public.leads ADD CONSTRAINT leads_user_id_unique UNIQUE (user_id);

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Allow anonymous insert leads" ON public.leads;
DROP POLICY IF EXISTS "Allow select by phone" ON public.leads;
DROP POLICY IF EXISTS "Allow anonymous update leads" ON public.leads;

-- New RLS policies: authenticated users can CRUD their own rows, anon can insert
CREATE POLICY "Users can read own leads"
ON public.leads FOR SELECT
USING (
  auth.uid() = user_id
  OR auth.uid() IS NULL
);

CREATE POLICY "Users can insert leads"
ON public.leads FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  OR user_id IS NULL
);

CREATE POLICY "Users can update own leads"
ON public.leads FOR UPDATE
USING (
  auth.uid() = user_id
  OR (user_id IS NULL AND auth.uid() IS NULL)
)
WITH CHECK (
  user_id = auth.uid()
  OR user_id IS NULL
);
