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

  // Auth guard — accept: service role key, INTERNAL_FUNCTIONS_SECRET, or valid user JWT
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const internalSecret = Deno.env.get("INTERNAL_FUNCTIONS_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const token = authHeader.replace("Bearer ", "");

  const isServiceRole = !!serviceRoleKey && token === serviceRoleKey;
  const isInternalSecret = !!internalSecret && token === internalSecret;

  let isValidUser = false;
  if (!isServiceRole && !isInternalSecret) {
    const adminClient = createClient(supabaseUrl, serviceRoleKey!, {
      auth: { persistSession: false },
    });
    const { data: { user }, error } = await adminClient.auth.getUser(token);
    isValidUser = !!user && !error;
  }

  if (!isServiceRole && !isInternalSecret && !isValidUser) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const webhookUrl = Deno.env.get("GOOGLE_SHEET_WEBHOOK_URL");
    if (!webhookUrl) {
      console.error("GOOGLE_SHEET_WEBHOOK_URL not configured");
      return new Response(JSON.stringify({ error: "Webhook not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { phone_number, email, source } = await req.json();

    if (!phone_number && !email) {
      return new Response(JSON.stringify({ error: "phone_number or email required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey!);

    // Fetch lead data
    let lead = null;
    if (email) {
      const { data } = await supabase.from("leads").select("*").eq("email", email).maybeSingle();
      lead = data;
    }
    if (!lead && phone_number) {
      const { data } = await supabase.from("leads").select("*").eq("phone_number", phone_number).maybeSingle();
      lead = data;
    }

    // Fetch heat score if phone available
    let heatData = null;
    const ph = lead?.phone_number || phone_number;
    if (ph) {
      const { data } = await supabase.from("planner_heat_score").select("*").eq("phone_number", ph).maybeSingle();
      heatData = data;
    }

    const payload = {
      name: lead?.name || null,
      phone_number: lead?.phone_number || phone_number || null,
      email: (lead as any)?.email || email || null,
      source: source || lead?.source || null,
      prep_level: lead?.prep_level || null,
      target_year: lead?.target_year || null,
      target_percentile: lead?.target_percentile || null,
      current_status: lead?.current_status || null,
      heat_score: heatData?.heat_score || 0,
      lead_category: heatData?.lead_category || "Cold",
      consistency_score: heatData?.consistency_score || 0,
      total_active_days: heatData?.total_active_days || 0,
      mock_attempts: heatData?.mock_attempts || 0,
      created_at: lead?.created_at || new Date().toISOString(),
    };

    // Send to Google Sheets
    const sheetRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!sheetRes.ok) {
      const errText = await sheetRes.text();
      console.error(`Google Sheet webhook failed [${sheetRes.status}]: ${errText}`);
      return new Response(JSON.stringify({ error: "Sheet sync failed" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("sync-lead-to-sheet error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
