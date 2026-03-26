/**
 * nudge-engine/index.ts
 *
 * Daily behavioural nudge orchestrator.
 * Triggered by pg_cron at 14:30 UTC (8:00 PM IST).
 *
 * Priority order (highest first — each user receives at most ONE nudge per run):
 *   1. NOT_LOGGED_IN_7_DAYS      → email + push + in_app
 *   2. NOT_LOGGED_IN_3_DAYS      → email + push + in_app
 *   3. STREAK_ABOUT_TO_BREAK     → email + push + in_app
 *   4. NO_SPRINT_GOAL_THIS_WEEK  → push + in_app
 *   5. NO_FLASHCARDS_TODAY       → push + in_app  (lowest priority)
 *
 * Variant selection (no-repeat-back-to-back):
 *   pickVariant() reads the last variant_index from the notifications table for
 *   (user_id, nudge_type) and excludes it from the random pool, so a user never
 *   sees the same variant two runs in a row.
 *
 * Notification inserts:
 *   In-app notifications are inserted DIRECTLY from this function (not via
 *   send-push) so that inAppTitle / inAppBody / nudge_type / variant_index are
 *   all stored correctly. FCM push is sent inline using google-auth.ts, which
 *   also means we fetch ONE OAuth2 token per nudge batch instead of one per user.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  getUsersWithNoFlashcardsToday,
  getUsersWithNoSprintGoalThisWeek,
  getUsersWithStreakAboutToBreak,
  getUsersNotLoggedInDays,
  type User,
  type UserWithStreak,
} from "./queries.ts";
import {
  getVariant,
  type AnyVariant,
  type EmailVariant,
  type NudgeMessageKey,
} from "./messages.ts";
import { getGoogleAccessToken } from "../send-push/google-auth.ts";

// ─── Types ────────────────────────────────────────────────────────────────────

// Aligned with NudgeMessageKey (keyof typeof MESSAGES) so nudge_type strings
// are identical in the DB and in the messages lookup.
type NudgeType = NudgeMessageKey;

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
 * Call the send-email Edge Function for ONE user.
 * For nudge emails, passes the pre-rendered subject + body through the
 * `announcement` template (which supports {{ subject }}, {{ message }},
 * {{ cta_text }}, {{ cta_url }}).
 */
