CREATE POLICY "Allow anonymous update leads"
  ON public.leads FOR UPDATE
  USING (true) WITH CHECK (true);