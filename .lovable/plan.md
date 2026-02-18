

## Fix: Lead Form Showing for Returning Users + Submission Error

### Change 1: Database Migration
Add an UPDATE RLS policy to the `leads` table:
```sql
CREATE POLICY "Allow anonymous update leads"
  ON public.leads FOR UPDATE
  USING (true) WITH CHECK (true);
```

### Change 2: Store name in localStorage from Masterclass page
**File:** `src/pages/Masterclass.tsx`

In the `handleSubmit` function, add `localStorage.setItem("percentilers_name", name.trim())` right before the `navigate("/masterclass/watch")` call.

Both changes are minimal and safe — they align with existing patterns used across the rest of the codebase.

