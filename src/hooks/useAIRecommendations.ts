import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AIRecommendation {
  overallAssessment: {
    level: "Beginner" | "Developing" | "Competitive" | "Strong" | "Elite";
    estimatedPercentile: string;
    summary: string;
  };
  criticalWeaknesses: {
    subtopic: string;
    chapter: string;
    section: string;
    errorRate: number;
    diagnosis: string;
    catImpact: string;
    fix: string;
  }[];
  sectionStrategy: {
    QA: string;
    VARC: string;
    LRDI: string;
  };
  weeklyPlan: {
    primaryFocus: string;
    targetQuestions: number;
    targetAccuracy: number;
    rationale: string;
  };
  encouragement: string;
  redFlag: string | null;
}

export interface AIAnalyticsInput {
  subtopicWeakness: {
    subtopic: string;
    topic: string;
    error_rate: number;
    total: number;
    wrong: number;
    was_skipped: number;
  }[];
  chapterWeakness: {
    chapter_slug: string;
    label: string;
    section_id: string;
    error_rate: number;
    total: number;
    wrong: number;
  }[];
  sectionWeakness: {
    section_id: string;
    label: string;
    accuracy_rate: number;
    total: number;
    skip_rate: number;
  }[];
  difficultyBreakdown: {
    difficulty: string;
    total: number;
    correct: number;
    accuracy: number;
  }[];
  accuracyByWeek: {
    weekLabel: string;
    accuracy: number;
    total: number;
  }[];
  totalAttempts: number;
  overallAccuracy: number;
  topConceptTags: {
    tag: string;
    error_rate: number;
    total: number;
  }[];
}

export function useAIRecommendations(analyticsData: AIAnalyticsInput) {
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    // Need at least 5 attempts for meaningful recommendations
    if (analyticsData.totalAttempts < 5) return;
    if (hasFetched.current) return;

    // Weekly cache — don't re-call within same week
    const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    const cacheKey = `revision_ai_week_${weekNumber}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        setRecommendation(JSON.parse(cached));
        return;
      } catch {
        sessionStorage.removeItem(cacheKey);
      }
    }

    hasFetched.current = true;
    fetchRecommendation(cacheKey);

    async function fetchRecommendation(key: string) {
      setLoading(true);
      setError(null);
      try {
        // Determine weakest section to focus the advice
        const weakestSection = [...analyticsData.sectionWeakness]
          .sort((a, b) => a.accuracy_rate - b.accuracy_rate)[0];

        const { data, error: fnError } = await supabase.functions.invoke(
          "ai-revision-coach",
          {
            body: {
              section_id: weakestSection?.section_id || undefined,
              chapter_slug: analyticsData.chapterWeakness[0]?.chapter_slug || undefined,
            },
          }
        );

        console.log("ai-revision-coach raw response:", JSON.stringify(data, null, 2));

        if (fnError) throw new Error(fnError.message);
        if (!data?.advice) throw new Error("Empty response from AI");

        // Map Edge Function response to AIRecommendation shape
        const stats = data.stats || {};
        const mapped: AIRecommendation = {
          overallAssessment: {
            level: stats.level || "Developing",
            estimatedPercentile: stats.estimatedPercentile || "—",
            summary: data.advice,
          },
          criticalWeaknesses: (stats.weakChapters || []).slice(0, 3).map((w: any) => ({
            subtopic: w.subtopic || w.chapter || "—",
            chapter: w.chapter || "—",
            section: w.section || "QA",
            errorRate: w.error_rate || 0,
            diagnosis: w.diagnosis || "Review this area",
            catImpact: w.cat_impact || "",
            fix: w.fix || "Practice more questions in this chapter",
          })),
          sectionStrategy: {
            QA: stats.sectionStrategy?.QA || stats.qa_strategy || "Focus on accuracy over speed",
            VARC: stats.sectionStrategy?.VARC || stats.varc_strategy || "Practice RC passages daily",
            LRDI: stats.sectionStrategy?.LRDI || stats.lrdi_strategy || "Focus on set selection",
          },
          weeklyPlan: {
            primaryFocus: stats.weeklyPlan?.primaryFocus ||
                          analyticsData.chapterWeakness[0]?.label || "Your weakest chapter",
            targetQuestions: stats.weeklyPlan?.targetQuestions || 40,
            targetAccuracy: stats.weeklyPlan?.targetAccuracy || 70,
            rationale: stats.weeklyPlan?.rationale || "Consistent practice builds accuracy",
          },
          encouragement: stats.encouragement || "Keep going — every question makes you better.",
          redFlag: stats.redFlag || null,
        };
        sessionStorage.setItem(key, JSON.stringify(mapped));
        setRecommendation(mapped);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Could not load AI recommendations";
        console.error("[useAIRecommendations]", msg);
        setError("Could not load AI recommendations");
      } finally {
        setLoading(false);
      }
    }
  }, [analyticsData.totalAttempts]); // eslint-disable-line react-hooks/exhaustive-deps

  const regenerate = () => {
    const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    sessionStorage.removeItem(`revision_ai_week_${weekNumber}`);
    hasFetched.current = false;
    setRecommendation(null);
    setError(null);
  };

  return { recommendation, loading, error, regenerate };
}
