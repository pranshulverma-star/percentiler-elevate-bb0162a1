import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDays, GraduationCap, ClipboardCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const tools = [
  { icon: CalendarDays, name: "Daily Study Planner", benefit: "Get a day-wise structured preparation roadmap tailored to your target CAT year.", href: "/cat-daily-study-planner", isLink: true },
  { icon: GraduationCap, name: "Free Foundation Course", benefit: "Start building your foundation — a free foundation course for CAT preparation.", href: "#", isLink: false },
  { icon: ClipboardCheck, name: "CAT Readiness Assessment", benefit: "Get a structured performance report in 15 minutes — completely free.", href: "/free-cat-readiness-assessment", isLink: true },
];

const FreeToolsSection = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phone)) {
      toast({ title: "Invalid phone number", description: "Please enter a valid 10-digit phone number.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("leads").upsert(
        { phone_number: phone, name, source: "strategy_call" },
        { onConflict: "phone_number" }
      );
      if (error) throw error;
      toast({ title: "Request received!", description: "Our team will reach out to you shortly." });
      setOpen(false);
      setName("");
      setPhone("");
    } catch {
      toast({ title: "Something went wrong", description: "Please try again later.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="tools" className="py-20 bg-secondary">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
          Extra Support for Serious Aspirants
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {tools.map((t) => (
            <Card key={t.name} className="p-6 text-center">
              <t.icon className="h-8 w-8 mx-auto text-primary mb-4" />
              <h3 className="font-bold text-foreground mb-2">{t.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t.benefit}</p>
              {t.isLink ? (
                <Button variant="outline" size="sm" asChild>
                  <a href={t.href}>Use Free Tool</a>
                </Button>
              ) : (
                <Button variant="default" size="sm" onClick={() => setOpen(true)}>
                  Book Now
                </Button>
              )}
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book Free Strategy Call</DialogTitle>
            <DialogDescription>Our mentor will call you to discuss your personalized CAT preparation plan.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <Input placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input placeholder="Phone Number (10 digits)" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} required />
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Submitting…" : "Request Callback"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default FreeToolsSection;
