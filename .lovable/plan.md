

## Consolidate Phone Capture: Remove Duplicated Logic

### Problem
`PhoneCaptureModal` and `LeadModalProvider` both implement nearly identical phone capture forms and submission logic, creating maintenance burden (as seen with the duplicate-phone fix needing changes in both files).

### What Changes

**1. `src/components/LeadModalProvider.tsx`**
- Remove the inline phone Dialog form entirely (the `<Dialog>` with phone input, name input, submit handler)
- Replace it with a single `<PhoneCaptureModal>` component usage
- Keep the `openPhoneModal` context method, but instead of managing its own form state, it just opens `PhoneCaptureModal` with the right props
- Remove all duplicated state: `phone`, `nameInput`, `submitting`, and `handlePhoneSubmit`

**2. `src/components/PhoneCaptureModal.tsx`**
- Add an optional `showNameField` prop (defaults to false) to handle the case where `LeadModalProvider` shows a name input for anonymous users
- The component already supports custom `title` and `description`, so no changes needed there

### Result
- One single source of truth for phone capture logic
- Future fixes (like the duplicate phone check) only need to be applied once
- `LeadModalProvider` stays as the global context provider but delegates UI to `PhoneCaptureModal`

### Technical Details

**`PhoneCaptureModal.tsx` changes:**
- Add `showNameField?: boolean` to `PhoneCaptureModalProps`
- Add a name input field that renders when `showNameField` is true and no user name is available
- Include the name in the upsert payload and persist to localStorage

**`LeadModalProvider.tsx` changes:**
- Remove ~60 lines of form state, validation, and submit logic
- Remove the inline `<Dialog>` JSX (~30 lines)
- Add `<PhoneCaptureModal open={phoneOpen} onOpenChange={setPhoneOpen} source={source} onSuccess={onSuccessCb} showNameField />` 
- Keep `openContentGate` and `openPhoneModal` context methods unchanged in their external API

