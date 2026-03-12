import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";

interface ChapterStat {
  chapter_slug: string;
  section_id: string;
  attempts: number;
  avg_score: number;
}

interface SectionStat {
  section_id: string;
  attempts: number;
  avg_score: number;
}

interface ScoreDist {
  range: string;
  count: number;
}

const SECTION_COLORS: Record<string, string> = {
  qa: "hsl(25, 95%, 53%)",
  lrdi: "hsl(217, 91%, 60%)",
  varc: "hsl(142, 71%, 45%)",
};

const SECTION_LABELS: Record<string, string> = {
  qa: "QA",
  lrdi: "LRDI",
  varc: "VARC",
};

const SCORE_COLORS = ["hsl(0, 72%, 51%)", "hsl(25, 95%, 53%)", "hsl(45, 93%, 47%)", "hsl(142, 71%, 45%)", "hsl(160, 84%, 39%)"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-popover border border-border rounded-lg p-2 shadow-xl text-xs">
      <p className="font-semibold text-foreground">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="text-muted-foreground">{p.name}: <span className="text-foreground font-medium">{p.value}</span></p>
      ))}
    </div>
  );
};

export default function AdminQuizAnalytics({
  byChapter,
  bySection,
  scoreDistribution,
}: {
  byChapter: ChapterStat[];
  bySection: SectionStat[];
  scoreDistribution: ScoreDist[];
}) {
  const topChapters = byChapter.slice(0, 10);
  const hardestChapters = [...byChapter].filter((c) => c.attempts >= 3).sort((a, b) => a.avg_score - b.avg_score).slice(0, 8);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Most Attempted Topics */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-border/40 h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Most Attempted Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topChapters} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="chapter_slug" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} width={100}
                    tickFormatter={(v: string) => v.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()).slice(0, 18)}
                    axisLine={false} tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="attempts" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Score Distribution */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="border-border/40 h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={scoreDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="count" nameKey="range" paddingAngle={3}>
                    {scoreDistribution.map((_, i) => (
                      <Cell key={i} fill={SCORE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {scoreDistribution.map((s, i) => (
                <div key={s.range} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2 h-2 rounded-full" style={{ background: SCORE_COLORS[i] }} />
                  {s.range} ({s.count})
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Section Breakdown */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Section Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bySection.map((s) => (
              <div key={s.section_id} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-foreground">{SECTION_LABELS[s.section_id] || s.section_id}</span>
                  <span className="text-muted-foreground">{s.attempts} attempts · {s.avg_score}% avg</span>
                </div>
                <Progress value={s.avg_score} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Hardest Topics */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Hardest Topics (Lowest Avg Score)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {hardestChapters.map((c) => (
              <div key={c.chapter_slug} className="flex items-center justify-between text-xs py-1.5 border-b border-border/30 last:border-0">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] px-1.5">{SECTION_LABELS[c.section_id] || c.section_id}</Badge>
                  <span className="text-foreground capitalize">{c.chapter_slug.replace(/-/g, " ")}</span>
                </div>
                <span className={`font-semibold ${c.avg_score < 40 ? "text-destructive" : "text-amber-500"}`}>{c.avg_score}%</span>
              </div>
            ))}
            {hardestChapters.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Not enough data</p>}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
