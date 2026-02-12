
-- Add name column to leads table
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS name TEXT;

-- Add unique constraint on phone_number in leads
ALTER TABLE public.leads ADD CONSTRAINT leads_phone_number_unique UNIQUE (phone_number);

-- Create webinar_engagement table
CREATE TABLE public.webinar_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  watch_percentage INT DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on phone_number
CREATE INDEX idx_webinar_engagement_phone ON public.webinar_engagement (phone_number);

-- Enable RLS
ALTER TABLE public.webinar_engagement ENABLE ROW LEVEL SECURITY;

-- Allow anonymous insert
CREATE POLICY "Allow anonymous insert engagement"
ON public.webinar_engagement
FOR INSERT
WITH CHECK (true);

-- Allow anonymous update for matching phone_number
CREATE POLICY "Allow anonymous update engagement"
ON public.webinar_engagement
FOR UPDATE
USING (true);

-- Allow anonymous select (needed for tool unlock verification)
CREATE POLICY "Allow anonymous select engagement"
ON public.webinar_engagement
FOR SELECT
USING (true);
