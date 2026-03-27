import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface QuestionAttempt {
  id: string;
  question_id: number;
  section_id: string;
  chapter_slug: string;
  is_correct: boolean;
  was_skipped: boolean;
  subtopic: string | null;
  time_taken_seconds: number | null;
  attempt_source: string;
  question_text: string;
  difficulty: string | null;
  concept_tags: string[] | null;
  created_at: string;
}

interface UseRevisionDataOptions {
  chapter_slug?: string;
  limit?: number;
}

export function useRevisionData(opts: UseRevisionDataOptions = {}) {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<QuestionAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("question_attempts")
        .select("id, question_id, section_id, chapter_slug, is_correct, was_skipped, subtopic, time_taken_seconds, attempt_source, question_text, difficulty, concept_tags, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(opts.limit ?? 600);

      if (opts.chapter_slug) {
        query = query.eq("chapter_slug", opts.chapter_slug);
      }

      const { data, error: err } = await query;
      if (err) throw err;
      setAttempts((data as QuestionAttempt[]) || []);
    } catch (e: any) {
      setError(e.message ?? "Failed to load revision data");
    } finally {
      setLoading(false);
    }
  }, [user?.id, opts.chapter_slug, opts.limit]);

  useEffect(() => { refetch(); }, [refetch]);

  return { attempts, loading, error, refetch };
}

/**
 * Helper to bulk-insert question_attempts rows after a quiz session.
 * Call this from ResultsView after saving practice_lab_attempts.
 */
export async function saveQuestionAttempts(
  userId: string,
  sectionId: string,
  chapterSlug: string,
  questions: Array<{
    id: number;
    question: string;
    difficulty?: string;
    concept_tags?: string[];
  }>,
  answers: Record<number, number | string | null>,
  correctAnswers: Record<number, number | string>,
  source: "practice_lab" | "battle" | "daily_sprint" = "practice_lab"
) {
  const rows = questions.map((q) => {
    const userAnswer = answers[q.id];
    const isSkipped = userAnswer === undefined || userAnswer === null || userAnswer === "";
    const isCorrect = isSkipped
      ? false
      : String(userAnswer).trim().toUpperCase() === String(correctAnswers[q.id]).trim().toUpperCase() ||
        userAnswer === correctAnswers[q.id];

    return {
      user_id: userId,
      question_id: q.id,
      section_id: sectionId,
      chapter_slug: chapterSlug,
      is_correct: isCorrect,
      attempt_source: source,
      question_text: q.question.slice(0, 500),
      difficulty: q.difficulty ?? null,
      concept_tags: q.concept_tags ?? null,
    };
  });

  const { error } = await supabase.from("question_attempts").insert(rows);
  if (error) {
    if (import.meta.env.DEV) console.warn("[Revision] saveQuestionAttempts failed:", error);
  }
}
