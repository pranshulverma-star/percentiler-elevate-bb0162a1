import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const bullets = [
  "When to start CAT prep for maximum advantage",
  "Which colleges to target based on YOUR profile",
  "Best ROI MBA colleges (beyond IIM hype)",
  "Live CAT problem solving (see how simple it gets)",
  "How to improve your profile before interviews",
  "How to choose the right CAT coaching",
];

const Masterclass = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError("Please fill in both fields.");
      return;
    }
    if (!/^\d{10}$/.test(phone.trim())) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Check if phone exists
      const { data: existing } = await supabase
        .from("leads")
        .select("phone_number")
        .eq("phone_number", phone.trim())
        .maybeSingle();

      if (!existing) {
        await supabase.from("leads").insert({
          phone_number: phone.trim(),
          name: name.trim(),
          source: "masterclass",
        });
      }

      localStorage.setItem("percentilers_phone", phone.trim());
      navigate("/masterclass/watch");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between h-16 px-4 md:px-6">
          <a href="/" className="text-xl font-bold tracking-tight text-foreground">
            Percentilers
          </a>
        </div>
      </header>

      <main className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-foreground mb-6">
              Most CAT Aspirants Don't Fail Because They're Weak.{" "}
              <span className="text-primary">They Fail Because They Start Wrong.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              In this free Masterclass, discover the structured roadmap that has helped students cross 95+ percentile.
            </p>
          </div>

          <ul className="space-y-4 mb-12 max-w-xl mx-auto">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-foreground">{b}</span>
              </li>
            ))}
          </ul>

          <div className="max-w-md mx-auto">
            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
              <h2 className="text-xl font-bold text-foreground mb-6 text-center">
                Register for Free Masterclass
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Phone Number (10 digits)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    type="tel"
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? "Registering..." : (
                    <>Watch Free Masterclass <ArrowRight className="ml-1 h-4 w-4" /></>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Masterclass;
