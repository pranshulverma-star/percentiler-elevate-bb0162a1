import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple in-memory rate limiter: max 5 requests per phone per 60s
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const WINDOW_MS = 60_000;

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone_number, source, name, email } = await req.json();

    // Require at least one identifier
    if (!phone_number && !email) {
      return new Response(JSON.stringify({ error: "Phone number or email required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (phone_number && (typeof phone_number !== "string" || !/^[6-9]\d{9}$/.test(phone_number))) {
      return new Response(JSON.stringify({ error: "Invalid phone number" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rateLimitKey = phone_number || email;
    if (isRateLimited(rateLimitKey)) {
      return new Response(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Try to find existing lead by email first, then phone
    let existing = null;
    if (email) {
      const { data } = await supabase
        .from("leads")
        .select("id")
        .eq("email", email)
        .maybeSingle();
      existing = data;
    }
    if (!existing && phone_number) {
      const { data } = await supabase
        .from("leads")
        .select("id")
        .eq("phone_number", phone_number)
        .maybeSingle();
      existing = data;
    }

    if (existing) {
      const updateData: Record<string, string> = { source: source || "strategy_call", current_status: "very_hot" };
      if (phone_number) updateData.phone_number = phone_number;
      if (email) updateData.email = email;
      await supabase
        .from("leads")
        .update(updateData)
        .eq("id", existing.id);
    } else {
      await supabase
        .from("leads")
        .insert({
          phone_number: phone_number || null,
          email: email || null,
          name: name || null,
          source: source || "strategy_call",
          current_status: "very_hot",
        });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