async function dispatchEmail(
  user: User,
  data: Record<string, string>
): Promise<{ sent: number; failed: number }> {
  try {
    const res = await fetch(fnUrl("send-email"), {
      method: "POST",
      headers: makeServiceHeaders(),
      body: JSON.stringify({
        to: user.email,
        template: "announcement",
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

// ─── Variant helpers ──────────────────────────────────────────────────────────

/**
 * Replace {token} placeholders in a string.
 * Only {name} and {streak} are valid tokens; unknown tokens are left as-is.
 */
function interpolate(str: string, vars: Record<string, string>): string {
  return str.replace(/\{(\w+)\}/g, (match, key) => vars[key] ?? match);
}

/**
 * Pick a variant for (user, nudgeType) that is different from the last one
 * sent to that user for that nudge type.
 *
 * Algorithm:
 *   1. Query notifications for the most recent variant_index for this
 *      (user_id, nudge_type) pair.
 *   2. Build a pool of all 4 indices, excluding the last-used index.
 *   3. Pick uniformly at random from the remaining 3.
 *
 * On first send (no history) lastIndex = -1, so all 4 variants are in pool.
 */
async function pickVariant(
  supabase: SupabaseClient,
  userId: string,
  nudgeType: string
): Promise<{ variant: AnyVariant; variantIndex: number }> {
  const { data } = await supabase
    .from("notifications")
    .select("variant_index")
    .eq("user_id", userId)
    .eq("nudge_type", nudgeType)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const lastIndex: number = data?.variant_index ?? -1;
  const totalVariants = 4;

  // Build pool excluding last used index
  const pool = Array.from({ length: totalVariants }, (_, i) => i).filter(
    (i) => i !== lastIndex
  );

  // Pick randomly from remaining 3
  const variantIndex = pool[Math.floor(Math.random() * pool.length)];
  const variant = getVariant(nudgeType as NudgeMessageKey, variantIndex);

  return { variant, variantIndex };
}

// ─── Core nudge processor ─────────────────────────────────────────────────────

/**
 * Process a single nudge type for a list of qualifying users.
 *
 * For each user (all in parallel via Promise.allSettled):
 *   1. Call pickVariant once — no-repeat rotation
 *   2. Interpolate {name} / {streak} into all copy fields
 *   3. Send FCM push using the shared OAuth2 token fetched once per batch
 *   4. Insert in-app notification directly with nudge_type + variant_index
 *   5. Send email (for nudge types with email channel) via send-email function
 *
 * Returns a NudgeSummaryEntry with per-channel sent/failed counts.
 */
async function processNudge(
  supabase: SupabaseClient,
  users: (User | UserWithStreak)[],
  nudgeType: NudgeType,
  hasEmail: boolean
): Promise<NudgeSummaryEntry> {
  const summary: NudgeSummaryEntry = {
    users_targeted: users.length,
    push_sent: 0,
    push_failed: 0,
    email_sent: 0,
    email_failed: 0,
  };

  if (!users.length) return summary;

  // ── Get ONE FCM OAuth2 token for the entire batch ─────────────────────────
  const serviceAccountJson = Deno.env.get("FIREBASE_SERVICE_ACCOUNT_JSON") ?? "";
  let fcmAccessToken: string | null = null;
  let fcmUrl: string | null = null;

  if (serviceAccountJson) {
    try {
      fcmAccessToken = await getGoogleAccessToken(serviceAccountJson);
      const { project_id } = JSON.parse(serviceAccountJson);
      fcmUrl = `https://fcm.googleapis.com/v1/projects/${project_id}/messages:send`;
    } catch (err) {
      console.warn(`[nudge][${nudgeType}] FCM token fetch failed:`, err);
    }
  }

  // ── Batch-fetch push tokens for all users in this nudge group ─────────────
  const { data: tokenRows } = await supabase
    .from("push_tokens")
    .select("user_id, token")
    .in("user_id", users.map((u) => u.user_id));

  const tokensByUser = new Map<string, string[]>();
  for (const row of tokenRows ?? []) {
    if (!tokensByUser.has(row.user_id)) tokensByUser.set(row.user_id, []);
    tokensByUser.get(row.user_id)!.push(row.token);
  }

  // ── Per-user: pick variant → interpolate → push → in_app → email ─────────
  const perUserResults = await Promise.allSettled(
    users.map(async (user) => {
      // 1. Pick variant (called ONCE per user per nudge) ────────────────────
      const { variant, variantIndex } = await pickVariant(
        supabase,
        user.user_id,
        nudgeType
      );

      // 2. Build substitution vars ─────────────────────────────────────────
      const vars: Record<string, string> = {
        name: user.name || "there",
        streak:
          "streak_count" in user
            ? String((user as UserWithStreak).streak_count)
            : "0",
      };

      // 3. Interpolate all copy fields ──────────────────────────────────────
      const pushTitle   = interpolate(variant.pushTitle,   vars);
      const pushBody    = interpolate(variant.pushBody,    vars);
      const inAppTitle  = interpolate(variant.inAppTitle,  vars);
      const inAppBody   = interpolate(variant.inAppBody,   vars);

      // 4. FCM push (inline, using shared token) ────────────────────────────
      let pushSent = 0;
      let pushFailed = 0;

      if (fcmAccessToken && fcmUrl) {
        const tokens = tokensByUser.get(user.user_id) ?? [];
        if (tokens.length === 0) {
          // User has no registered push token — not a failure, just skip
        } else {
          const fcmResults = await Promise.allSettled(
            tokens.map((token) =>
              fetch(fcmUrl!, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${fcmAccessToken}`,
                },
                body: JSON.stringify({
                  message: {
                    token,
                    notification: { title: pushTitle, body: pushBody },
                    webpush: { fcm_options: { link: DASHBOARD_URL } },
                    data: { action_url: DASHBOARD_URL },
                  },
                }),
              }).then((r) => {
                if (!r.ok) throw new Error(`FCM HTTP ${r.status}`);
                return r;
              })
            )
          );
          for (const r of fcmResults) {
            r.status === "fulfilled" ? pushSent++ : pushFailed++;
          }
        }
      } else {
        // FCM not configured — mark as failed only if user had tokens
        if ((tokensByUser.get(user.user_id) ?? []).length > 0) pushFailed++;
      }

      // 5. In-app notification — direct insert with full metadata ──────────
      await supabase.from("notifications").insert({
        user_id: user.user_id,
        title: inAppTitle,
        body: inAppBody,
        type: "info",
        action_url: DASHBOARD_URL,
        nudge_type: nudgeType,
        variant_index: variantIndex,
      });

      // 6. Email (only for nudge types with email channel) ─────────────────
      let emailSent = 0;
      let emailFailed = 0;

      if (hasEmail && "emailSubject" in variant) {
        const ev = variant as EmailVariant;
        const result = await dispatchEmail(user, {
          name: user.name || "there",
          subject: interpolate(ev.emailSubject, vars),
          message: interpolate(ev.emailBody, vars),
          cta_text: "Open Dashboard",
          cta_url: DASHBOARD_URL,
        });
        emailSent  = result.sent;
        emailFailed = result.failed;
      }

      return { pushSent, pushFailed, emailSent, emailFailed };
    })
  );

  // ── Aggregate results ─────────────────────────────────────────────────────
  for (const r of perUserResults) {
    if (r.status === "fulfilled") {
      summary.push_sent   += r.value.pushSent;
      summary.push_failed += r.value.pushFailed;
      summary.email_sent  += r.value.emailSent;
      summary.email_failed += r.value.emailFailed;
    } else {
      summary.push_failed++;
      console.warn(`[nudge][${nudgeType}] Per-user error:`, r.reason);
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
    const supabaseUrl    = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Service-role client — needed for auth.admin.listUsers() and direct inserts
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // Deduplication set — each user receives at most one nudge per run
    const alreadyNudged = new Set<string>();

    const withDedup = <T extends User>(users: T[]): T[] =>
      users.filter((u) => !alreadyNudged.has(u.user_id));

    const markNudged = (users: (User | UserWithStreak)[]) =>
      users.forEach((u) => alreadyNudged.add(u.user_id));

    // ── PRIORITY 1: Not logged in 7+ days ─────────────────────────────────
    try {
      const raw   = await getUsersNotLoggedInDays(supabase, 7, null);
      const users = withDedup(raw);
      if (users.length > 0) {
        const entry = await processNudge(supabase, users, "NOT_LOGGED_IN_7_DAYS", true);
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
      const raw   = await getUsersNotLoggedInDays(supabase, 3, 6);
      const users = withDedup(raw);
      if (users.length > 0) {
        const entry = await processNudge(supabase, users, "NOT_LOGGED_IN_3_DAYS", true);
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
      const raw   = await getUsersWithStreakAboutToBreak(supabase);
      const users = withDedup(raw) as UserWithStreak[];
      if (users.length > 0) {
        const entry = await processNudge(supabase, users, "STREAK_ABOUT_TO_BREAK", true);
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
      const raw   = await getUsersWithNoSprintGoalThisWeek(supabase);
      const users = withDedup(raw);
      if (users.length > 0) {
        const entry = await processNudge(supabase, users, "NO_SPRINT_GOAL_THIS_WEEK", false);
        runSummary.nudges.NO_SPRINT_GOAL_THIS_WEEK = entry;
        markNudged(users);
      }
    } catch (err) {
      const msg = `NO_SPRINT_GOAL_THIS_WEEK query failed: ${err}`;
      runSummary.errors.push(msg);
      console.error("[nudge]", msg);
    }

    // ── PRIORITY 5: No flashcards today ───────────────────────────────────
    try {
      const raw   = await getUsersWithNoFlashcardsToday(supabase);
      const users = withDedup(raw);
      if (users.length > 0) {
        const entry = await processNudge(supabase, users, "NO_FLASHCARDS_TODAY", false);
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
