
-- Battle rooms table
CREATE TABLE public.battle_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  host_user_id uuid NOT NULL,
  section_id text NOT NULL,
  chapter_slug text NOT NULL,
  questions_json jsonb NOT NULL,
  status text NOT NULL DEFAULT 'waiting',
  max_players integer NOT NULL DEFAULT 5,
  started_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Battle players table
CREATE TABLE public.battle_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.battle_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  display_name text NOT NULL DEFAULT '',
  answers_json jsonb,
  score_pct integer NOT NULL DEFAULT 0,
  correct integer NOT NULL DEFAULT 0,
  time_used_seconds integer NOT NULL DEFAULT 0,
  finished_at timestamptz,
  joined_at timestamptz NOT NULL DEFAULT now()
);

-- RLS on battle_rooms
ALTER TABLE public.battle_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read battle rooms"
  ON public.battle_rooms FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert battle rooms"
  ON public.battle_rooms FOR INSERT TO authenticated
  WITH CHECK (host_user_id = auth.uid());

CREATE POLICY "Host can update own battle rooms"
  ON public.battle_rooms FOR UPDATE TO authenticated
  USING (host_user_id = auth.uid());

-- RLS on battle_players
ALTER TABLE public.battle_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read battle players"
  ON public.battle_players FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can join battles"
  ON public.battle_players FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Players can update own battle player row"
  ON public.battle_players FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.battle_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.battle_players;
