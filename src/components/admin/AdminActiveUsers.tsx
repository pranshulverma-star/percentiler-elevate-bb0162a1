import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Crown } from "lucide-react";
import { motion } from "framer-motion";

interface ActiveUser {
  user_id: string;
  name: string;
  email: string;
  quizzes: number;
  battles: number;
  total_actions: number;
  avg_score: number;
}

export default function AdminActiveUsers({ users }: { users: ActiveUser[] }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Crown className="h-4 w-4 text-amber-500" />
            Most Active Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/40 overflow-auto max-h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs w-8">#</TableHead>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Email</TableHead>
                  <TableHead className="text-xs text-center">Quizzes</TableHead>
                  <TableHead className="text-xs text-center">Battles</TableHead>
                  <TableHead className="text-xs text-center">Total</TableHead>
                  <TableHead className="text-xs text-center">Avg Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u, i) => (
                  <TableRow key={u.user_id}>
                    <TableCell className="text-xs font-bold">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                    </TableCell>
                    <TableCell className="text-xs font-medium">{u.name || "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground truncate max-w-[160px]">{u.email || "—"}</TableCell>
                    <TableCell className="text-xs text-center">{u.quizzes}</TableCell>
                    <TableCell className="text-xs text-center">{u.battles}</TableCell>
                    <TableCell className="text-xs text-center">
                      <Badge variant="secondary" className="text-[10px]">{u.total_actions}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-center">
                      <span className={u.avg_score >= 70 ? "text-emerald-500 font-semibold" : u.avg_score >= 40 ? "text-foreground" : "text-destructive"}>
                        {u.avg_score}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground text-xs py-6">No activity yet</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
