

## Skip Lead Capture Before Test, Gate Results Instead

### What Changes

The CAT Readiness Assessment flow will be restructured so users can take the test without providing details first. Lead capture moves to the results page, where results are blurred behind an overlay until the user submits their info (or if they're already known).

### Current Flow
```text
Hero -> Lead Capture (name/phone/target) -> Test -> Results
```

### New Flow
```text
Hero -> Section Select -> Test -> Results (gated if unknown user)
```

### User-Facing Behavior

1. "Start Assessment" / "Take Assessment" buttons go directly to the test -- no lead form upfront
2. After completing the test, the system checks localStorage for an existing phone number
3. **Known user** (phone found): Results shown immediately, no blur
4. **New user** (no phone): Results render blurred with a lead capture overlay on top. Submitting the form lifts the blur and reveals the full report
5. The target percentile defaults to "90+" for scoring when not provided upfront; the gated form includes a target percentile selector to recalculate if needed

### Technical Details

**File: `src/pages/CATReadinessAssessment.tsx`**

1. **Remove the "lead" phase**
   - Change `Phase` type from `"hero" | "lead" | "test" | "results"` to `"hero" | "test" | "results"`
   - Change `setPhase("lead")` on line 839 (SectionSelector CTA) to `setPhase("test")`
   - Change `setPhase("lead")` on line 855 (final CTA) to `setPhase("test")`
   - Remove the `phase === "lead"` rendering on line 863
   - Store section_filter and assessment_started_at when transitioning to test phase

2. **Add gated results logic to ResultsSection**
   - Add `isGated` state, initialized by checking localStorage for `percentilers_phone` or `planner_phone`
   - When gated: wrap all results content in a blurred container (`blur-lg pointer-events-none select-none`)
   - Show an overlay card on top with:
     - Heading: "Unlock Your Detailed Results"
     - Fields: Name, Phone (10-digit Indian mobile validation), Target Percentile
     - Submit button: "Show My Results"
   - On submit: save to localStorage, upsert lead to `leads` table, set `isGated = false`, recalculate score with chosen target percentile

3. **Lines affected**
   - Line 35: Update Phase type
   - Lines 839, 855: Change `setPhase("lead")` to `setPhase("test")` + store metadata
   - Line 863: Remove `phase === "lead"` block
   - Lines 546-758: Add gating logic and overlay to ResultsSection
