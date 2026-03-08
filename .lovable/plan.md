

# User Dashboard Plan

## What We're Building

A `/dashboard` page accessible after Google sign-in that centralizes the user's journey in one place. It includes four modules:

1. **Profile Card** — Name, email, phone (from `leads` table), editable phone
2. **Study Planner Progress** — Current streak, heat score, daily plan completion (from `planner_stats`, `planner_activity`, `planner_heat_score`)
3. **Masterclass & Courses** — Watch progress %, quick links to masterclass, free courses, enrolled courses (from `webinar_engagement`)
4. **Strategy Call** — Book/view call status, CTA to trigger phone modal + mark-lead-hot (from `campaign_state`)

## Architecture

```text
/dashboard (ProtectedRoute, Gmail-only, no phone required)
  ├── DashboardProfile     — leads table (name, email, phone)
  ├── DashboardPlanner     — planner_stats + planner_heat_score + planner_activity
  ├── DashboardMasterclass — webinar_engagement
  └── DashboardCallCTA     — campaign_state + mark-lead-hot
```

## New Files

- `src/pages/Dashboard.tsx` — Main dashboard page with grid layout, fetches all data via user email/id
- `src/components/dashboard/DashboardProfile.tsx` — Profile card with edit phone
- `src/components/dashboard/DashboardPlanner.tsx` — Streak, heat score, phase progress
- `src/components/dashboard/DashboardMasterclass.tsx` — Watch %, resource unlock progress
- `src/components/dashboard/DashboardCallCTA.tsx` — Strategy call booking status + CTA

## Modified Files

- `src/App.tsx` — Add `/dashboard` route wrapped in `ProtectedRoute` (Gmail-only, no phone required)
- `src/components/Navbar.tsx` — Add "Dashboard" link visible when authenticated

## Data Fetching Strategy

All data is fetched on mount using the authenticated user's `user_id` (for leads) and email (for planner tables, which use email as `phone_number` identifier per existing convention). Each section handles its own loading/empty state with skeleton placeholders.

## UI Design

- Clean card-based grid: 2 columns on desktop, single column on mobile
- Uses existing shadcn Card, Progress, Badge components
- Consistent with site's dark theme and orange primary accent
- Each card shows a meaningful empty state if user hasn't engaged with that feature yet (e.g., "Start the Daily Planner" CTA)

## Route Protection

`/dashboard` uses `ProtectedRoute` with `requirePhone={false}` — only Gmail sign-in is needed. Phone capture is optional and can be done from the profile card.

