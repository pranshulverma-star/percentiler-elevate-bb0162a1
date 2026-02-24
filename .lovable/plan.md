

## Show error for duplicate phone numbers instead of getting stuck

### Problem
When a user logs in with a new email and enters a phone number already associated with a different account, the app gets stuck on "Saving..." instead of showing a helpful error message.

### Solution
Before attempting to save, check if the phone number already exists in the `leads` table under a different `user_id`. If it does, show an error message: **"This phone number is already registered. Please log in with your registered Gmail ID."**

This check will be added to both phone capture points:

### Changes

**1. `src/components/PhoneCaptureModal.tsx`**
- Before the upsert logic, query `leads` table for any existing row with the entered phone number
- If a row exists with a different `user_id`, show a toast error and abort submission
- Remove the old `23505` fallback code since it silently fails

**2. `src/components/LeadModalProvider.tsx`**
- Same pre-check in `handlePhoneSubmit`: query for existing phone, compare `user_id`
- Show the same error toast and abort if phone belongs to another account
- Remove the `23505` fallback code

### Logic (both files)

```text
1. User submits phone number
2. Query: SELECT user_id FROM leads WHERE phone_number = ? LIMIT 1
3. If result exists AND result.user_id != current user's ID:
     -> Show error: "This phone number is already registered. Please log in with your registered Gmail ID."
     -> Stop submission
4. Otherwise, proceed with normal upsert
```

No database changes needed -- the existing unique constraint on `phone_number` stays in place to enforce this rule at the DB level as well.

