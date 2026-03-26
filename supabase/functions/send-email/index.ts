import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendEmail } from "./smtp.ts";
import { renderTemplate, type TemplateName } from "./templates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendEmailBody {
  to: string | string[];
  template: TemplateName;
  data: Record<string, string>;
  /** Optional — if provided, also inserts a row into the notifications table */
  user_id?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body: SendEmailBody = await req.json();
    const { to, template, data, user_id } = body;

    if (!to || !template || !data) {
      return new Response(
        JSON.stringify({ error: "to, template, and data are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Render the template into subject + HTML
    const { subject, html } = renderTemplate(template, data);

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    const recipients = Array.isArray(to) ? to : [to];

    for (const recipient of recipients) {
      try {
        await sendEmail({ to: recipient, subject, html });
        sent++;
      } catch (err) {
        failed++;
        errors.push(`${recipient}: ${String(err)}`);
        console.error(`[send-email] Failed to send to ${recipient}:`, err);
      }
    }

    // Optionally record this notification in the bell-icon table
    if (user_id && sent > 0) {
      await supabase.from("notifications").insert({
        user_id,
        title: subject,
        body: data.message ?? `You have a new ${template} notification`,
        type: "info",
        action_url: data.dashboard_url ?? data.cta_url ?? null,
      });
    }

    return new Response(JSON.stringify({ sent, failed, errors }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[send-email] Unhandled error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
