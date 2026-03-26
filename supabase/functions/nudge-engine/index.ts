/**
 * nudge-engine/index.ts
 *
 * Daily behavioural nudge orchestrator.
 * Triggered by pg_cron at 14:30 UTC (8:00 PM IST).
 *
 * Priority order (highest first — each user receives at most ONE nudge per run):
 *   1. NOT_LOGGED_IN_7_DAYS  → email + push + in_app
 *   2. NOT_LOGGED_IN_3_DAYS  → email + push + in_app
 *   3. STREAK_ABOUT_TO_BREAK → email + push + in_app
 *   4. NO_SPRINT_GOAL_WEEK   → push + in_app
 *   5. NO_FLASHCARDS_TODAY   → push + in_app  (lowest priority)
 *
 * Deduplication: after each priority level is processed, those user_ids are
 * added to `alreadyNudged`. Lower-priority checks skip users in that set.
 *
 * Note on in_app notifications:
 *   `send-push` already inserts a row into the `notifications` table for every
 *   user_id it processes, so we rely on that behaviour and do NOT double-insert.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  getUsersWithNoFlashcardsToday,
  getUsersWithNoSprintGoalThisWeek,
  getUsersWithStreakAboutToBreak,
  getUsersNotLoggedInDays,
  type User,
  type UserWithStreak,
} from "./queries.ts";

// ─── Types ────────────────────────────────────────────────────────────────────

type NudgeType =
  | "NOT_LOGGED_IN_7_DAYS"
  | "NOT_LOGGED_IN_3_DAYS"
  | "STREAK_ABOUT_TO_BREAK"
  | "NO_SPRINT_GOAL_WEEK"
  | "NO_FLASHCARDS_TODAY";

interface NudgeSummaryEntry {
  users_targeted: number;
  push_sent: number;
  push_failed: number;
  email_sent: number;
  email_failed: number;
  error?: string;
}

interface NudgeRunSummary {
  ran_at: string;
  nudges: Partial<Record<NudgeType, NudgeSummaryEntry>>;
  total_users_nudged: number;
  errors: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const DASHBOARD_URL = "https://percentilers.in/dashboard";

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

function makeServiceHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
  };
}

function fnUrl(name: string) {
  return `${Deno.env.get("SUPABASE_URL")}/functions/v1/${name}`;
}

/**
 * Call the send-push Edge Function for ONE user with a personalised message.
 * send-push also inserts the notification into the `notifications` table,
 * so no separate in_app insert is required.
 * Returns { sent, failed }.
 */
async function dispatchPush(
  userId: string,
  title: string,
  body: string,
  actionUrl = DASHBOARD_URL
): Promise<{ sent: number; failed: number }> {
  try {
    const res = await fetch(fnUrl("send-push"), {
      method: "POST",
      headers: makeServiceHeaders(),
      body: JSON.stringify({
        user_ids: [userId],
        title,
        body,
        action_url: actionUrl,
      }),
    });
    if (!res.ok) {
      console.warn(`[nudge] send-push HTTP ${res.status} for ${userId}`);
      return { sent: 0, failed: 1 };
    }
    const json = await res.json();
    return { sent: json.sent ?? 0, failed: json.failed ?? 0 };
  } catch (err) {
    console.warn(`[nudge] send-push threw for ${userId}:`, err);
    return { sent: 0, failed: 1 };
  }
}

/**
 * Call the send-email Edge Function for ONE user.
 */
async function dispatchEmail(
  user: User,
  template: string,
  data: Record<string, string>
): Promise<{ sent: number; failed: number }> {
  try {
    const res = await fetch(fnUrl("send-email"), {
      method: "POST",
      headers: makeServiceHeaders(),
      body: JSON.stringify({
        to: user.email,
        template,
        data,
        user_id: user.user_id,
      }),
    });
    if (!res.ok) {
      console.warn(`[nudge] send-email HTTP ${res.status} for ${user.email}`);
      return { sent: 0, failed: 1 };
    }
    const json = await res.json();
    return { sent: json.sent ?? 0, failed: json.failed ?? 0 };
  } catch (err) {
    console.warn(`[nudge] send-email threw for ${user.email}:`, err);
    return { sent: 0, failed: 1 };
  }
}

