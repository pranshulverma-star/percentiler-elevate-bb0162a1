import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Bookmark {
  id: string;
  question_id: string;
  question_text: string;
  section_id: string;
  chapter_slug: string;
  options: string[] | null;
  correct_answer: string | null;
  question_type: string;
  created_at: string;
}

export function useBookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const { data } = await (supabase.from("question_bookmarks") as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      const items = (data || []) as Bookmark[];
      setBookmarks(items);
      setBookmarkedIds(new Set(items.map((b) => b.question_id)));
    } catch (e) {
      console.error("[Bookmarks] fetch error", e);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchBookmarks(); }, [fetchBookmarks]);

  const toggleBookmark = useCallback(async (question: {
    id: number | string;
    question: string;
    options: string[];
    correctAnswer: number | string;
    type?: string;
    sectionId: string;
    chapterSlug: string;
  }) => {
    if (!user) return;
    const qId = String(question.id);
    const isBookmarked = bookmarkedIds.has(qId);

    if (isBookmarked) {
      setBookmarkedIds((prev) => { const n = new Set(prev); n.delete(qId); return n; });
      setBookmarks((prev) => prev.filter((b) => b.question_id !== qId));
      await (supabase.from("question_bookmarks") as any)
        .delete()
        .eq("user_id", user.id)
        .eq("question_id", qId);
    } else {
      const newBookmark = {
        user_id: user.id,
        question_id: qId,
        question_text: question.question,
        section_id: question.sectionId,
        chapter_slug: question.chapterSlug,
        options: question.options,
        correct_answer: String(question.correctAnswer),
        question_type: question.type || "mcq",
      };
      setBookmarkedIds((prev) => new Set(prev).add(qId));
      await (supabase.from("question_bookmarks") as any).insert(newBookmark);
      fetchBookmarks(); // refresh to get the full record with id
    }
  }, [user, bookmarkedIds, fetchBookmarks]);

  const removeBookmark = useCallback(async (questionId: string) => {
    if (!user) return;
    setBookmarkedIds((prev) => { const n = new Set(prev); n.delete(questionId); return n; });
    setBookmarks((prev) => prev.filter((b) => b.question_id !== questionId));
    await (supabase.from("question_bookmarks") as any)
      .delete()
      .eq("user_id", user.id)
      .eq("question_id", questionId);
  }, [user]);

  return { bookmarks, bookmarkedIds, loading, toggleBookmark, removeBookmark, refetch: fetchBookmarks };
}
