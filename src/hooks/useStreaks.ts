import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface StreakData {
  currentStreak: number;
  todayActivities: string[];
  loading: boolean;
  recordActivity: (type: "quiz" | "test" | "flashcards" | "practice_lab" | "sprint") => Promise<void>;
}

export function useStreaks(): StreakData {
  const { user } = useAuth();
  const [currentStreak, setCurrentStreak] = useState(0);
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
      setTodayActivities([]);
      setLoading(false);
      return;
    }

    // Today's activities
    const todayStr = new Date().toISOString().slice(0, 10);
    setTodayActivities(
      data.filter((d: any) => d.activity_date === todayStr).map((d: any) => d.activity_type)
    );

    // Calculate consecutive day streak
    const uniqueDays = [...new Set(data.map((d: any) => d.activity_date))] as string[];
    uniqueDays.sort((a, b) => b.localeCompare(a)); // newest first

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < uniqueDays.length; i++) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      const expectedStr = expected.toISOString().slice(0, 10);
      if (uniqueDays[i] === expectedStr) {
        streak++;
      } else {
        break;
      }
    }

    setCurrentStreak(streak);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchStreaks(); }, [fetchStreaks]);

  const recordActivity = useCallback(async (type: "quiz" | "test" | "flashcards" | "practice_lab" | "sprint") => {
    if (!user) return;
    const todayStr = new Date().toISOString().slice(0, 10);

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

  return { currentStreak, todayActivities, loading, recordActivity };
}
