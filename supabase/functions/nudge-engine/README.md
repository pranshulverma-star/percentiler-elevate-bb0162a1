# nudge-engine — Behavioural Nudge System

Daily cron Edge Function that sends personalised push + email notifications
to students based on their recent activity (or lack of it).

Runs at **8:00 PM IST (14:30 UTC)** every day via pg_cron.

---

## Priority Order

Each user receives **at most one nudge per run**. If a user qualifies for
multiple conditions, they receive only the highest-priority one.

| Priority | Nudge Type | Trigger Condition | Channels |
|----------|-----------|-------------------|----------|
| 1 (highest) | `NOT_LOGGED_IN_7_DAYS` | `last_sign_in_at < now - 7 days` | email + push |
| 2 | `NOT_LOGGED_IN_3_DAYS` | `last_sign_in_at` between 3–6 days ago | email + push |
| 3 | `STREAK_ABOUT_TO_BREAK` | Active yesterday, not today, streak ≥ 2 | email + push |
| 4 | `NO_SPRINT_GOAL_WEEK` | No sprint goal set in last 7 days | push |
| 5 (lowest) | `NO_FLASHCARDS_TODAY` | No flashcard reviewed today (IST) | push |

All push notifications also write a row to the `notifications` table
(handled inside `send-push`), which drives the in-app bell icon.

---

## Setup

### 1 — Enable pg_cron in Supabase

```
Dashboard → Database → Extensions → search "pg_cron" → Enable
```

### 2 — Set app settings (one-time, SQL Editor)

Replace the values with your actual project ref and service role key:

```sql
ALTER DATABASE postgres SET "app.supabase_url"     = 'https://XXXX.supabase.co';
ALTER DATABASE postgres SET "app.service_role_key" = 'eyJhbGci...';
```

These persist across restarts and are read by the cron job via `current_setting()`.

### 3 — Run the migration

```
supabase/migrations/20260326140000_schedule_nudge_cron.sql
```

Paste it into **Supabase Dashboard → SQL Editor** and run.

### 4 — Deploy the function

```bash
supabase functions deploy nudge-engine
```

---

## Manual Trigger

Trigger immediately from your terminal (useful for testing):

```bash
curl -X POST \
  https://YOUR_PROJECT_REF.supabase.co/functions/v1/nudge-engine \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
```

The function returns a JSON summary:

```json
{
  "ran_at": "2026-03-26T14:30:00.000Z",
  "nudges": {
    "NOT_LOGGED_IN_7_DAYS":  { "users_targeted": 5,  "push_sent": 4, "push_failed": 1, "email_sent": 5, "email_failed": 0 },
    "STREAK_ABOUT_TO_BREAK": { "users_targeted": 12, "push_sent": 12, "push_failed": 0, "email_sent": 12, "email_failed": 0 },
    "NO_FLASHCARDS_TODAY":   { "users_targeted": 87, "push_sent": 82, "push_failed": 5, "email_sent": 0, "email_failed": 0 }
  },
  "total_users_nudged": 104,
  "errors": []
}
```

---

## Testing Individual Nudge Types

The nudge engine runs all checks in sequence. To test a specific nudge
without affecting real users, use the query files directly in the SQL Editor.

### Test NO_FLASHCARDS_TODAY

```sql
-- Who qualifies for the flashcard nudge right now?
SELECT l.user_id, l.email, l.name
FROM leads l
WHERE l.user_id IS NOT NULL
  AND l.email IS NOT NULL
  AND l.user_id NOT IN (
    SELECT user_id FROM flashcard_progress
    WHERE practiced_at >= (NOW() AT TIME ZONE 'Asia/Kolkata')::date
  )
LIMIT 20;
```

### Test NO_SPRINT_GOAL_WEEK

```sql
SELECT l.user_id, l.email, l.name
FROM leads l
WHERE l.user_id IS NOT NULL
  AND l.email IS NOT NULL
  AND l.user_id NOT IN (
    SELECT user_id FROM daily_sprint_goals
    WHERE sprint_date >= (NOW() AT TIME ZONE 'Asia/Kolkata')::date - INTERVAL '6 days'
  )
LIMIT 20;
```

### Test STREAK_ABOUT_TO_BREAK

