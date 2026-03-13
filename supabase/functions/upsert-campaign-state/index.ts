import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.slice(-10);
}

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
    const { phone_number, workflow_status, lead_source, sequence_entry_msg, name } = await req.json();

    if (!phone_number) {
      return new Response(JSON.stringify({ error: "phone_number required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalized = normalizePhone(phone_number);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } = await supabase
      .from("campaign_state")
      .upsert(
        {
          phone_number: normalized,
          workflow_status: workflow_status || "ppc_nurture",
          lead_source: lead_source || null,
          sequence_entry_msg: sequence_entry_msg || 1,
        },
        { onConflict: "phone_number", ignoreDuplicates: true }
      )
      .select()
      .single();

    if (error) {
      // If ignoreDuplicates caused no row returned, fetch existing
      const { data: existing } = await supabase
        .from("campaign_state")
        .select("*")
        .eq("phone_number", normalized)
        .single();
      return new Response(JSON.stringify(existing), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
