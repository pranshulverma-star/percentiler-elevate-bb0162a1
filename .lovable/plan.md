

# Multiplayer Battle Quiz — Plan

## Overview
Add a "Battle Mode" where a user creates a battle room for a selected chapter, gets a shareable link, waits for up to 4 friends to join, then all players take the same 10-question quiz simultaneously. A live scoreboard shows results after everyone finishes.

## Database Changes

**New table: `battle_rooms`**
- `id` (uuid, PK)
- `code` (text, unique, 6-char alphanumeric — used in shareable URL)
- `host_user_id` (uuid, not null)
- `section_id` (text)
- `chapter_slug` (text)
- `questions_json` (jsonb — stores the 10 pre-picked questions so all players get the same set)
- `status` (text: `waiting` | `active` | `finished`, default `waiting`)
- `max_players` (int, default 5)
- `started_at` (timestamptz, nullable)
- `created_at` (timestamptz, default now())

**New table: `battle_players`**
- `id` (uuid, PK)
- `room_id` (uuid, FK → battle_rooms)
- `user_id` (uuid)
- `display_name` (text)
- `answers_json` (jsonb, nullable — submitted answers)
- `score_pct` (int, default 0)
- `correct` (int, default 0)
- `time_used_seconds` (int, default 0)
- `finished_at` (timestamptz, nullable)
- `joined_at` (timestamptz, default now())

Both tables get RLS for authenticated users. Enable realtime on `battle_players` and `battle_rooms` so lobby and scoreboard update live.

## New Route
- `/practice-lab/battle/:code` — joins an existing battle room via the shareable link

## UI Flow

### 1. Create Battle (from ChaptersView)
- Add a "Battle Mode" button next to each chapter card (sword icon)
- Clicking it creates a `battle_room` with a random 6-char code and pre-picks 10 questions
- Navigates to the **Battle Lobby** screen

### 2. Battle Lobby (`waiting` status)
- Shows the shareable link (`/practice-lab/battle/ABC123`) with a copy button and native share (Web Share API on mobile)
- Displays player avatars/names as they join (realtime subscription on `battle_players`)
- Shows "X/5 warriors joined" counter
- Host sees a "Start Battle" button (enabled when 2+ players)
- Non-host players see "Waiting for host to start..."

### 3. Quiz Phase (`active` status)
- Reuses existing `QuizView` component with the pre-set questions from `questions_json`
- On finish, player's answers/score are written to `battle_players`
- Shows a "Waiting for others..." overlay if player finishes before others

### 4. Battle Results (`finished` status)
- When all players finish (or timer expires), room status → `finished`
- Shows a ranked leaderboard with scores, time used, and a crown for the winner
- "Play Again" creates a new room with same chapter, "Back to Chapters" exits

## Shareable Link
- Format: `https://percentiler-elevate.lovable.app/practice-lab/battle/ABC123`
- When a non-authenticated user opens the link, they sign in first, then auto-join the room

## Technical Details

- **Realtime**: Subscribe to `battle_players` filtered by `room_id` for live lobby updates, and `battle_rooms` for status changes
- **Question seeding**: Host's client picks 10 random questions and stores them in `questions_json` at room creation time — all players read from this
- **Auto-finish**: A client-side check — if all `battle_players` have `finished_at` set, the last finisher updates room status to `finished`
- **Code generation**: 6-char uppercase alphanumeric, generated client-side with collision retry

## Files to Create/Edit
- **Migration**: Create `battle_rooms` and `battle_players` tables with RLS + realtime
- **`src/pages/PracticeLab.tsx`**: Add Battle button to ChaptersView, new `BattleLobby` and `BattleResults` components
- **`src/App.tsx`**: Add `/practice-lab/battle/:code` route

