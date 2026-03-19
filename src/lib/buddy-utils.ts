import { supabase } from "@/integrations/supabase/client";

const CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateInviteCode(): string {
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

function todayDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export interface BuddyPair {
  id: string;
  student_a_id: string;
  student_a_name: string | null;
  student_b_id: string;
  student_b_name: string | null;
  status: string;
  created_at: string;
}

export interface BuddyActivity {
  user_id: string;
  planner_completed: boolean;
  quiz_attempted: boolean;
  streak_count: number;
  bonus_earned: boolean;
  nudge_sent: boolean;
}

export interface BuddyInvite {
  id: string;
  invite_code: string;
  inviter_id: string;
  inviter_name: string | null;
  status: string;
  expires_at: string;
}

/** Get the user's active buddy pair, if any */
export async function getActiveBuddy(userId: string): Promise<BuddyPair | null> {
  const { data } = await (supabase.from("buddy_pairs") as any)
    .select("*")
    .eq("status", "active")
    .or(`student_a_id.eq.${userId},student_b_id.eq.${userId}`)
    .maybeSingle();
  return data ?? null;
}

/** Get the user's pending invite (if any) */
export async function getPendingInvite(userId: string): Promise<BuddyInvite | null> {
  const { data } = await (supabase.from("buddy_invites") as any)
    .select("*")
    .eq("inviter_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ?? null;
}

/** Create a new invite */
export async function createInvite(userId: string, name: string | null): Promise<string> {
  const code = generateInviteCode();
  const { error } = await (supabase.from("buddy_invites") as any).insert({
    invite_code: code,
    inviter_id: userId,
    inviter_name: name,
  });
  if (error) throw error;
  return code;
}

/** Look up an invite by code */
export async function getInviteByCode(code: string): Promise<BuddyInvite | null> {
  const { data } = await (supabase.from("buddy_invites") as any)
    .select("*")
    .eq("invite_code", code.toUpperCase())
    .maybeSingle();
  return data ?? null;
}

/** Accept an invite — creates buddy_pair, marks invite accepted */
export async function acceptInvite(
  invite: BuddyInvite,
  acceptorId: string,
  acceptorName: string | null
): Promise<BuddyPair> {
  // Prevent self-invite
  if (invite.inviter_id === acceptorId) {
    throw new Error("You can't be your own study buddy!");
  }

  // Check if acceptor already has an active buddy
  const existing = await getActiveBuddy(acceptorId);
  if (existing) {
    throw new Error("You already have an active study buddy.");
  }

  // Check if inviter already has an active buddy
  const inviterBuddy = await getActiveBuddy(invite.inviter_id);
  if (inviterBuddy) {
    throw new Error("This person already has a study buddy.");
  }

  // Mark invite as accepted
  await (supabase.from("buddy_invites") as any)
    .update({ status: "accepted" })
    .eq("id", invite.id);

  // Create pair
  const { data, error } = await (supabase.from("buddy_pairs") as any)
    .insert({
      student_a_id: invite.inviter_id,
      student_a_name: invite.inviter_name,
      student_b_id: acceptorId,
      student_b_name: acceptorName,
      invite_id: invite.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Dissolve a buddy pair */
export async function dissolvePair(pairId: string): Promise<void> {
  const { error } = await (supabase.from("buddy_pairs") as any)
    .update({ status: "dissolved", dissolved_at: new Date().toISOString() })
    .eq("id", pairId);
  if (error) throw error;
}

/** Get today's activity for both users in a pair */
export async function getBuddyProgress(pairId: string): Promise<BuddyActivity[]> {
  const today = todayDate();
  const { data } = await (supabase.from("buddy_activity_log") as any)
    .select("user_id, planner_completed, quiz_attempted, streak_count, bonus_earned, nudge_sent")
    .eq("pair_id", pairId)
    .eq("activity_date", today);
  return data ?? [];
}

/** Sync today's activity from existing tables into buddy_activity_log */
export async function syncDailyActivity(
  pairId: string,
  userId: string,
  userEmail: string
): Promise<void> {
  const today = todayDate();

  // Check planner_activity (uses email in phone_number column)
  const { data: plannerData } = await supabase
    .from("planner_activity")
    .select("id")
    .eq("phone_number", userEmail)
    .eq("date", today)
    .eq("completed", true)
    .limit(1);

  const plannerCompleted = (plannerData?.length ?? 0) > 0;

  // Check practice_lab_attempts (uses user_id)
  const todayStart = `${today}T00:00:00.000Z`;
  const todayEnd = `${today}T23:59:59.999Z`;
  const { data: quizData } = await supabase
    .from("practice_lab_attempts")
    .select("id")
    .eq("user_id", userId)
    .gte("created_at", todayStart)
    .lte("created_at", todayEnd)
    .limit(1);

  const quizAttempted = (quizData?.length ?? 0) > 0;

  // Upsert into buddy_activity_log
  await (supabase.from("buddy_activity_log") as any).upsert(
    {
      pair_id: pairId,
      user_id: userId,
      activity_date: today,
      planner_completed: plannerCompleted,
      quiz_attempted: quizAttempted,
    },
    { onConflict: "pair_id,user_id,activity_date" }
  );
}

/** Calculate consecutive days where BOTH buddies were active */
export async function calculateBuddyStreak(pairId: string): Promise<number> {
  const { data } = await (supabase.from("buddy_activity_log") as any)
    .select("activity_date, user_id, planner_completed, quiz_attempted")
    .eq("pair_id", pairId)
    .order("activity_date", { ascending: false })
    .limit(200);

  if (!data || data.length === 0) return 0;

  // Group by date
  const byDate = new Map<string, Set<string>>();
  for (const row of data) {
    if (row.planner_completed || row.quiz_attempted) {
      const set = byDate.get(row.activity_date) ?? new Set();
      set.add(row.user_id);
      byDate.set(row.activity_date, set);
    }
  }

  // Count consecutive days from today where both users were active
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const activeUsers = byDate.get(dateStr);
    if (activeUsers && activeUsers.size >= 2) {
      streak++;
    } else if (i > 0) {
      break;
    }
    d.setDate(d.getDate() - 1);
  }

  return streak;
}

/** Send a nudge (MVP: just mark in activity log) */
export async function sendNudge(pairId: string, userId: string): Promise<void> {
  const today = todayDate();
  await (supabase.from("buddy_activity_log") as any).upsert(
    {
      pair_id: pairId,
      user_id: userId,
      activity_date: today,
      nudge_sent: true,
    },
    { onConflict: "pair_id,user_id,activity_date" }
  );
}

/** Get buddy's name from a pair given the current user */
export function getBuddyName(pair: BuddyPair, currentUserId: string): string {
  if (pair.student_a_id === currentUserId) {
    return pair.student_b_name || "Your Buddy";
  }
  return pair.student_a_name || "Your Buddy";
}

export function getBuddyId(pair: BuddyPair, currentUserId: string): string {
  return pair.student_a_id === currentUserId ? pair.student_b_id : pair.student_a_id;
}
