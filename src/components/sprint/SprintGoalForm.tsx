import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { SUBJECTS, ACTIVITY_TYPES, type Subject, type ActivityType } from "@/lib/sprint-utils";

interface Props {
  onAdd: (subject: string, activityType: string, description: string) => Promise<void>;
  disabled: boolean;
}

export default function SprintGoalForm({ onAdd, disabled }: Props) {
  const [subject, setSubject] = useState<Subject | "">("");
  const [activityType, setActivityType] = useState<ActivityType | "">("");
  const [description, setDescription] = useState("");
  const [adding, setAdding] = useState(false);

  const canSubmit = subject && activityType && description.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setAdding(true);
    try {
      await onAdd(subject, activityType, description.trim());
      setSubject("");
      setActivityType("");
      setDescription("");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <p className="text-sm font-semibold text-foreground">Add a goal</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select value={subject} onValueChange={(v) => setSubject(v as Subject)}>
          <SelectTrigger>
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            {SUBJECTS.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={activityType} onValueChange={(v) => setActivityType(v as ActivityType)}>
          <SelectTrigger>
            <SelectValue placeholder="What are we doing?" />
          </SelectTrigger>
          <SelectContent>
            {ACTIVITY_TYPES.map((a) => (
              <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Input
        placeholder="Chapter name or target (e.g. 'Permutations — 20 questions')"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={120}
        onKeyDown={(e) => e.key === "Enter" && canSubmit && handleSubmit()}
      />

      <Button
        size="sm"
        onClick={handleSubmit}
        disabled={!canSubmit || adding || disabled}
        className="gap-2"
      >
        <Plus className="h-4 w-4" /> Add Goal
      </Button>
    </div>
  );
}
