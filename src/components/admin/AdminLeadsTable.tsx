import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Lead {
  id: string;
  name: string | null;
  email: string | null;
  phone_number: string | null;
  source: string | null;
  created_at: string;
  current_status: string | null;
  prep_level: string | null;
  target_percentile: number | null;
}

export default function AdminLeadsTable({ leads }: { leads: Lead[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return leads;
    const q = search.toLowerCase();
    return leads.filter(
      (l) =>
        l.name?.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.phone_number?.includes(q) ||
        l.source?.toLowerCase().includes(q)
    );
  }, [leads, search]);

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by name, email, phone, source…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />
      <div className="rounded-md border border-border overflow-auto max-h-[600px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Target %ile</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="font-medium">{l.name || "—"}</TableCell>
                <TableCell className="text-xs">{l.email || "—"}</TableCell>
                <TableCell className="text-xs">{l.phone_number || "—"}</TableCell>
                <TableCell>
                  {l.source ? <Badge variant="secondary" className="text-xs">{l.source}</Badge> : "—"}
                </TableCell>
                <TableCell className="text-xs">{l.current_status || "—"}</TableCell>
                <TableCell>{l.target_percentile ?? "—"}</TableCell>
                <TableCell className="text-xs">{format(new Date(l.created_at), "dd MMM yy")}</TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No leads found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">Showing {filtered.length} of {leads.length} leads</p>
    </div>
  );
}
