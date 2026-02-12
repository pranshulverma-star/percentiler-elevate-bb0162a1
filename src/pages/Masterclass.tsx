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

const featuredLogos = [
  { name: "Deccan Herald", initials: "DH" },
  { name: "Hindustan Times", initials: "HT" },
  { name: "Dailyhunt", initials: "DH" },
  { name: "Zee News", initials: "ZN" },
  { name: "Impact Startup", initials: "IS" },
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

      {/* Authority Strip */}
      <div className="border-b border-border py-3">
        <p className="text-center text-xs md:text-sm text-muted-foreground tracking-wide">
          7x 100%iler Mentor &nbsp;·&nbsp; 10,000+ Students Guided &nbsp;·&nbsp; 95%ile Guarantee Batch
        </p>
      </div>

      {/* As Featured In */}
      <div className="py-8 md:py-10 border-b border-border">
        <p className="text-center text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-6">
          As Featured In
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 px-4">
          {featuredLogos.map((logo) => (
            <div
              key={logo.name}
              className="h-8 flex items-center opacity-60 grayscale"
            >
              <span className="text-sm font-semibold tracking-wide text-muted-foreground select-none">
                {logo.name}
              </span>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-5 opacity-70">
          Recognized by leading national publications.
        </p>
      </div>

      <main className="py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          {/* Split-screen layout */}
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">
            {/* Left — Content */}
            <div className="space-y-8">
              <div className="space-y-5">
                <h1 className="text-3xl md:text-4xl lg:text-[2.65rem] font-bold leading-tight tracking-tight text-foreground">
                  Most CAT Aspirants Don't Fail Because They're Weak.{" "}
                  <span className="text-primary">They Fail Because They Start Wrong.</span>
                </h1>
                <p className="text-base md:text-lg text-muted-foreground">
                  In this free Masterclass, discover the structured roadmap that has helped students cross 95+ percentile.
                </p>
              </div>

              <ul className="space-y-4">
                {bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-foreground text-sm md:text-base">{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right — Registration Card */}
            <div className="md:sticky md:top-24">
              <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-bold text-foreground mb-1 text-center">
                  Reserve Your Seat
                </h2>
                <p className="text-sm text-muted-foreground text-center mb-6">
                  Limited structured mentoring batch
                </p>
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
                      <>Register for Free Masterclass <ArrowRight className="ml-1 h-4 w-4" /></>
                    )}
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Next structured batch closes soon.
                </p>
                <p className="text-xs text-muted-foreground text-center mt-2 opacity-70">
                  2,000+ CAT aspirants registered in last cycle
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Masterclass;
