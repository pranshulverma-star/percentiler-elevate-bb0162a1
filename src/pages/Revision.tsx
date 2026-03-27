import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, BookOpen, BarChart3, Target, Lightbulb,
  CheckCircle2, XCircle, TrendingUp, AlertTriangle, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";
import { useRevisionData } from "@/hooks/useRevisionData";
import {
  getWrongAttempts,
  getChapterWeakness,
  getSectionWeakness,
  getAccuracyByWeek,
  getRevisionPriority,
  getSubtopicWeakness,
  getDifficultyBreakdown,
  getTopFailingConceptTags,
  getSectionWeaknessEnriched,
  slugToName,
  sectionName,
} from "@/utils/revisionAnalytics";
import { useAIRecommendations } from "@/hooks/useAIRecommendations";
import { AIRecommendationCard } from "@/components/revision/AIRecommendationCard";
import SEO from "@/components/SEO";

type Tab = "wrong" | "weak" | "trend" | "priority";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "wrong",    label: "Wrong Qs",   icon: <XCircle className="w-3.5 h-3.5" /> },
  { id: "weak",     label: "Weak Areas", icon: <BarChart3 className="w-3.5 h-3.5" /> },
  { id: "trend",    label: "Trend",      icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { id: "priority", label: "Revise",     icon: <Target className="w-3.5 h-3.5" /> },
];

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
  transition: { duration: 0.25 },
};

