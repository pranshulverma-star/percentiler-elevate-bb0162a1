

## Plan: Add "Plan" Tab with Study Planner + Study Buddy

Add a 4th bottom nav tab called "Plan" that combines the Study Planner dashboard and Study Buddy dashboard into one scrollable view.

### Changes

**1. `src/components/dashboard/DashboardBottomNav.tsx`**
- Add `"plan"` to the `DashboardTab` union type
- Add a 4th nav item: `{ icon: CalendarCheck, label: "Plan", tab: "plan" }` (using `CalendarCheck` from lucide)

**2. Create `src/components/dashboard/PlanTab.tsx`**
- New component that stacks two sections vertically in a scrollable container:
  - **Study Planner section** — renders `DashboardPlanner` with the planner data + loading state passed as props
  - **Study Buddy section** — renders `SprintBuddyView` (shows buddy's sprint goals) and `BuddyMiniWidget` (shows buddy status/activity)
- If no buddy paired, shows the "Find a Buddy" CTA card
- If no planner started, shows the "Start Planning" CTA card (already handled by `DashboardPlanner`)
- Full-height flex layout with `overflow-y-auto`

**3. `src/pages/Dashboard.tsx`**
- Import `PlanTab`
- Add `activeTab === "plan"` conditional rendering
- Pass `plannerData`, `loadingPlanner`, and `userId` to `PlanTab`

**4. `src/components/dashboard/HomeTab.tsx`**
- Remove the `BuddyMiniWidget` from the Home tab (it now lives in the Plan tab)

### No backend changes needed. Existing data fetching in Dashboard.tsx already loads planner and buddy data.

