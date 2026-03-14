

## Fix: Consistent Percentile + Meaningful Leaderboard Names

### Issue 1: Percentile Mismatch Between Quiz Summary and Image Card

The `ShareableResultCard` recalculates percentile internally using its own `estimatePercentile` function. Even though both formulas are now identical, this duplication is fragile. The fix is to **pass the already-computed percentile as a prop** from `ResultsView` to `ShareableResultCard`, eliminating any possibility of divergence.

**Changes:**
- **`ShareableResultCard.tsx`**: Add an optional `percentile` prop. If provided, use it directly instead of recalculating.
- **`ResultsView.tsx`**: Pass `percentile={percentile}` to the `ShareableResultCard` component.

### Issue 2: Random Student Names on Leaderboard

The leaderboard currently shows `Student 7e8b` because it only has `user_id` from `practice_lab_attempts` and no way to look up names. The user's own name comes from `user.user_metadata`, but other users' names are unknown.

**Fix:** Join against a profiles-like source or fetch user names. Since there's no profiles table, the best approach is:
- Create a `profiles` table with `id` (references auth.users), `name`, and `avatar_url`.
- Use an `on_auth_user_created` trigger to auto-populate from `raw_user_meta_data->name`.
- Update the leaderboard query to join `profiles` for display names.
- If no name exists, show "CAT Aspirant" instead of a random hex string.

**Alternatively** (simpler, no new table): Store the user's display name directly in the `practice_lab_attempts` row when saving. Then query it back for the leaderboard. This avoids a new table but denormalizes the name.

### Recommended Approach: Profiles Table

1. **Database migration**: Create `profiles` table + trigger to auto-populate on signup.
2. **`ResultsView.tsx`**: Update leaderboard fetch to join profiles for names, falling back to "CAT Aspirant".
3. **`ShareableResultCard.tsx`**: Accept `percentile` prop directly.
4. **`ResultsView.tsx`**: Pass computed percentile to ShareableResultCard.

### Technical Details

```text
profiles table:
  id         uuid PK → auth.users(id)
  name       text
  avatar_url text
  created_at timestamptz

RLS: SELECT for authenticated users (public names are fine)

Trigger: on INSERT to auth.users → insert into profiles(id, name)
  using NEW.raw_user_meta_data->>'name'
```

Leaderboard query changes from raw user_id lookup to a join:
```sql
practice_lab_attempts.user_id → profiles.name
```

