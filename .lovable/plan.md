

## Fix: Fetch Missing Name from Database for Returning Users

### Problem

When a returning user's phone number is in `localStorage` but their name is not (due to the recent key consolidation), the lead modal still opens and asks for their name -- even though it already exists in the `leads` table.

### Solution

Update `LeadModalProvider.tsx` so that when `openModal` is called and the phone exists but the name does not, the system queries the `leads` table to retrieve the name, caches it in `localStorage`, and skips the modal.

### Technical Details

**File: `src/components/LeadModalProvider.tsx`**

1. Make `openModal` an `async` function.
2. After reading `percentilers_phone` and `percentilers_name` from `localStorage`, if phone is valid but name is empty, query the `leads` table:
   ```typescript
   const { data } = await supabase
     .from("leads")
     .select("name")
     .eq("phone_number", storedPhone)
     .maybeSingle();
   if (data?.name) {
     storedName = data.name;
     localStorage.setItem("percentilers_name", storedName);
   }
   ```
3. Keep the existing skip logic (`if phone && name, skip modal`) -- now it will also work for users whose name was fetched from the database.
4. Add a final fallback: if the phone exists but name is still not found anywhere, skip the modal anyway since the phone alone identifies the user.

This is a single-file, backward-compatible change. No database or schema changes are needed.

