import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface HeatScore {
  phone_number: string;
  heat_score: number;
  lead_category: string;
  total_active_days: number;
  consistency_score: number;
  mock_attempts: number;
  crash_mode: boolean;
  days_since_join: number;
}

const categoryColor = (c: string) => {
  if (c === "Hot") return "destructive";
  if (c === "Warm") return "default";
  return "secondary";
};

export default function AdminPlannerStats({ heatScores }: { heatScores: HeatScore[] }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{heatScores.length} users with planner activity</p>
      <div className="rounded-md border border-border overflow-auto max-h-[600px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Identifier</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Heat Score</TableHead>
              <TableHead>Active Days</TableHead>
              <TableHead>Consistency</TableHead>
              <TableHead>Mocks</TableHead>
              <TableHead>Crash</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {heatScores.map((h) => (
              <TableRow key={h.phone_number}>
                <TableCell className="text-xs font-mono">{h.phone_number}</TableCell>
                <TableCell>
                  <Badge variant={categoryColor(h.lead_category) as any}>{h.lead_category}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{h.heat_score}</span>
                    <Progress value={h.heat_score} className="w-16 h-2" />
                  </div>
                </TableCell>
                <TableCell>{h.total_active_days}</TableCell>
                <TableCell>{(h.consistency_score * 100).toFixed(0)}%</TableCell>
                <TableCell>{h.mock_attempts}</TableCell>
                <TableCell>{h.crash_mode ? "⚡" : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
