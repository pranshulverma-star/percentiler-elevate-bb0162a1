import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// DB-backed rate limiter: max 5 requests per key per 60s
// Uses the rate_limits table so limits survive cold starts across all instances
const RATE_LIMIT = 5;
const WINDOW_SECS = 60;

async function isRateLimited(supabase: ReturnType<typeof createClient>, key: string): Promise<boolean> {
  const now = new Date();
  const resetAt = new Date(now.getTime() + WINDOW_SECS * 1000).toISOString();

  // Fetch existing entry
  const { data: existing } = await supabase
    .from("rate_limits")
    .select("count, reset_at")
    .eq("key", key)
    .maybeSingle();

  // No entry or window expired — start a fresh window
  if (!existing || new Date(existing.reset_at) <= now) {
    await supabase
      .from("rate_limits")
      .upsert({ key, count: 1, reset_at: resetAt }, { onConflict: "key" });
    return false;
  }

  // Within window: check limit
  if (existing.count >= RATE_LIMIT) return true;

  await supabase
    .from("rate_limits")
    .update({ count: existing.count + 1 })
    .eq("key", key);
  return false;
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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const rateLimitKey = phone_number || email;
    if (await isRateLimited(supabase, rateLimitKey)) {
      return new Response(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    // Fire-and-forget: sync to Google Sheet
    const sheetWebhookUrl = Deno.env.get("GOOGLE_SHEET_WEBHOOK_URL");
    if (sheetWebhookUrl) {
      const syncPayload: Record<string, unknown> = { source: source || "strategy_call", current_status: "very_hot" };
      if (phone_number) syncPayload.phone_number = phone_number;
      if (email) syncPayload.email = email;
      if (name) syncPayload.name = name;
      fetch(sheetWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(syncPayload),
      }).catch((e) => console.error("Sheet sync fire-and-forget failed:", e));
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
