import { Sparkles, RefreshCw, AlertTriangle, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { AIRecommendation } from "@/hooks/useAIRecommendations";

interface Props {
  recommendation: AIRecommendation | null;
  loading: boolean;
  error: string | null;
  totalAttempts: number;
  onRegenerate: () => void;
}

const LEVEL_COLORS: Record<string, { bg: string; text: string }> = {
  Beginner:    { bg: "#F3F4F6", text: "#6B7280" },
  Developing:  { bg: "#EFF6FF", text: "#3B82F6" },
  Competitive: { bg: "#FFFBEB", text: "#D97706" },
  Strong:      { bg: "#FFF7ED", text: "#FF6600" },
  Elite:       { bg: "#F0FDF4", text: "#16A34A" },
};

const SECTION_COLORS: Record<string, string> = {
  QA:   "#3B82F6",
  VARC: "#8B5CF6",
  LRDI: "#16A34A",
};

export function AIRecommendationCard({
  recommendation,
  loading,
  error,
  totalAttempts,
  onRegenerate,
}: Props) {
  const navigate = useNavigate();

  // ── Not enough data ────────────────────────────────────────────────────────
  if (totalAttempts < 5) {
    return (
      <div style={{
        background: "#fff",
        border: "1px solid #F3F4F6",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Sparkles size={18} color="#FF6600" />
          <span style={{ fontWeight: 600, fontSize: 15 }}>AI Revision Coach</span>
        </div>
        <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 12 }}>
          Complete at least 5 questions to unlock personalised AI coaching.
        </p>
        <div style={{ background: "#F9FAFB", borderRadius: 8, padding: "8px 12px" }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 13,
            color: "#6B7280",
            marginBottom: 6,
          }}>
            <span>Progress</span>
            <span>{totalAttempts}/5</span>
          </div>
          <div style={{ background: "#E5E7EB", borderRadius: 999, height: 6 }}>
            <div style={{
              background: "#FF6600",
              borderRadius: 999,
              height: 6,
              width: `${Math.min((totalAttempts / 5) * 100, 100)}%`,
              transition: "width 0.3s ease",
            }} />
          </div>
        </div>
        <button
          onClick={() => navigate("/practice-lab")}
          style={{
            marginTop: 12,
            background: "#FF6600",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 16px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            width: "100%",
          }}
        >
          Start practicing →
        </button>
      </div>
    );
  }

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        background: "#fff",
        border: "1px solid #F3F4F6",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Sparkles size={18} color="#FF6600" />
          <span style={{ fontWeight: 600, fontSize: 15 }}>AI Revision Coach</span>
        </div>
        <p style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 16 }}>
          Analysing your practice patterns...
        </p>
        <style>{`@keyframes ai-pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }`}</style>
        {[100, 80, 90, 60].map((w, i) => (
          <div key={i} style={{
            height: 14,
            background: "#F3F4F6",
            borderRadius: 999,
            marginBottom: 10,
            width: `${w}%`,
            animation: "ai-pulse 1.5s ease-in-out infinite",
          }} />
        ))}
      </div>
    );
  }

  // ── Error / no data ────────────────────────────────────────────────────────
  if (error || !recommendation) {
    return (
      <div style={{
        background: "#fff",
        border: "1px solid #F3F4F6",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Sparkles size={18} color="#9CA3AF" />
          <span style={{ fontWeight: 600, fontSize: 15, color: "#6B7280" }}>AI coach unavailable</span>
        </div>
        <p style={{ fontSize: 13, color: "#9CA3AF", marginTop: 8 }}>Try again later.</p>
      </div>
    );
  }

  const { overallAssessment, criticalWeaknesses, sectionStrategy, weeklyPlan, encouragement, redFlag } = recommendation;
  const levelColor = LEVEL_COLORS[overallAssessment.level] ?? LEVEL_COLORS.Developing;

  // ── Full card ──────────────────────────────────────────────────────────────
  return (
    <div style={{
      background: "#fff",
      borderRadius: 16,
      border: "1px solid #F3F4F6",
      borderTop: "4px solid #FF6600",
      marginBottom: 16,
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 16px 0",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Sparkles size={18} color="#FF6600" />
          <span style={{ fontWeight: 600, fontSize: 15 }}>AI Revision Coach</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            background: levelColor.bg,
            color: levelColor.text,
            fontSize: 11,
            fontWeight: 600,
            padding: "3px 8px",
            borderRadius: 999,
          }}>
            {overallAssessment.level}
          </span>
          <span style={{ fontSize: 10, color: "#9CA3AF" }}>Powered by Gemini</span>
        </div>
      </div>

      {/* Percentile estimate */}
      <div style={{ textAlign: "center", padding: "16px 16px 0" }}>
        <div style={{ fontSize: 32, fontWeight: 700, color: "#141414" }}>
          ~{overallAssessment.estimatedPercentile}
        </div>
        <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
          estimated percentile based on current practice
        </div>
      </div>

      {/* Summary */}
      <div style={{ margin: "16px 16px 0", background: "#F9FAFB", borderRadius: 10, padding: 12 }}>
        <p style={{ fontSize: 14, color: "#4B5563", lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>
          {overallAssessment.summary}
        </p>
      </div>

      {/* Critical weaknesses */}
      {criticalWeaknesses.length > 0 && (
        <div style={{ padding: "16px 16px 0" }}>
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#9CA3AF",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            marginBottom: 10,
          }}>
            Critical weaknesses
          </div>
          {criticalWeaknesses.map((w, i) => {
            const sectionColor = SECTION_COLORS[w.section] ?? "#6B7280";
            return (
              <div key={i} style={{
                borderLeft: `3px solid ${sectionColor}`,
                paddingLeft: 12,
                marginBottom: 16,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{w.subtopic}</span>
                  <span style={{
                    background: `${sectionColor}15`,
                    color: sectionColor,
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 6px",
                    borderRadius: 4,
                  }}>
                    {w.section}
                  </span>
                  <span style={{ fontSize: 12, color: "#EF4444", fontWeight: 600, marginLeft: "auto" }}>
                    {w.errorRate}% error
                  </span>
                </div>
                <div style={{
                  background: "#FFFBEB",
                  borderRadius: 6,
                  padding: "6px 10px",
                  fontSize: 13,
                  color: "#92400E",
                  marginBottom: 6,
                }}>
                  {w.diagnosis}
                </div>
                <div style={{ fontSize: 12, color: "#EF4444", marginBottom: 4 }}>
                  CAT impact: {w.catImpact}
                </div>
                <div style={{ fontSize: 13, color: "#FF6600", marginBottom: 8 }}>
                  → {w.fix}
                </div>
                <button
                  onClick={() => navigate("/practice-lab")}
                  style={{
                    background: "transparent",
                    border: "1px solid #FF6600",
                    color: "#FF6600",
                    borderRadius: 6,
                    padding: "6px 12px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  Practice this <ChevronRight size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Section strategy */}
      <div style={{ padding: "0 16px" }}>
        <div style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#9CA3AF",
          textTransform: "uppercase",
          letterSpacing: 0.5,
          marginBottom: 10,
        }}>
          Section strategy
        </div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {(["QA", "VARC", "LRDI"] as const).map((section) => (
            <div key={section} style={{
              minWidth: 200,
              background: `${SECTION_COLORS[section]}08`,
              border: `1px solid ${SECTION_COLORS[section]}30`,
              borderRadius: 10,
              padding: 12,
              flex: "0 0 auto",
            }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: SECTION_COLORS[section], marginBottom: 6 }}>
                {section}
              </div>
              <div style={{ fontSize: 12, color: "#4B5563", lineHeight: 1.6 }}>
                {sectionStrategy[section]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly goal */}
      <div style={{ margin: "16px 16px 0" }}>
        <div style={{
          borderLeft: "3px solid #FF6600",
          paddingLeft: 14,
          background: "#FFF7ED",
          borderRadius: "0 10px 10px 0",
          padding: "12px 12px 12px 14px",
        }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
            This week: {weeklyPlan.primaryFocus}
          </div>
          <div style={{ fontSize: 13, color: "#4B5563", marginBottom: 4 }}>
            Target: {weeklyPlan.targetQuestions} questions at {weeklyPlan.targetAccuracy}%+ accuracy
          </div>
          <div style={{ fontSize: 12, color: "#9CA3AF" }}>
            {weeklyPlan.rationale}
          </div>
        </div>
      </div>

      {/* Red flag */}
      {redFlag && (
        <div style={{ margin: "12px 16px 0" }}>
          <div style={{
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            borderRadius: 10,
            padding: "10px 12px",
            display: "flex",
            gap: 8,
            alignItems: "flex-start",
          }}>
            <AlertTriangle size={14} color="#EF4444" style={{ marginTop: 2, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: "#991B1B" }}>{redFlag}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px 16px",
        marginTop: 8,
      }}>
        <span style={{ fontSize: 12, color: "#9CA3AF", fontStyle: "italic", flex: 1, paddingRight: 12 }}>
          {encouragement}
        </span>
        <button
          onClick={onRegenerate}
          style={{
            background: "transparent",
            border: "none",
            color: "#9CA3AF",
            fontSize: 12,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "4px 8px",
            flexShrink: 0,
          }}
        >
          <RefreshCw size={12} /> Regenerate
        </button>
      </div>
    </div>
  );
}
