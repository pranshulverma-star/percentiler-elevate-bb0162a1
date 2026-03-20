import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { FlashcardCategory } from "@/data/flashcards";

interface ProgressRow {
  card_id: string;
  category: string;
  knew: boolean;
  practiced_at: string;
}

export function useFlashcardProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const { data } = await (supabase.from("flashcard_progress") as any)
      .select("card_id, category, knew, practiced_at")
      .eq("user_id", user.id)
      .order("practiced_at", { ascending: false });
    setProgress(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchProgress(); }, [fetchProgress]);

  const todayStr = new Date().toISOString().slice(0, 10);

  const getTodayCount = useCallback(
    (cat: FlashcardCategory) =>
      progress.filter((p) => p.category === cat && p.practiced_at.slice(0, 10) === todayStr).length,
    [progress, todayStr]
  );

  const getTodayCardIds = useCallback(
    (cat: FlashcardCategory) =>
      progress.filter((p) => p.category === cat && p.practiced_at.slice(0, 10) === todayStr).map((p) => p.card_id),
    [progress, todayStr]
  );

  const getRevisionCards = useCallback(() => {
    // Group by card_id, pick latest entry per card
    const latestByCard = new Map<string, ProgressRow>();
    for (const p of progress) {
      const existing = latestByCard.get(p.card_id);
      if (!existing || p.practiced_at > existing.practiced_at) {
        latestByCard.set(p.card_id, p);
      }
    }
    return Array.from(latestByCard.values()).filter((p) => !p.knew);
  }, [progress]);

  const recordAnswer = useCallback(
    async (cardId: string, category: FlashcardCategory, knew: boolean) => {
      if (!user) return;
      await (supabase.from("flashcard_progress") as any).insert({
        user_id: user.id,
        card_id: cardId,
        category,
        knew,
      });
      // Optimistic update
      setProgress((prev) => [
        { card_id: cardId, category, knew, practiced_at: new Date().toISOString() },
        ...prev,
      ]);
    },
    [user]
  );

  return { progress, loading, getTodayCount, getTodayCardIds, getRevisionCards, recordAnswer, refetch: fetchProgress };
}
