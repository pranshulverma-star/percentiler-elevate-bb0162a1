-- Drop the unique constraint on phone_number that conflicts with hybrid identity model
-- (anonymous leads can capture phone before auth, causing conflicts on upsert)
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_phone_number_key;