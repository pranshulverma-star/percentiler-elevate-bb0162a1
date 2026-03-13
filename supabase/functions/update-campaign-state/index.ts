import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

const ALLOWED_FIELDS = new Set([
  "workflow_status",
  "last_messaged_at",
  "offer_sent_friday",
  "offer_sent_saturday",
  "call_booked_at",
  "converted_at",
  "mentorship_active",
  "ppc_sequence_node",
  "graphy_enrolled_free",
  "graphy_enrolled_paid",
  "course_pitch_sent",
  "free_call_sent",
  "webinar_nudge_sent",
  "money_constraint_sent",
  "name",
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const secret = req.headers.get("x-webhook-secret");
  if (!secret || secret !== Deno.env.get("N8N_WEBHOOK_SECRET")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { phone_number, ...fields } = body;

    if (!phone_number) {
      return new Response(JSON.stringify({ error: "phone_number required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const [key, value] of Object.entries(fields)) {
      if (ALLOWED_FIELDS.has(key)) {
        updateData[key] = value;
      }
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const normalized = phone_number.replace(/\D/g, "").slice(-10);

    const { data, error } = await supabase
      .from("campaign_state")
      .update(updateData)
      .eq("phone_number", normalized)
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("update-campaign-state error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