// ─── Per-nudge dispatch helpers ───────────────────────────────────────────────

/**
 * Fire push + (optionally) email for every user in the list.
 * All calls are parallelised with Promise.allSettled so one failure
 * does not block the others.
 */
async function fireNudge(
  users: (User | UserWithStreak)[],
  opts: {
    pushTitle: string;
    pushBodyFn: (u: User | UserWithStreak) => string;
    emailTemplate?: string;
    emailDataFn?: (u: User | UserWithStreak) => Record<string, string>;
  }
): Promise<NudgeSummaryEntry> {
  const summary: NudgeSummaryEntry = {
    users_targeted: users.length,
    push_sent: 0,
    push_failed: 0,
    email_sent: 0,
    email_failed: 0,
  };

  // Push: one call per user for name personalisation, all in parallel
  const pushResults = await Promise.allSettled(
    users.map((u) =>
      dispatchPush(u.user_id, opts.pushTitle, opts.pushBodyFn(u))
    )
  );
  for (const r of pushResults) {
    if (r.status === "fulfilled") {
      summary.push_sent += r.value.sent;
      summary.push_failed += r.value.failed;
    } else {
      summary.push_failed++;
    }
  }

  // Email: only for nudges that specify an email template
  if (opts.emailTemplate && opts.emailDataFn) {
    const emailResults = await Promise.allSettled(
      users.map((u) =>
        dispatchEmail(u, opts.emailTemplate!, opts.emailDataFn!(u))
      )
    );
    for (const r of emailResults) {
      if (r.status === "fulfilled") {
        summary.email_sent += r.value.sent;
        summary.email_failed += r.value.failed;
      } else {
        summary.email_failed++;
      }
    }
  }

  return summary;
}

