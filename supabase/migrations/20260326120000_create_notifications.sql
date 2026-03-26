CREATE TABLE notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  type text NOT NULL DEFAULT 'info', -- 'info' | 'success' | 'warning' | 'alert'
  is_read boolean DEFAULT false,
  action_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX idx_notifications_user_id ON notifications(user_id, created_at DESC);
