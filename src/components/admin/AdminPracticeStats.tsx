import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

interface ChapterStat {
  chapter_slug: string;
  attempts: number;
  avg_score: number;
  total_questions: number;
}

export default function AdminPracticeStats({ chapters }: { chapters: ChapterStat[] }) {
  const sorted = [...chapters].sort((a, b) => b.attempts - a.attempts);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{chapters.length} chapters attempted</p>
      <div className="rounded-md border border-border overflow-auto max-h-[600px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Chapter</TableHead>
              <TableHead>Attempts</TableHead>
              <TableHead>Avg Score</TableHead>
              <TableHead>Total Qs</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((c) => (
              <TableRow key={c.chapter_slug}>
                <TableCell className="font-medium capitalize">{c.chapter_slug.replace(/-/g, " ")}</TableCell>
                <TableCell>{c.attempts}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{c.avg_score}%</span>
                    <Progress value={c.avg_score} className="w-16 h-2" />
                  </div>
                </TableCell>
                <TableCell>{c.total_questions}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