export default function Revision() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("wrong");
  const { attempts, loading, error, refetch } = useRevisionData({ limit: 600 });

  const wrongAttempts   = useMemo(() => getWrongAttempts(attempts),        [attempts]);
  const chapterWeakness = useMemo(() => getChapterWeakness(attempts),      [attempts]);
  const sectionWeakness = useMemo(() => getSectionWeakness(attempts),      [attempts]);
  const weeklyTrend     = useMemo(() => getAccuracyByWeek(attempts),       [attempts]);
  const revisionList    = useMemo(() => getRevisionPriority(attempts),     [attempts]);

  const totalAttempted = attempts.length;
  const overallAccuracy = totalAttempted > 0
    ? Math.round((attempts.filter(a => a.is_correct).length / totalAttempted) * 100)
    : 0;

  const analyticsData = useMemo(() => {
    const nonSkipped = attempts.filter(a => !(a as any).was_skipped);
    return {
      subtopicWeakness: getSubtopicWeakness(attempts),
      chapterWeakness: getChapterWeakness(attempts).map(c => ({
        ...c,
        label: slugToName(c.chapter_slug),
        error_rate: 100 - c.accuracy,
      })),
      sectionWeakness: getSectionWeaknessEnriched(attempts),
      difficultyBreakdown: getDifficultyBreakdown(attempts),
      accuracyByWeek: getAccuracyByWeek(attempts).map(w => ({ ...w, weekLabel: w.week })),
      totalAttempts: attempts.length,
      overallAccuracy: nonSkipped.length > 0
        ? Math.round(nonSkipped.filter(a => a.is_correct).length / nonSkipped.length * 100)
        : 0,
      topConceptTags: getTopFailingConceptTags(attempts),
    };
  }, [attempts]);

  const { recommendation, loading: aiLoading, error: aiError, regenerate } = useAIRecommendations(analyticsData);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <AlertTriangle className="w-8 h-8 text-destructive" />
        <p className="text-sm text-muted-foreground text-center">Failed to load revision data</p>
        <Button size="sm" onClick={refetch} className="gap-2">
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Revision & Analytics | Percentilers"
        description="Review wrong questions, identify weak areas, and track your CAT prep accuracy over time."
      />

      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border/50">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>
            <div className="flex-1">
              <h1 className="text-sm font-bold text-foreground">Revision & Analytics</h1>
              <p className="text-[10px] text-muted-foreground">
                {totalAttempted > 0
                  ? `${totalAttempted} questions · ${overallAccuracy}% overall accuracy`
                  : "No quiz data yet — complete a quiz to see insights"}
              </p>
            </div>
            <button
              onClick={refetch}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
              aria-label="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>

          {/* Tab bar */}
          <div className="max-w-lg mx-auto px-4 pb-3">
            <div className="flex gap-1 bg-secondary/50 rounded-xl p-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all ${
                    activeTab === tab.id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">
          <AnimatePresence mode="wait">
            {activeTab === "wrong" && (
              <motion.div key="wrong" {...fadeUp} className="space-y-3">
                <WrongQuestionsTab wrongAttempts={wrongAttempts} navigate={navigate} />
              </motion.div>
            )}
            {activeTab === "weak" && (
              <motion.div key="weak" {...fadeUp} className="space-y-3">
                <WeakAreasTab chapterWeakness={chapterWeakness} sectionWeakness={sectionWeakness} />
              </motion.div>
            )}
            {activeTab === "trend" && (
              <motion.div key="trend" {...fadeUp} className="space-y-3">
                <AccuracyTrendTab weeklyTrend={weeklyTrend} overallAccuracy={overallAccuracy} totalAttempted={totalAttempted} />
              </motion.div>
            )}
            {activeTab === "priority" && (
              <motion.div key="priority" {...fadeUp} className="space-y-3">
                <AIRecommendationCard
                  recommendation={recommendation}
                  loading={aiLoading}
                  error={aiError}
                  totalAttempts={analyticsData.totalAttempts}
                  onRegenerate={regenerate}
                />
                <RevisionPriorityTab revisionList={revisionList} navigate={navigate} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

// Tab: Wrong Questions

function WrongQuestionsTab({
  wrongAttempts,
  navigate,
}: {
  wrongAttempts: ReturnType<typeof getWrongAttempts>;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (wrongAttempts.length === 0) {
    return (
      <EmptyState
        icon={<CheckCircle2 className="w-10 h-10 text-emerald-500" />}
        title="No wrong questions yet"
        subtitle="Complete a quiz in Practice Lab to start building your revision list."
        action={{ label: "Go to Practice Lab", onClick: () => navigate("/practice-lab") }}
      />
    );
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">
          Wrong Questions
          <Badge variant="secondary" className="ml-2 text-[10px]">{wrongAttempts.length}</Badge>
        </h2>
        <span className="text-[10px] text-muted-foreground">Latest attempt only</span>
      </div>

      {wrongAttempts.map((a) => (
        <Card
          key={a.id}
          className="p-3 border cursor-pointer hover:border-primary/30 transition-colors"
          onClick={() => setExpanded(expanded === a.id ? null : a.id)}
        >
          <div className="flex items-start gap-2">
            <XCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground line-clamp-2">{(a as any).question_text || `Q${a.question_id} · ${slugToName(a.chapter_slug)}`}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-medium">
                  {sectionName(a.section_id)}
                </Badge>
                <span className="text-[10px] text-muted-foreground">{slugToName(a.chapter_slug)}</span>
                {a.difficulty && (
                  <Badge
                    variant="secondary"
                    className={`text-[9px] px-1.5 py-0 border-0 ${
                      a.difficulty === "hard" ? "bg-destructive/10 text-destructive" :
                      a.difficulty === "medium" ? "bg-amber-500/10 text-amber-600" :
                      "bg-emerald-500/10 text-emerald-600"
                    }`}
                  >
                    {a.difficulty}
                  </Badge>
                )}
              </div>

              {expanded === a.id && a.concept_tags && a.concept_tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {a.concept_tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[9px] px-1.5 py-0">{tag}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </>
  );
}

// Tab: Weak Areas

function WeakAreasTab({
  chapterWeakness,
  sectionWeakness,
}: {
  chapterWeakness: ReturnType<typeof getChapterWeakness>;
  sectionWeakness: ReturnType<typeof getSectionWeakness>;
}) {
  if (chapterWeakness.length === 0) {
    return (
      <EmptyState
        icon={<BarChart3 className="w-10 h-10 text-primary" />}
        title="No chapter data yet"
        subtitle="Attempt quizzes across chapters to see your weak areas."
      />
    );
  }

  const barData = sectionWeakness.map((s) => ({
    name: sectionName(s.section_id),
    accuracy: s.accuracy,
  }));

  return (
    <>
      {/* Section overview chart */}
      {barData.length > 0 && (
        <Card className="p-3 border">
          <h3 className="text-xs font-bold text-foreground mb-3">Section Overview</h3>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={barData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={28} unit="%" />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
                formatter={(v: number) => [`${v}%`, "Accuracy"]}
              />
              <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
                {barData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.accuracy >= 70 ? "hsl(var(--primary))" : entry.accuracy >= 50 ? "hsl(38 92% 50%)" : "hsl(var(--destructive))"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Chapter list */}
      <h3 className="text-xs font-bold text-foreground">Chapters (worst first)</h3>
      {chapterWeakness.slice(0, 15).map((c) => (
        <Card key={`${c.section_id}-${c.chapter_slug}`} className="p-3 border">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{slugToName(c.chapter_slug)}</p>
              <p className="text-[10px] text-muted-foreground">{sectionName(c.section_id)} · {c.total} attempts</p>
            </div>
            <div className="text-right shrink-0">
              <span className={`text-sm font-black ${c.accuracy >= 70 ? "text-emerald-500" : c.accuracy >= 50 ? "text-amber-500" : "text-destructive"}`}>
                {c.accuracy}%
              </span>
              <p className="text-[10px] text-muted-foreground">{c.wrong} wrong</p>
            </div>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${c.accuracy}%`,
                background: c.accuracy >= 70 ? "hsl(var(--primary))" : c.accuracy >= 50 ? "hsl(38 92% 50%)" : "hsl(var(--destructive))",
              }}
            />
          </div>
        </Card>
      ))}
    </>
  );
}

// Tab: Accuracy Trend

function AccuracyTrendTab({
  weeklyTrend,
  overallAccuracy,
  totalAttempted,
}: {
  weeklyTrend: ReturnType<typeof getAccuracyByWeek>;
  overallAccuracy: number;
  totalAttempted: number;
}) {
  if (weeklyTrend.length < 2) {
    return (
      <EmptyState
        icon={<TrendingUp className="w-10 h-10 text-primary" />}
        title="Not enough data"
        subtitle="Complete quizzes over at least 2 weeks to see your accuracy trend."
      />
    );
  }

  const latestWeek = weeklyTrend[weeklyTrend.length - 1];
  const prevWeek   = weeklyTrend[weeklyTrend.length - 2];
  const delta      = latestWeek.accuracy - prevWeek.accuracy;

  return (
    <>
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Overall Accuracy", value: `${overallAccuracy}%` },
          { label: "This Week",        value: `${latestWeek.accuracy}%` },
          {
            label: "vs Last Week",
            value: delta >= 0 ? `+${delta}%` : `${delta}%`,
            color: delta >= 0 ? "text-emerald-500" : "text-destructive",
          },
        ].map((s) => (
          <Card key={s.label} className="p-3 text-center border">
            <p className={`text-lg font-black ${s.color ?? "text-foreground"}`}>{s.value}</p>
            <p className="text-[9px] text-muted-foreground leading-tight mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Trend chart */}
      <Card className="p-3 border">
        <h3 className="text-xs font-bold text-foreground mb-3">Weekly Accuracy</h3>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={weeklyTrend}>
            <defs>
              <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="week" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={28} unit="%" />
            <Tooltip
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
              formatter={(v: number) => [`${v}%`, "Accuracy"]}
            />
            <Area
              type="monotone"
              dataKey="accuracy"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#accGrad)"
              dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Weekly breakdown */}
      <h3 className="text-xs font-bold text-foreground">Weekly Breakdown</h3>
      {[...weeklyTrend].reverse().map((w) => (
        <Card key={w.week} className="p-3 border">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs font-semibold text-foreground">Week of {w.week}</p>
              <p className="text-[10px] text-muted-foreground">{w.total} questions</p>
            </div>
            <span className={`text-sm font-black ${w.accuracy >= 70 ? "text-emerald-500" : w.accuracy >= 50 ? "text-amber-500" : "text-destructive"}`}>
              {w.accuracy}%
            </span>
          </div>
        </Card>
      ))}
    </>
  );
}

// Tab: Revision Priority

function RevisionPriorityTab({
  revisionList,
  navigate,
}: {
  revisionList: ReturnType<typeof getRevisionPriority>;
  navigate: ReturnType<typeof useNavigate>;
}) {
  if (revisionList.length === 0) {
    return (
      <EmptyState
        icon={<Lightbulb className="w-10 h-10 text-amber-500" />}
        title="Nothing to prioritise yet"
        subtitle="Complete more quizzes across chapters to get personalised revision recommendations."
        action={{ label: "Practice Now", onClick: () => navigate("/practice-lab") }}
      />
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-amber-500" />
        <h2 className="text-sm font-bold text-foreground">What to Revise First</h2>
      </div>
      <p className="text-[10px] text-muted-foreground -mt-2">Ranked by error rate + recency</p>

      {revisionList.map((item, i) => (
        <Card
          key={`${item.section_id}-${item.chapter_slug}`}
          className="p-3 border hover:border-primary/30 transition-colors cursor-pointer"
          onClick={() => navigate(`/practice-lab?section=${item.section_id}&chapter=${item.chapter_slug}`)}
        >
          <div className="flex items-start gap-3">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-black ${
              i === 0 ? "bg-destructive/15 text-destructive" :
              i === 1 ? "bg-amber-500/15 text-amber-600" :
              "bg-secondary text-muted-foreground"
            }`}>
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground">{slugToName(item.chapter_slug)}</p>
              <p className="text-[10px] text-muted-foreground">{sectionName(item.section_id)} · {item.reason}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`text-[11px] font-bold ${item.accuracy < 50 ? "text-destructive" : item.accuracy < 70 ? "text-amber-500" : "text-emerald-500"}`}>
                  {item.accuracy}% accuracy
                </span>
                <span className="text-[10px] text-muted-foreground">·</span>
                <span className="text-[10px] text-muted-foreground">{item.wrong}/{item.total} wrong</span>
              </div>
            </div>
            <Badge
              variant="secondary"
              className={`text-[9px] px-1.5 py-0 border-0 shrink-0 ${
                item.accuracy < 50 ? "bg-destructive/10 text-destructive" :
                item.accuracy < 70 ? "bg-amber-500/10 text-amber-600" :
                "bg-emerald-500/10 text-emerald-600"
              }`}
            >
              {item.accuracy < 50 ? "Critical" : item.accuracy < 70 ? "Needs Work" : "Good"}
            </Badge>
          </div>
        </Card>
      ))}

      <Button
        variant="outline"
        className="w-full gap-2 text-xs"
        onClick={() => navigate("/practice-lab")}
      >
        <BookOpen className="w-3.5 h-3.5" /> Open Practice Lab
      </Button>
    </>
  );
}

// Shared: Empty state

function EmptyState({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
      {icon}
      <h3 className="text-sm font-bold text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-xs">{subtitle}</p>
      {action && (
        <Button size="sm" onClick={action.onClick} className="mt-2 gap-2">
          <BookOpen className="w-3.5 h-3.5" /> {action.label}
        </Button>
      )}
    </div>
  );
}
