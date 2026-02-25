import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get all unconverted, non-mentorship campaign leads
    const { data: campaignLeads, error: csError } = await supabase
      .from("campaign_state")
      .select("*")
      .is("converted_at", null)
      .eq("mentorship_active", false);

    if (csError) throw csError;
    if (!campaignLeads || campaignLeads.length === 0) {
      return new Response(JSON.stringify([]), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const phoneNumbers = campaignLeads.map((l) => l.phone_number);

    // Fetch all related data in parallel
    const [heatRes, statsRes, webinarRes, leadsRes] = await Promise.all([
      supabase.from("planner_heat_score").select("*").in("phone_number", phoneNumbers),
      supabase.from("planner_stats").select("*").in("phone_number", phoneNumbers),
      supabase.from("webinar_engagement").select("*").in("phone_number", phoneNumbers),
      supabase.from("leads").select("*").in("phone_number", phoneNumbers),
    ]);

    // Index by phone_number
    const index = (arr: any[]) => {
      const m: Record<string, any> = {};
      for (const r of arr || []) m[r.phone_number] = r;
      return m;
    };

    const heatMap = index(heatRes.data || []);
    const statsMap = index(statsRes.data || []);
    const webinarMap = index(webinarRes.data || []);
    const leadsMap = index(leadsRes.data || []);

    const result = campaignLeads.map((cs) => ({
      ...cs,
      heat: heatMap[cs.phone_number] || null,
      stats: statsMap[cs.phone_number] || null,
      webinar: webinarMap[cs.phone_number] || null,
      lead: leadsMap[cs.phone_number] || null,
    }));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("get-leads-for-behaviour-check error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
