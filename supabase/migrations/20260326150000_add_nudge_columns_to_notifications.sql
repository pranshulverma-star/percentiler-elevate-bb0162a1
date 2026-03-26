-- ============================================================
-- Phase 4b: Add nudge_type and variant_index columns to notifications
-- ============================================================
--
-- Required for the nudge-engine Edge Function:
--   • pickVariant() queries notifications filtered by (user_id, nudge_type)
--     to find the last variant_index used, enabling no-repeat-back-to-back
--     variant rotation.
--   • The direct notification insert from nudge-engine stores both columns
--     so future runs can pick a different variant.
--
-- Safe to run on an existing notifications table — uses IF NOT EXISTS.
-- ============================================================

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS nudge_type    text,
  ADD COLUMN IF NOT EXISTS variant_index integer;

-- Composite index for the pickVariant() lookup:
--   SELECT variant_index FROM notifications
--   WHERE user_id = $1 AND nudge_type = $2
--   ORDER BY created_at DESC LIMIT 1
CREATE INDEX IF NOT EXISTS idx_notifications_nudge_lookup
  ON notifications(user_id, nudge_type, created_at DESC);
