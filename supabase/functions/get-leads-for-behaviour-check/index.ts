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

    const result = campaignLeads.map((cs) => {
      const heat = heatMap[cs.phone_number] || {};
      const stats = statsMap[cs.phone_number] || {};
      const webinar = webinarMap[cs.phone_number] || {};
      const lead = leadsMap[cs.phone_number] || {};

      return {
        // campaign_state (base)
        phone_number: cs.phone_number,
        workflow_status: cs.workflow_status,
        last_messaged_at: cs.last_messaged_at,
        offer_sent_friday: cs.offer_sent_friday,
        offer_sent_saturday: cs.offer_sent_saturday,
        money_constraint: cs.money_constraint,
        converted_at: cs.converted_at,
        mentorship_active: cs.mentorship_active,
        ppc_sequence_node: cs.ppc_sequence_node,
        sequence_entry_msg: cs.sequence_entry_msg,
        next_offer_friday: cs.next_offer_friday,
        lead_source: cs.lead_source,
        graphy_enrolled_free: cs.graphy_enrolled_free,
        graphy_enrolled_paid: cs.graphy_enrolled_paid,
        call_booked_at: cs.call_booked_at,
        course_pitch_sent: cs.course_pitch_sent,
        free_call_sent: cs.free_call_sent,
        webinar_nudge_sent: cs.webinar_nudge_sent,
        money_constraint_sent: cs.money_constraint_sent,
        campaign_created_at: cs.created_at,
        campaign_updated_at: cs.updated_at,

        // leads
        name: lead.name ?? null,
        email: lead.email ?? null,
        target_year: lead.target_year ?? null,
        target_percentile: lead.target_percentile ?? null,
        current_status: lead.current_status ?? null,
        prep_level: lead.prep_level ?? null,
        source: lead.source ?? null,
        lead_created_at: lead.created_at ?? null,

        // planner_heat_score
        lead_category: heat.lead_category ?? null,
        heat_score: heat.heat_score ?? null,
        total_active_days: heat.total_active_days ?? null,
        consistency_score: heat.consistency_score ?? null,
        mock_attempts: heat.mock_attempts ?? null,
        crash_mode: heat.crash_mode ?? null,
        days_since_join: heat.days_since_join ?? null,
        heat_updated_at: heat.updated_at ?? null,

        // planner_stats
        start_date: stats.start_date ?? null,
        stats_target_year: stats.target_year ?? null,
        current_phase: stats.current_phase ?? null,
        last_generated_index: stats.last_generated_index ?? null,
        stats_crash_mode: stats.crash_mode ?? null,
        stats_updated_at: stats.updated_at ?? null,

        // webinar_engagement
        watch_percentage: webinar.watch_percentage ?? null,
        webinar_completed: webinar.completed ?? null,
        webinar_updated_at: webinar.updated_at ?? null,
      };
    });

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
