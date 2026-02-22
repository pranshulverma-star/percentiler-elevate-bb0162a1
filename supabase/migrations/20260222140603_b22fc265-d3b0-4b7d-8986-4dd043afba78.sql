
-- Add UNIQUE constraint on phone_number (NULLs are allowed and won't conflict)
ALTER TABLE public.leads ADD CONSTRAINT leads_phone_number_unique UNIQUE (phone_number);
