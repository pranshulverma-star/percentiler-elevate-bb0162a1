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
        const weakSubtopics = analyticsData.subtopicWeakness
          .slice(0, 8)
          .map((s) => `"${s.subtopic}" (${s.topic}): ${s.error_rate}% error, ${s.total} attempts`)
          .join("\n");

        const weakChapters = analyticsData.chapterWeakness
          .slice(0, 6)
          .map((c) => `${c.label} [${c.section_id.toUpperCase()}]: ${c.error_rate}% error, ${c.total} attempts`)
          .join("\n");

        const sectionSummary = analyticsData.sectionWeakness
          .map((s) => `${s.label}: ${s.accuracy_rate}% accuracy, ${s.total} attempted, ${s.skip_rate}% skip rate`)
          .join("\n");

        const diffSummary = analyticsData.difficultyBreakdown
          .map((d) => `${d.difficulty}: ${d.accuracy}% accuracy, ${d.total} questions`)
          .join("\n");

        const weeklyTrend = analyticsData.accuracyByWeek
          .slice(-6)
          .map((w) => `${w.weekLabel}: ${w.accuracy}% (${w.total} Qs)`)
          .join(" → ");

        const topTags = analyticsData.topConceptTags
          .slice(0, 6)
          .map((t) => `"${t.tag}": ${t.error_rate}% error, ${t.total} questions`)
          .join("\n");

        const prompt = `You are an expert CAT exam coach. A student is using Percentilers to prepare for CAT.

PERFORMANCE DATA:
Overall: ${analyticsData.totalAttempts} questions attempted, ${analyticsData.overallAccuracy}% accuracy (excluding skipped)

Section performance:
${sectionSummary}

Difficulty breakdown:
${diffSummary}

Weakest subtopics (most granular signal):
${weakSubtopics || "Not enough data yet"}

Weakest chapters:
${weakChapters || "Not enough data yet"}

Top failing concept tags:
${topTags || "Not enough data yet"}

Accuracy trend (recent weeks):
${weeklyTrend || "Not enough weekly data"}

CAT EXAM CONTEXT (use this for all advice):
- CAT sections: VARC (24 Qs, 40 min), LRDI (20 Qs, 40 min), QA (22 Qs, 40 min)
- Wrong MCQ = -1 mark. Skipped = 0. Skip rate matters enormously.
- 99 percentile needs ~95%+ accuracy on attempted questions
- LRDI is set-based — one bad set choice can kill the section score
- VARC RC accuracy below 70% = passage selection strategy is broken
- QA: if Hard accuracy < 40%, focus on Medium mastery first
- High skip rate in QA = selection strategy issue, not concept gap
- High skip rate in LRDI = set difficulty assessment issue
- Improving from 75th to 90th percentile requires fixing 2-3 specific weak areas

Respond ONLY with this exact JSON, no markdown, no explanation outside the JSON:
{
  "overallAssessment": {
    "level": "Beginner|Developing|Competitive|Strong|Elite",
    "estimatedPercentile": "e.g. 75-80",
    "summary": "2-3 sentences honest assessment referencing their actual numbers and patterns"
  },
  "criticalWeaknesses": [
    {
      "subtopic": "exact subtopic from their data",
      "chapter": "chapter name",
      "section": "QA|VARC|LRDI",
      "errorRate": 67,
      "diagnosis": "WHY they are failing — concept gap vs carelessness vs time pressure vs selection issue",
      "catImpact": "how this weakness affects their CAT score specifically",
      "fix": "specific actionable fix with concrete steps"
    }
  ],
  "sectionStrategy": {
    "QA": "specific QA strategy based on their difficulty breakdown and skip rate",
    "VARC": "specific VARC strategy based on their accuracy and skip patterns",
    "LRDI": "specific LRDI set-selection strategy if skip rate is high"
  },
  "weeklyPlan": {
    "primaryFocus": "one chapter or subtopic to drill this week",
    "targetQuestions": 40,
    "targetAccuracy": 75,
    "rationale": "why this specific goal for this specific student"
  },
  "encouragement": "one personalised line referencing a specific positive from their actual data",
  "redFlag": "one critical warning if there is a serious pattern — null if none"
}
Return 2-3 criticalWeaknesses. Be specific, honest, data-driven. Reference actual subtopics and numbers.`;

        const { data, error: fnError } = await supabase.functions.invoke(
          "ai-revision-coach",
          { body: { prompt } }
        );

        if (fnError) throw new Error(fnError.message);
        if (!data?.text) throw new Error("Empty response from AI");

        const cleaned = data.text
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/```\s*$/i, "")
          .trim();

        const parsed: AIRecommendation = JSON.parse(cleaned);
        sessionStorage.setItem(key, JSON.stringify(parsed));
        setRecommendation(parsed);
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
