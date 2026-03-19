import { supabase } from "@/integrations/supabase/client";

function todayDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export interface SprintGoal {
  id: string;
  user_id: string;
  sprint_date: string;
  subject: string;
  activity_type: string;
  description: string;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  position: number;
}

export type Subject = "quants" | "lrdi" | "varc";
export type ActivityType = "learning" | "revision" | "practice";

export const SUBJECTS: { value: Subject; label: string }[] = [
  { value: "quants", label: "Quants" },
  { value: "lrdi", label: "LRDI" },
  { value: "varc", label: "VARC" },
];

export const ACTIVITY_TYPES: { value: ActivityType; label: string }[] = [
  { value: "learning", label: "Learning Concept" },
  { value: "revision", label: "Revision" },
  { value: "practice", label: "Question Practice" },
];

/** Get today's goals for a user */
export async function getTodayGoals(userId: string): Promise<SprintGoal[]> {
  const { data, error } = await (supabase.from("daily_sprint_goals") as any)
    .select("*")
    .eq("user_id", userId)
    .eq("sprint_date", todayDate())
    .order("position", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Get today's goals for a buddy */
export async function getBuddyGoals(buddyId: string): Promise<SprintGoal[]> {
  const { data, error } = await (supabase.from("daily_sprint_goals") as any)
    .select("*")
    .eq("user_id", buddyId)
    .eq("sprint_date", todayDate())
    .order("position", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Add a new goal */
export async function addGoal(
  userId: string,
  subject: string,
  activityType: string,
  description: string,
  position: number
): Promise<SprintGoal> {
  const { data, error } = await (supabase.from("daily_sprint_goals") as any)
    .insert({
      user_id: userId,
      sprint_date: todayDate(),
      subject,
      activity_type: activityType,
      description,
      position,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Toggle goal completion */
export async function toggleGoal(goalId: string, completed: boolean): Promise<void> {
  const update: Record<string, any> = {
    completed,
    completed_at: completed ? new Date().toISOString() : null,
  };
  const { error } = await (supabase.from("daily_sprint_goals") as any)
    .update(update)
    .eq("id", goalId);
  if (error) throw error;
}

/** Delete a goal */
export async function deleteGoal(goalId: string): Promise<void> {
  const { error } = await (supabase.from("daily_sprint_goals") as any)
    .delete()
    .eq("id", goalId);
  if (error) throw error;
}

/** Calculate streak: consecutive days (going back from today) where user had goals and all were completed */
export async function calculateSprintStreak(userId: string): Promise<number> {
  const { data } = await (supabase.from("daily_sprint_goals") as any)
    .select("sprint_date, completed")
    .eq("user_id", userId)
    .order("sprint_date", { ascending: false })
    .limit(500);

  if (!data || data.length === 0) return 0;

  // Group by date
  const byDate = new Map<string, { total: number; done: number }>();
  for (const row of data) {
    const entry = byDate.get(row.sprint_date) ?? { total: 0, done: 0 };
    entry.total++;
    if (row.completed) entry.done++;
    byDate.set(row.sprint_date, entry);
  }

  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const entry = byDate.get(dateStr);
    if (entry && entry.total > 0 && entry.done === entry.total) {
      streak++;
    } else if (i > 0) {
      break; // allow today to be incomplete
    }
    d.setDate(d.getDate() - 1);
  }

  return streak;
}

/** Calculate points for today */
export function calculatePoints(goals: SprintGoal[]): number {
  if (goals.length === 0) return 0;
  const completedCount = goals.filter((g) => g.completed).length;
  let points = completedCount * 10;
  if (completedCount === goals.length && goals.length > 0) {
    points += 20; // all-done bonus
  }
  return points;
}
