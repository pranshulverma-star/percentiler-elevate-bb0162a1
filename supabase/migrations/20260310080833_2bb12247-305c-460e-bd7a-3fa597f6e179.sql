-- Allow deleting orphan lead rows (user_id IS NULL) to prevent unique constraint clashes
CREATE POLICY "Allow deleting orphan leads"
ON public.leads FOR DELETE
TO public
USING (user_id IS NULL);