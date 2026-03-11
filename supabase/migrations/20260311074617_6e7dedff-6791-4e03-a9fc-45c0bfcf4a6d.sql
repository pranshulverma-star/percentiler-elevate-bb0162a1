
-- Allow any player in the room to update status to finished
DROP POLICY "Host can update own battle rooms" ON public.battle_rooms;

CREATE POLICY "Participants can update battle rooms"
  ON public.battle_rooms FOR UPDATE TO authenticated
  USING (
    host_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.battle_players bp
      WHERE bp.room_id = battle_rooms.id AND bp.user_id = auth.uid()
    )
  );
