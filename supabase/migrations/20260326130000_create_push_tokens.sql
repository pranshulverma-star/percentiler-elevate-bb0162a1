CREATE TABLE push_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  token text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, token)
);

ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tokens"
  ON push_tokens FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
