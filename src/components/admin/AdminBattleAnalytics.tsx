import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { Swords, Trophy, Users2 } from "lucide-react";
import { motion } from "framer-motion";

interface BattleRoom {
  id: string;
  code: string;
  status: string;
  section_id: string;
  chapter_slug: string;
  max_players: number;
  created_at: string;
}

interface TopBattler {
  user_id: string;
  display_name: string;
  games: number;
  avg_score: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-popover border border-border rounded-lg p-2 shadow-xl text-xs">
      <p className="font-semibold text-foreground capitalize">{label?.replace(/_/g, " ")}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="text-muted-foreground">Count: <span className="text-foreground font-medium">{p.value}</span></p>
      ))}
    </div>
  );
};

export default function AdminBattleAnalytics({
  summary,
  battlesByStatus,
  topBattlers,
}: {
  summary: { total_battles: number; total_battle_players: number; avg_battle_score: number };
  battlesByStatus: Record<string, number>;
  topBattlers: TopBattler[];
}) {
  const statusData = Object.entries(battlesByStatus).map(([status, count]) => ({ status, count }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Summary Cards */}
      <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Battles", value: summary.total_battles, icon: Swords, color: "text-rose-500" },
            { label: "Total Players", value: summary.total_battle_players, icon: Users2, color: "text-blue-500" },
            { label: "Avg Battle Score", value: `${summary.avg_battle_score}%`, icon: Trophy, color: "text-amber-500" },
          ].map((s) => (
            <Card key={s.label} className="border-border/40">
              <CardContent className="p-4 flex items-center gap-3">
                <s.icon className={`h-8 w-8 ${s.color}`} />
                <div>
                  <div className="text-2xl font-bold text-foreground">{s.value}</div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Status Breakdown */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-border/40 h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Battles by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="status" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v: string) => v.replace(/_/g, " ")} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="hsl(346, 77%, 50%)" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Leaderboard */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="border-border/40 h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Battlers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border/40 overflow-auto max-h-[250px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">#</TableHead>
                    <TableHead className="text-xs">Player</TableHead>
                    <TableHead className="text-xs">Games</TableHead>
                    <TableHead className="text-xs">Avg Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topBattlers.map((b, i) => (
                    <TableRow key={b.user_id}>
                      <TableCell className="text-xs font-bold">
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                      </TableCell>
                      <TableCell className="text-xs font-medium">{b.display_name || "Anonymous"}</TableCell>
                      <TableCell className="text-xs">{b.games}</TableCell>
                      <TableCell className="text-xs">
                        <Badge variant={b.avg_score >= 70 ? "default" : "secondary"} className="text-[10px]">{b.avg_score}%</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {topBattlers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground text-xs py-6">No battles yet</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
