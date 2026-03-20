import { supabase } from "@/integrations/supabase/client";

// ─── Heat Score Formula ───

export interface HeatScoreData {
  total_active_days: number;
  consistency_score: number;
  mock_attempts: number;
  crash_mode: boolean;
  days_since_join: number;
  heat_score: number;
  lead_category: string;
}

export function calculateHeatScore(params: {
  totalActiveDays: number;
  consistencyScore: number;
  mockAttempts: number;
  crashMode: boolean;
  daysSinceJoin: number;
  daysLeft: number;
}): { heatScore: number; leadCategory: string } {
  let score = 0;

  // +2 per active day
  score += params.totalActiveDays * 2;

  // +5 per mock completed
  score += params.mockAttempts * 5;

  // Consistency bonuses
  if (params.consistencyScore > 0.85) {
    score += 15;
  } else if (params.consistencyScore > 0.70) {
    score += 10;
  }

  // Early joiner bonus (>150 days left)
  if (params.daysLeft > 150) {
    score += 10;
  }

  // Not crash mode bonus
  if (!params.crashMode) {
    score += 10;
  }

  // Cap at 100
  score = Math.min(100, score);

  // Lead category
  let leadCategory: string;
  if (score <= 10) leadCategory = "Cold";
  else if (score <= 15) leadCategory = "Warm";
  else if (score <= 30) leadCategory = "Hot";
  else leadCategory = "Very Hot";

  return { heatScore: score, leadCategory };
}

// ─── Log Activity ───

export async function logActivity(
  phoneNumber: string,
  date: string,
  subject: string
): Promise<void> {
  const { error } = await supabase.from("planner_activity").upsert(
    {
      phone_number: phoneNumber,
      date,
      subject,
      completed: true,
    },
    { onConflict: "phone_number,date,subject" }
  );
  if (error) throw error;
}

// ─── Recalculate & Persist Heat Score ───

export async function recalculateHeatScore(
  phoneNumber: string,
  crashMode: boolean,
  daysLeft: number
): Promise<HeatScoreData> {
  // Get all activity for this user
  const { data: activities } = await supabase
    .from("planner_activity")
    .select("date, subject")
    .eq("phone_number", phoneNumber);

  const distinctDates = new Set((activities || []).map((a) => a.date));
  const totalActiveDays = distinctDates.size;

  // Mock attempts = activity entries with subject MOCK
  const mockAttempts = (activities || []).filter(
    (a) => a.subject === "MOCK"
  ).length;

  // Get join date from planner_stats
  const { data: stats } = await supabase
    .from("planner_stats")
    .select("start_date")
    .eq("phone_number", phoneNumber)
    .maybeSingle();

  const joinDate = stats?.start_date
    ? new Date(stats.start_date)
    : new Date();
  joinDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysSinceJoin = Math.max(
    1,
    Math.ceil((today.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24))
  );

  const consistencyScore = totalActiveDays / daysSinceJoin;

  const { heatScore, leadCategory } = calculateHeatScore({
    totalActiveDays,
    consistencyScore,
    mockAttempts,
    crashMode,
    daysSinceJoin,
    daysLeft,
  });

  const heatData: HeatScoreData = {
    total_active_days: totalActiveDays,
    consistency_score: Math.round(consistencyScore * 1000) / 1000,
    mock_attempts: mockAttempts,
    crash_mode: crashMode,
    days_since_join: daysSinceJoin,
    heat_score: heatScore,
    lead_category: leadCategory,
  };

  await supabase.from("planner_heat_score").upsert(
    {
      phone_number: phoneNumber,
      ...heatData,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "phone_number" }
  );

  return heatData;
}

// ─── Fetch Heat Score ───

export async function fetchHeatScore(
  phoneNumber: string
): Promise<HeatScoreData | null> {
  const { data } = await supabase
    .from("planner_heat_score")
    .select("*")
    .eq("phone_number", phoneNumber)
    .maybeSingle();

  return data;
}

// ─── Check Inactivity ───

export async function getInactiveDays(
  phoneNumber: string
): Promise<number> {
  const { data } = await supabase
    .from("planner_activity")
    .select("date")
    .eq("phone_number", phoneNumber)
    .order("date", { ascending: false })
    .limit(1);

  if (!data || data.length === 0) return 999; // never active

  const lastActive = new Date(data[0].date);
  lastActive.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.floor(
    (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
  );
}

// ─── Check if day+subject already completed ───

export async function isDayCompleted(
  phoneNumber: string,
  date: string,
  subject: string
): Promise<boolean> {
  const { data } = await supabase
    .from("planner_activity")
    .select("id")
    .eq("phone_number", phoneNumber)
    .eq("date", date)
    .eq("subject", subject)
    .maybeSingle();

  return !!data;
}
