import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

interface Campaign {
  phone_number: string;
  workflow_status: string | null;
  lead_source: string | null;
  converted_at: string | null;
  call_booked_at: string | null;
  mentorship_active: boolean | null;
  graphy_enrolled_paid: boolean | null;
  created_at: string | null;
}

export default function AdminCampaignPipeline({
  pipeline,
  campaigns,
}: {
  pipeline: Record<string, number>;
  campaigns: Campaign[];
}) {
  const sorted = Object.entries(pipeline).sort((a, b) => b[1] - a[1]);
  const total = Object.values(pipeline).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Pipeline breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {sorted.map(([status, count]) => (
          <Card key={status} className="border-border/50">
            <CardContent className="p-4 text-center">
              <span className="text-xl font-bold text-foreground">{count}</span>
              <p className="text-xs text-muted-foreground mt-1 capitalize">{status.replace(/_/g, " ")}</p>
              <p className="text-[10px] text-muted-foreground">{total ? ((count / total) * 100).toFixed(1) : 0}%</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent conversions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Conversions & Calls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-auto max-h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Converted</TableHead>
                  <TableHead>Call Booked</TableHead>
                  <TableHead>Mentorship</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns
                  .filter((c) => c.converted_at || c.call_booked_at || c.mentorship_active)
                  .slice(0, 50)
                  .map((c) => (
                    <TableRow key={c.phone_number}>
                      <TableCell className="text-xs font-mono">{c.phone_number}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {(c.workflow_status || "—").replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{c.lead_source || "—"}</TableCell>
                      <TableCell className="text-xs">
                        {c.converted_at ? format(new Date(c.converted_at), "dd MMM yy") : "—"}
                      </TableCell>
                      <TableCell className="text-xs">
                        {c.call_booked_at ? format(new Date(c.call_booked_at), "dd MMM yy") : "—"}
                      </TableCell>
                      <TableCell>{c.mentorship_active ? "✅" : "—"}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
