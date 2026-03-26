/**
 * nudge-engine/queries.ts
 *
 * All database queries for the nudge engine, each returning typed User arrays.
 * Queries are IST-aware: all date comparisons are anchored to Asia/Kolkata.
 *
 * Design notes
 * ─────────────
 * • date columns (sprint_date, activity_date) → compare with YYYY-MM-DD IST strings
 * • timestamptz columns (practiced_at) → compare with ISO strings that carry +05:30 offset
 * • auth.users.last_sign_in_at → fetched via admin.listUsers(), filtered in TS
 */

// deno-lint-ignore-file no-explicit-any
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface User {
  user_id: string;
  email: string;
  name: string;
}

export interface UserWithStreak extends User {
  streak_count: number;
}

// ─── IST date helpers ─────────────────────────────────────────────────────────

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // UTC+05:30

/**
 * Returns a YYYY-MM-DD string for the current date in IST, shifted by `offsetDays`.
 * offsetDays = 0  → today IST
 * offsetDays = -1 → yesterday IST
 * offsetDays = -6 → 6 days ago IST (inclusive start of a 7-day window)
 */
export function getISTDateString(offsetDays = 0): string {
  const d = new Date(Date.now() + IST_OFFSET_MS + offsetDays * 86_400_000);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dy = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${dy}`;
}

/**
 * Returns UTC ISO-string boundaries for "today" in IST.
 * Used to filter `timestamptz` columns like `practiced_at`.
 *
 * e.g. today IST 2026-03-26 → start: "2026-03-25T18:30:00.000Z" (midnight IST in UTC)
 */
export function getTodayISTBoundaries(): { start: string; end: string } {
  const todayIST = getISTDateString(0);
  const tomorrowIST = getISTDateString(1);
  return {
    start: `${todayIST}T00:00:00+05:30`,
    end: `${tomorrowIST}T00:00:00+05:30`,
  };
}

// ─── Shared sub-query ────────────────────────────────────────────────────────

/** All signed-up users who have both user_id and email in the leads table. */
async function getActiveLeads(supabase: SupabaseClient): Promise<User[]> {
  const { data, error } = await supabase
    .from("leads")
    .select("user_id, email, name")
    .not("user_id", "is", null)
    .not("email", "is", null);

  if (error) throw new Error(`getActiveLeads: ${error.message}`);
  return (data ?? []) as User[];
}

// ─── Exported query functions ─────────────────────────────────────────────────

/**
 * Returns users who have NOT reviewed any flashcard today (IST).
 * "Today" = practiced_at falls within today's IST calendar day.
 */
export async function getUsersWithNoFlashcardsToday(
  supabase: SupabaseClient
): Promise<User[]> {
  const { start, end } = getTodayISTBoundaries();

  const [leadsResult, flashcardResult] = await Promise.all([
    getActiveLeads(supabase),
    supabase
      .from("flashcard_progress")
      .select("user_id")
      .gte("practiced_at", start)
      .lt("practiced_at", end),
  ]);

  if (flashcardResult.error) {
    throw new Error(`flashcard_progress query: ${flashcardResult.error.message}`);
  }

  const studiedTodayIds = new Set(
    (flashcardResult.data ?? []).map((r: any) => r.user_id)
  );
  return leadsResult.filter((u) => !studiedTodayIds.has(u.user_id));
}

/**
 * Returns users who have set NO sprint goal in the last 7 days (IST).
 * Window: sprint_date >= 6 days ago IST (giving a 7-day inclusive range).
 */
export async function getUsersWithNoSprintGoalThisWeek(
  supabase: SupabaseClient
): Promise<User[]> {
  const weekAgoIST = getISTDateString(-6);

  const [leads, goalsResult] = await Promise.all([
    getActiveLeads(supabase),
    supabase
      .from("daily_sprint_goals")
      .select("user_id")
      .gte("sprint_date", weekAgoIST),
  ]);

  if (goalsResult.error) {
    throw new Error(`daily_sprint_goals query: ${goalsResult.error.message}`);
  }

  const hasGoalIds = new Set(
    (goalsResult.data ?? []).map((r: any) => r.user_id)
  );
  return leads.filter((u) => !hasGoalIds.has(u.user_id));
}

/**
 * Returns users whose streak is about to break:
 *   • Had activity yesterday (IST)
 *   • Have NO activity today (IST)
 *   • Consecutive streak from yesterday backwards is >= 2 days
 *
 * Each result includes the computed streak_count.
 */
export async function getUsersWithStreakAboutToBreak(
  supabase: SupabaseClient
): Promise<UserWithStreak[]> {
  const todayIST = getISTDateString(0);
  const yesterdayIST = getISTDateString(-1);
  const thirtyDaysAgoIST = getISTDateString(-29);

  // Parallel: leads + yesterday's active users + today's active users
  const [leads, activeYesterdayResult, activeTodayResult] = await Promise.all([
    getActiveLeads(supabase),
    supabase
      .from("daily_streaks")
      .select("user_id")
      .eq("activity_date", yesterdayIST),
    supabase
      .from("daily_streaks")
      .select("user_id")
      .eq("activity_date", todayIST),
  ]);

  if (activeYesterdayResult.error) {
    throw new Error(`daily_streaks yesterday: ${activeYesterdayResult.error.message}`);
  }
  if (activeTodayResult.error) {
    throw new Error(`daily_streaks today: ${activeTodayResult.error.message}`);
  }

  const activeTodayIds = new Set(
    (activeTodayResult.data ?? []).map((r: any) => r.user_id)
  );

  // Users active yesterday but NOT today → streak at risk
  const atRiskIds = [
    ...new Set((activeYesterdayResult.data ?? []).map((r: any) => r.user_id)),
  ].filter((uid) => !activeTodayIds.has(uid));

  if (!atRiskIds.length) return [];

  // Fetch last 30 days of activity for at-risk users to compute streak length
  const { data: recentActivity, error: recentErr } = await supabase
    .from("daily_streaks")
    .select("user_id, activity_date")
    .in("user_id", atRiskIds)
    .gte("activity_date", thirtyDaysAgoIST);

  if (recentErr) throw new Error(`recent activity fetch: ${recentErr.message}`);

  // Group unique activity dates by user_id
  const activityByUser = new Map<string, Set<string>>();
  for (const row of recentActivity ?? []) {
    if (!activityByUser.has(row.user_id)) {
      activityByUser.set(row.user_id, new Set());
    }
    activityByUser.get(row.user_id)!.add(row.activity_date);
  }

  /**
   * Count consecutive days from `yesterdayIST` backwards.
   * We start from yesterday because "today" hasn't happened yet.
   */
  const computeStreak = (dates: Set<string>): number => {
    let streak = 0;
    // Start at yesterday midnight UTC (IST date boundary)
    let cursor = new Date(`${yesterdayIST}T00:00:00Z`);
    while (true) {
      const dateStr = cursor.toISOString().slice(0, 10);
      if (dates.has(dateStr)) {
        streak++;
        cursor = new Date(cursor.getTime() - 86_400_000);
      } else {
        break;
      }
    }
    return streak;
  };

  const leadMap = new Map(leads.map((u) => [u.user_id, u]));
  const results: UserWithStreak[] = [];

  for (const uid of atRiskIds) {
    const lead = leadMap.get(uid);
    if (!lead) continue; // no email in leads — skip

    const dates = activityByUser.get(uid) ?? new Set<string>();
    const streakCount = computeStreak(dates);

    // Only nudge users with a meaningful streak (>= 2 consecutive days)
    if (streakCount < 2) continue;

    results.push({ ...lead, streak_count: streakCount });
  }

  return results;
}

/**
 * Returns users who haven't logged in for [minDays, maxDays) days.
 *
 * minDays = 7, maxDays = null → last_sign_in_at < now - 7 days (7+ days absent)
 * minDays = 3, maxDays = 6   → last_sign_in_at between now-6d and now-3d
 *
 * Requires service role client (reads auth.users via admin API).
 */
export async function getUsersNotLoggedInDays(
  supabase: SupabaseClient,
  minDays: number,
  maxDays: number | null = null
): Promise<User[]> {
  const now = Date.now();
  // Users must have been last seen BEFORE this cutoff (older than minDays)
  const olderThan = new Date(now - minDays * 86_400_000);
  // Users must have been last seen AFTER this cutoff (newer than maxDays)
  const newerThan = maxDays !== null ? new Date(now - maxDays * 86_400_000) : null;

  // Paginate through all auth users (handles > 1 000 users correctly)
  type AuthUser = { id: string; last_sign_in_at: string | null };
  const allAuthUsers: AuthUser[] = [];
  let page = 1;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    if (error) throw new Error(`listUsers page ${page}: ${error.message}`);
    allAuthUsers.push(
      ...data.users.map((u: any) => ({
        id: u.id as string,
        last_sign_in_at: (u.last_sign_in_at as string | null) ?? null,
      }))
    );
    if (data.users.length < 1000) break;
    page++;
  }

  // Filter by last_sign_in_at window
  const qualifyingIds = allAuthUsers
    .filter(({ last_sign_in_at }) => {
      if (!last_sign_in_at) {
        // Never logged in → treat as 7+ days absent (include only if minDays >= 7)
        return minDays >= 7 && newerThan === null;
      }
      const lastSeen = new Date(last_sign_in_at);
      const isOldEnough = lastSeen < olderThan; // absent for at least minDays
      const isNewEnough = newerThan === null || lastSeen >= newerThan; // not beyond maxDays
      return isOldEnough && isNewEnough;
    })
    .map((u) => u.id);

  if (!qualifyingIds.length) return [];

  // Join with leads to get email + name (filter out users with no email)
  const { data: leads, error: leadsErr } = await supabase
    .from("leads")
    .select("user_id, email, name")
    .in("user_id", qualifyingIds)
    .not("email", "is", null);

  if (leadsErr) throw new Error(`leads join for login check: ${leadsErr.message}`);
  return (leads ?? []) as User[];
}