```sql
WITH yesterday AS (
  SELECT DISTINCT user_id
  FROM daily_streaks
  WHERE activity_date = ((NOW() AT TIME ZONE 'Asia/Kolkata')::date - 1)
),
today AS (
  SELECT DISTINCT user_id
  FROM daily_streaks
  WHERE activity_date = (NOW() AT TIME ZONE 'Asia/Kolkata')::date
)
SELECT l.user_id, l.email, l.name
FROM leads l
JOIN yesterday y ON y.user_id = l.user_id
WHERE l.email IS NOT NULL
  AND l.user_id NOT IN (SELECT user_id FROM today)
LIMIT 20;
```

### Test NOT_LOGGED_IN_7_DAYS (service role only)

Use `auth.admin.listUsers()` from a test Edge Function, or run this
in the SQL Editor using the `auth` schema (requires service role):

```sql
SELECT id, email, last_sign_in_at
FROM auth.users
WHERE last_sign_in_at < NOW() - INTERVAL '7 days'
   OR last_sign_in_at IS NULL
LIMIT 20;
```

---

## Adjusting the Cron Schedule

To change when the nudge engine runs, update the pg_cron schedule.
Run this in the SQL Editor:

```sql
-- Remove old schedule
SELECT cron.unschedule('daily-nudge-engine');

-- Create new schedule (example: 7:00 AM IST = 01:30 UTC)
SELECT cron.schedule(
  'daily-nudge-engine',
  '30 1 * * *',
  $$
  SELECT net.http_post(
    url     := current_setting('app.supabase_url') || '/functions/v1/nudge-engine',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    ),
    body    := '{}'::jsonb
  );
  $$
);
```

Common IST → UTC conversions:

| IST time | UTC cron expression |
|----------|-------------------|
| 7:00 AM  | `30 1 * * *`      |
| 12:00 PM | `30 6 * * *`      |
| 6:00 PM  | `30 12 * * *`     |
| 8:00 PM  | `30 14 * * *`     |
| 10:00 PM | `30 16 * * *`     |

---

## Adding a New Nudge Type

1. **Add a query function to `queries.ts`**

   ```typescript
   export async function getUsersWhoXyz(supabase: SupabaseClient): Promise<User[]> {
     // your query here
   }
   ```

2. **Add a priority slot in `index.ts`**

   Insert a new block following the existing pattern, choosing the right
   position in the priority order. Use `withDedup()` to filter and
   `markNudged()` after firing:

   ```typescript
   // ── PRIORITY N: Your new nudge ──────────────────────────────
   try {
     const raw = await getUsersWhoXyz(supabase);
     const users = withDedup(raw);
     if (users.length > 0) {
       const entry = await fireNudge(users, {
         pushTitle: "Your title here",
         pushBodyFn: (u) => `Hey ${u.name || 'there'}, your message.`,
         // emailTemplate and emailDataFn are optional
       });
       runSummary.nudges.YOUR_NEW_TYPE = entry;
       markNudged(users);
     }
   } catch (err) {
     runSummary.errors.push(`YOUR_NEW_TYPE: ${err}`);
   }
   ```

3. **Add the type to the `NudgeType` union** in `index.ts`.

4. **Deploy**: `supabase functions deploy nudge-engine`

---

## Monitoring

View cron job history in the SQL Editor:

```sql
-- Last 20 cron runs and their status
SELECT runid, jobid, status, start_time, end_time, return_message
FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 20;
```

View recent nudge notifications sent:

```sql
SELECT type, title, created_at, COUNT(*) AS count
FROM notifications
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY type, title, created_at
ORDER BY created_at DESC;
```

---

## Architecture Notes

- **IST timezone**: All date comparisons in `queries.ts` use a TypeScript IST
  offset (`UTC+5:30`). `date` columns (sprint_date, activity_date) are compared
  with YYYY-MM-DD IST strings. `timestamptz` columns (practiced_at) use ISO
  strings with explicit `+05:30` offset.

- **Deduplication**: The `alreadyNudged` Set is in-memory per run. It prevents
  a user from receiving multiple nudge types in a single cron execution.
  There is no cross-day deduplication — a user can receive a nudge every day
  they still qualify.

- **auth.users access**: `getUsersNotLoggedInDays` uses `supabase.auth.admin.listUsers()`
  which requires the service role key. It paginates in batches of 1000. For
  500 users, this is a single API call.

- **Push personalisation**: Push messages include the user's name. Because each
  message is different, `send-push` is called once per user (not batched).
  Calls are parallelised with `Promise.allSettled` to keep total latency low.

- **in_app notifications**: `send-push` already inserts a row into the
  `notifications` table for each user_id it processes. The nudge engine does not
  perform a separate insert to avoid duplicates.
