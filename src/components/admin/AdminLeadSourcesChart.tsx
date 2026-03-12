import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { motion } from "framer-motion";

interface LeadSource {
  source: string;
  count: number;
}

const COLORS = [
  "hsl(217, 91%, 60%)", "hsl(142, 71%, 45%)", "hsl(25, 95%, 53%)",
  "hsl(346, 77%, 50%)", "hsl(262, 83%, 58%)", "hsl(45, 93%, 47%)",
  "hsl(185, 84%, 39%)", "hsl(0, 72%, 51%)",
];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.[0]) return null;
  const d = payload[0];
  return (
    <div className="bg-popover border border-border rounded-lg p-2 shadow-xl text-xs">
      <p className="font-semibold text-foreground">{d.name}</p>
      <p className="text-muted-foreground">Count: <span className="text-foreground font-medium">{d.value}</span></p>
    </div>
  );
};

export default function AdminLeadSourcesChart({ data }: { data: LeadSource[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Lead Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="h-[180px] w-[180px] flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={75} dataKey="count" nameKey="source" paddingAngle={2}>
                    {data.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 flex-1 min-w-0">
              {data.slice(0, 8).map((s, i) => (
                <div key={s.source} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground truncate flex-1">{s.source}</span>
                  <span className="font-semibold text-foreground">{s.count}</span>
                  <span className="text-muted-foreground text-[10px]">({total ? Math.round((s.count / total) * 100) : 0}%)</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
