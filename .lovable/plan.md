

# Admin Master Dashboard Plan

## What We're Building

A protected `/admin` page that shows aggregated and per-user data across all tables — leads, planner activity, practice lab attempts, campaign states, and webinar engagement. Access restricted to your specific email address (hardcoded allowlist, validated server-side).

## Architecture

```text
/admin (ProtectedRoute + admin email check)
  ├── Summary Stats Bar — total leads, active planners, hot leads, conversions
  ├── Leads Table — all leads with search/filter, sortable columns
  ├── Planner Leaderboard — heat scores, active days, consistency
  ├── Practice Lab Analytics — aggregate scores, attempts per chapter
  └── Campaign Pipeline — workflow status breakdown, conversion funnel
```

## Access Control

Since RLS on most tables already allows anonymous/public reads, the admin page can query directly. However, `practice_lab_attempts` has user-scoped RLS. To read all attempts:

- **New DB migration**: Add an RLS policy on `practice_lab_attempts` allowing SELECT for a specific admin user ID, OR create a database function (`security definer`) that returns aggregate stats without exposing raw user data.
- Simpler approach: Create an edge function `get-admin-analytics` that uses the service role key to query all tables and returns aggregated data. The function checks the caller's JWT email against an admin allowlist.

**Recommended**: Edge function approach — keeps admin logic server-side, no RLS changes needed.

## New Files

- `src/pages/AdminDashboard.tsx` — Main admin page with tabs: Overview, Leads, Planner, Practice, Campaign
- `src/components/admin/AdminSummaryBar.tsx` — KPI cards (total leads, hot leads, conversions, active users)
- `src/components/admin/AdminLeadsTable.tsx` — Searchable, sortable table of all leads
- `src/components/admin/AdminPlannerStats.tsx` — Heat score distribution, top active users
- `src/components/admin/AdminPracticeStats.tsx` — Aggregate quiz performance, chapter-wise breakdown
- `src/components/admin/AdminCampaignPipeline.tsx` — Workflow status counts, conversion funnel
- `supabase/functions/get-admin-analytics/index.ts` — Edge function returning all admin data (service role, JWT email check)

## Modified Files

- `src/App.tsx` — Add `/admin` route with ProtectedRoute
- `public/_redirects` — Add `/admin` redirect to `index.html`

## Edge Function: `get-admin-analytics`

- Validates JWT, checks email against allowlist (your email)
- Queries all tables using service role client
- Returns: lead count, leads list, heat scores, practice aggregates, campaign status breakdown
- Single fetch from the frontend reduces complexity

## UI

- Tabs layout: Overview | Leads | Planner | Practice | Campaign
- Uses existing shadcn Table, Card, Badge, Tabs, Progress components
- Search/filter on leads table by name, email, phone, source
- Summary cards with counts and trends
- Responsive grid layout

