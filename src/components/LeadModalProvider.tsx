import { useState, createContext, useContext } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const currentYear = new Date().getFullYear();
const targetYears = [currentYear, currentYear + 1, currentYear + 2].map(String);

interface LeadModalContextType {
  openModal: (source: string, onSuccess?: () => void) => void;
}

const LeadModalContext = createContext<LeadModalContextType>({ openModal: () => {} });

export const useLeadModal = () => useContext(LeadModalContext);

export const LeadModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState("");
  const [onSuccessCb, setOnSuccessCb] = useState<(() => void) | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [targetYear, setTargetYear] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const openModal = async (src: string, onSuccess?: () => void) => {
    const storedPhone = localStorage.getItem("percentilers_phone") || "";
    let storedName = localStorage.getItem("percentilers_name") || "";

    // If phone exists but name is missing, try fetching from database
    if (/^\d{10}$/.test(storedPhone) && !storedName) {
      const { data } = await supabase
        .from("leads")
        .select("name")
        .eq("phone_number", storedPhone)
        .maybeSingle();
      if (data?.name) {
        storedName = data.name;
        localStorage.setItem("percentilers_name", storedName);
      }
    }

    // If user already registered, skip the modal and proceed directly
    if (/^\d{10}$/.test(storedPhone) && storedName) {
      supabase.from("leads").upsert(
        { phone_number: storedPhone, name: storedName, source: src },
        { onConflict: "phone_number" }
      );
      onSuccess?.();
      return;
    }

    // Phone exists but name not found anywhere — skip modal anyway
    if (/^\d{10}$/.test(storedPhone)) {
      supabase.from("leads").upsert(
        { phone_number: storedPhone, source: src },
        { onConflict: "phone_number" }
      );
      onSuccess?.();
      return;
    }

    setSource(src);
    setOnSuccessCb(() => onSuccess || null);
    setPhone(storedPhone);
    setName(storedName);
    setOpen(true);
  };

  const sanitizeName = (val: string) => val.replace(/[^a-zA-Z\s.'-]/g, "").slice(0, 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      toast({ title: "Invalid name", description: "Please enter at least 2 characters.", variant: "destructive" });
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      toast({ title: "Invalid phone number", description: "Please enter a valid 10-digit phone number.", variant: "destructive" });
      return;
    }
    if (!/^[6-9]/.test(phone)) {
      toast({ title: "Invalid phone number", description: "Indian mobile numbers start with 6-9.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("leads").upsert(
        { phone_number: phone, name: trimmedName, target_year: targetYear || null, source },
        { onConflict: "phone_number" }
      );
      if (error) throw error;
      localStorage.setItem("percentilers_phone", phone);
      localStorage.setItem("percentilers_name", trimmedName);
      toast({ title: "Request received!", description: "Our team will reach out to you shortly." });
      setOpen(false);
      setName("");
      setPhone("");
      setTargetYear("");
      onSuccessCb?.();
    } catch {
      toast({ title: "Something went wrong", description: "Please try again later.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LeadModalContext.Provider value={{ openModal }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Details</DialogTitle>
            <DialogDescription>Share your details so we can personalize your experience.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <Input placeholder="Your Name" value={name} onChange={(e) => setName(sanitizeName(e.target.value))} required minLength={2} maxLength={100} />
            <Input placeholder="Phone Number (10 digits)" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} required pattern="[6-9]\d{9}" title="Enter a valid 10-digit Indian mobile number" />
            <Select value={targetYear} onValueChange={setTargetYear}>
              <SelectTrigger><SelectValue placeholder="Target CAT Year" /></SelectTrigger>
              <SelectContent>
                {targetYears.map((y) => (
                  <SelectItem key={y} value={y}>CAT {y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Submitting…" : "Continue"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </LeadModalContext.Provider>
  );
};
