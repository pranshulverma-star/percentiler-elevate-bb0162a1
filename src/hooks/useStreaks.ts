import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  weeklyActivity: boolean[];
  todayActivities: string[];
  loading: boolean;
  recordActivity: (type: "quiz" | "test" | "flashcards" | "practice_lab" | "sprint") => Promise<void>;
}

function fmtLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function useStreaks(): StreakData {
  const { user } = useAuth();
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [weeklyActivity, setWeeklyActivity] = useState<boolean[]>(Array(7).fill(false));
  const [todayActivities, setTodayActivities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStreaks = useCallback(async () => {
    if (!user) { setLoading(false); return; }

    const { data } = await (supabase.from("daily_streaks") as any)
      .select("activity_date, activity_type")
      .eq("user_id", user.id)
      .order("activity_date", { ascending: false });

    if (!data || data.length === 0) {
      setCurrentStreak(0);
      setLongestStreak(0);
      setWeeklyActivity(Array(7).fill(false));
      setTodayActivities([]);
      setLoading(false);
      return;
    }

    // Today's activities
    const todayStr = fmtLocal(new Date());
    setTodayActivities(
      data.filter((d: any) => d.activity_date === todayStr).map((d: any) => d.activity_type)
    );

    // Unique days sorted newest first
    const uniqueDays = [...new Set(data.map((d: any) => d.activity_date))] as string[];
    uniqueDays.sort((a, b) => b.localeCompare(a));

    // Current streak
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < uniqueDays.length; i++) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      const expectedStr = fmtLocal(expected);
      if (uniqueDays[i] === expectedStr) {
        streak++;
      } else {
        break;
      }
    }
    setCurrentStreak(streak);

    // Longest streak
    const sortedAsc = [...uniqueDays].sort();
    let best = 1, temp = 1;
    for (let i = 1; i < sortedAsc.length; i++) {
      const prev = new Date(sortedAsc[i - 1]);
      const curr = new Date(sortedAsc[i]);
      const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays === 1) { temp++; } 
      else { best = Math.max(best, temp); temp = 1; }
    }
    best = Math.max(best, temp);
    setLongestStreak(sortedAsc.length > 0 ? best : 0);

    // Weekly activity (Mon-Sun)
    const now = new Date();
    const jsDay = now.getDay();
    const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);
    
    const weekly: boolean[] = [];
    const daySet = new Set(uniqueDays);
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      weekly.push(daySet.has(fmtLocal(d)));
    }
    setWeeklyActivity(weekly);

    setLoading(false);
  }, [user]);

  useEffect(() => { fetchStreaks(); }, [fetchStreaks]);

  const recordActivity = useCallback(async (type: "quiz" | "test" | "flashcards" | "practice_lab" | "sprint") => {
    if (!user) return;
    const todayStr = fmtLocal(new Date());

    // Skip if already recorded today
    if (todayActivities.includes(type)) return;

    await (supabase.from("daily_streaks") as any).upsert(
      { user_id: user.id, activity_date: todayStr, activity_type: type },
      { onConflict: "user_id,activity_date,activity_type" }
    );

    setTodayActivities((prev) => [...prev, type]);
    // Recalculate — simple increment if today wasn't counted before
    if (todayActivities.length === 0) {
      setCurrentStreak((s) => s + 1);
    }
  }, [user, todayActivities]);

  return { currentStreak, longestStreak, weeklyActivity, todayActivities, loading, recordActivity };
}
