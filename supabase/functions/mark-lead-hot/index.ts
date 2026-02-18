import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone_number, source, name } = await req.json();

    if (!phone_number || typeof phone_number !== "string" || !/^[6-9]\d{9}$/.test(phone_number)) {
      return new Response(JSON.stringify({ error: "Invalid phone number" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: existing } = await supabase
      .from("leads")
      .select("id")
      .eq("phone_number", phone_number)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("leads")
        .update({ source: source || "strategy_call", current_status: "very_hot" })
        .eq("phone_number", phone_number);
    } else {
      await supabase
        .from("leads")
        .insert({
          phone_number,
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
