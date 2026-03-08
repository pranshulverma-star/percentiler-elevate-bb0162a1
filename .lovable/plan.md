

## Auth Flow Audit — Practice Lab (ProtectedRoute + requirePhone)

### Four Scenarios Traced

**Scenario 1: No email, no phone (fresh user)**
- ProtectedRoute detects unauthenticated → triggers Google OAuth redirect
- After sign-in: AuthProvider upserts lead with user_id + email + name
- `useLeadPhone` queries DB → no phone → no localStorage → `hasPhone=false`
- PhoneCaptureModal shown (non-dismissable) → user enters phone → upserts with `onConflict: "user_id"`
- Result: **Works correctly**

**Scenario 2: Has localStorage phone, no email (returning anonymous user)**
- ProtectedRoute detects unauthenticated → triggers Google OAuth redirect
- After sign-in: AuthProvider upserts lead with user_id + email (no phone)
- `useLeadPhone` queries DB → no phone in DB → falls back to localStorage → finds phone → `hasPhone=true`
- User passes through the gate
- Result: **Bug — phone exists only in localStorage, never synced to DB lead record**. Marketing automation (n8n, campaign_state) won't have the phone for this user.

**Scenario 3: Authenticated (email), no phone**
- ProtectedRoute passes auth check → `requirePhone` triggers phone check
- `useLeadPhone` queries DB → no phone → no localStorage → `hasPhone=false`
- PhoneCaptureModal shown → user submits → upserts phone with `onConflict: "user_id"`
- Result: **Works correctly**

**Scenario 4: Both email and phone exist**
- ProtectedRoute passes auth → `useLeadPhone` finds phone in DB (or falls back to localStorage)
- `hasPhone=true` → renders children
- Result: **Works correctly**

---

### Bug: localStorage Phone Not Synced to DB (Scenario 2)

When `useLeadPhone` resolves a phone from localStorage because the DB record lacks one, it should update the DB. Currently it only caches locally.

**Fix in `src/hooks/useLeadPhone.ts`**: After resolving from localStorage when DB has no phone, fire a background upsert to sync the phone to the leads table:

```typescript
// Inside the fetch logic, after resolving phone from localStorage
if (!dbPhone && storedPhone && userId) {
  // Sync localStorage phone to DB (fire-and-forget)
  (supabase.from("leads") as any).upsert(
    { user_id: userId, phone_number: storedPhone },
    { onConflict: "user_id" }
  ).catch(() => {});
}
```

### Additional Note: PhoneCaptureModal Non-Auth Branch

The `else` branch in PhoneCaptureModal (line 76) uses `onConflict: "phone_number"`, but the unique constraint on `phone_number` was dropped in a later migration. This branch only runs when `user_id` is null (unauthenticated). With ProtectedRoute enforcing auth first, this branch is unreachable for the Practice Lab flow — but it would silently fail (insert duplicate) if ever hit from other entry points.

### Files to Edit

| File | Change |
|------|--------|
| `src/hooks/useLeadPhone.ts` | Add background DB sync when resolving phone from localStorage for authenticated users |