// ─── Main handler ─────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  const runSummary: NudgeRunSummary = {
    ran_at: new Date().toISOString(),
    nudges: {},
    total_users_nudged: 0,
    errors: [],
  };

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Service-role client — needed for auth.admin.listUsers()
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // Deduplication set — each user receives at most one nudge per run
    const alreadyNudged = new Set<string>();

    // Helper: filter out already-nudged users and record them after firing
    const withDedup = <T extends User>(users: T[]): T[] =>
      users.filter((u) => !alreadyNudged.has(u.user_id));

    const markNudged = (users: (User | UserWithStreak)[]) =>
      users.forEach((u) => alreadyNudged.add(u.user_id));

    // ── PRIORITY 1: Not logged in 7+ days ─────────────────────────────────
    try {
      const raw = await getUsersNotLoggedInDays(supabase, 7, null);
      const users = withDedup(raw);

      if (users.length > 0) {
        const entry = await fireNudge(users, {
          pushTitle: "CAT 2026 prep is waiting ⏰",
          pushBodyFn: (u) =>
            `Hey ${u.name || "there"}, it's been over a week. Come back and pick up where you left off.`,
          emailTemplate: "announcement",
          emailDataFn: (u) => ({
            name: u.name || "there",
            subject: "CAT 2026 — don't fall behind 📚",
            message:
              `It's been over a week since your last session.\n\n` +
              `Every day counts for CAT prep. Your dashboard, planner and ` +
              `practice sets are all ready for you.`,
            cta_text: "Resume Prep Now",
            cta_url: DASHBOARD_URL,
          }),
        });
        runSummary.nudges.NOT_LOGGED_IN_7_DAYS = entry;
        markNudged(users);
      }
    } catch (err) {
      const msg = `NOT_LOGGED_IN_7_DAYS query failed: ${err}`;
      runSummary.errors.push(msg);
      console.error("[nudge]", msg);
    }

    // ── PRIORITY 2: Not logged in 3–6 days ────────────────────────────────
    try {
      const raw = await getUsersNotLoggedInDays(supabase, 3, 6);
      const users = withDedup(raw);

      if (users.length > 0) {
        const entry = await fireNudge(users, {
          pushTitle: "We miss you 👋",
          pushBodyFn: (u) =>
            `Hey ${u.name || "there"}, it's been a few days. Your study plan is ready when you are.`,
          emailTemplate: "reminder",
          emailDataFn: (u) => ({
            name: u.name || "there",
            streak: "0",
            task: "Jump back in — your CAT prep is waiting",
            dashboard_url: DASHBOARD_URL,
          }),
        });
        runSummary.nudges.NOT_LOGGED_IN_3_DAYS = entry;
        markNudged(users);
      }
    } catch (err) {
      const msg = `NOT_LOGGED_IN_3_DAYS query failed: ${err}`;
      runSummary.errors.push(msg);
      console.error("[nudge]", msg);
    }

    // ── PRIORITY 3: Streak about to break ─────────────────────────────────
    try {
      const raw = await getUsersWithStreakAboutToBreak(supabase);
      const users = withDedup(raw) as UserWithStreak[];

      if (users.length > 0) {
        const entry = await fireNudge(users, {
          pushTitle: "🔥 Your streak is at risk!",
          pushBodyFn: (u) => {
            const s = (u as UserWithStreak).streak_count;
            return `Hey ${u.name || "there"}, you're on a ${s}-day streak. Study anything today to keep it going.`;
          },
          emailTemplate: "reminder",
          emailDataFn: (u) => ({
            name: u.name || "there",
            streak: String((u as UserWithStreak).streak_count),
            task: "Study today to keep your streak alive",
            dashboard_url: DASHBOARD_URL,
          }),
        });
        runSummary.nudges.STREAK_ABOUT_TO_BREAK = entry;
        markNudged(users);
      }
    } catch (err) {
      const msg = `STREAK_ABOUT_TO_BREAK query failed: ${err}`;
      runSummary.errors.push(msg);
      console.error("[nudge]", msg);
    }

    // ── PRIORITY 4: No sprint goal this week ──────────────────────────────
    try {
      const raw = await getUsersWithNoSprintGoalThisWeek(supabase);
      const users = withDedup(raw);

      if (users.length > 0) {
        const entry = await fireNudge(users, {
          pushTitle: "No goals set this week 🎯",
          pushBodyFn: (u) =>
            `Hey ${u.name || "there"}, setting a daily sprint goal takes 30 seconds and keeps you on track for CAT.`,
        });
        runSummary.nudges.NO_SPRINT_GOAL_WEEK = entry;
        markNudged(users);
      }
    } catch (err) {
      const msg = `NO_SPRINT_GOAL_WEEK query failed: ${err}`;
      runSummary.errors.push(msg);
      console.error("[nudge]", msg);
    }

    // ── PRIORITY 5: No flashcards today ───────────────────────────────────
    try {
      const raw = await getUsersWithNoFlashcardsToday(supabase);
      const users = withDedup(raw);

      if (users.length > 0) {
        const entry = await fireNudge(users, {
          pushTitle: "Your flashcards are waiting 🃏",
          pushBodyFn: (u) =>
            `Hey ${u.name || "there"}, you haven't reviewed any flashcards today. 10 minutes now = better retention tomorrow.`,
        });
        runSummary.nudges.NO_FLASHCARDS_TODAY = entry;
        markNudged(users);
      }
    } catch (err) {
      const msg = `NO_FLASHCARDS_TODAY query failed: ${err}`;
      runSummary.errors.push(msg);
      console.error("[nudge]", msg);
    }

    // ── Final tally ───────────────────────────────────────────────────────
    runSummary.total_users_nudged = alreadyNudged.size;

    console.log("[nudge] Run complete:", JSON.stringify(runSummary, null, 2));

    return new Response(JSON.stringify(runSummary), {
      status: 200,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    runSummary.errors.push(String(err));
    console.error("[nudge] Fatal error:", err);
    return new Response(JSON.stringify(runSummary), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
