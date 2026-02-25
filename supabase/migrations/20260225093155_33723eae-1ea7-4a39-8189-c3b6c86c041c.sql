CREATE TABLE public.campaign_state (
  phone_number text PRIMARY KEY,
  workflow_status text DEFAULT 'ppc_nurture',
  sequence_entry_msg integer DEFAULT 1,
  lead_source text,
  last_messaged_at timestamptz,
  next_offer_friday date,
  offer_sent_friday boolean DEFAULT false,
  offer_sent_saturday boolean DEFAULT false,
  money_constraint boolean DEFAULT false,
  call_booked_at timestamptz,
  converted_at timestamptz,
  mentorship_active boolean DEFAULT false,
  ppc_sequence_node integer DEFAULT 0,
  graphy_enrolled_free boolean DEFAULT false,
  graphy_enrolled_paid boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.campaign_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access campaign_state" ON public.campaign_state
  FOR ALL USING (true) WITH CHECK (true);