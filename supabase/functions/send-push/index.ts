import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getGoogleAccessToken } from "./google-auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendPushBody {
  user_ids?: string[];
  topic?: string;
  title: string;
  body: string;
  action_url?: string;
}

interface SendResult {
  sent: number;
  failed: number;
  errors: string[];
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const serviceAccountJson = Deno.env.get("FIREBASE_SERVICE_ACCOUNT_JSON");

    if (!serviceAccountJson) {
      return new Response(
        JSON.stringify({ error: "FIREBASE_SERVICE_ACCOUNT_JSON secret is not set" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const payload: SendPushBody = await req.json();
    const { user_ids, topic, title, body, action_url } = payload;

    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: "title and body are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get a short-lived FCM OAuth2 access token
    const accessToken = await getGoogleAccessToken(serviceAccountJson);
    const sa = JSON.parse(serviceAccountJson);
    const fcmUrl = `https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`;

    const result: SendResult = { sent: 0, failed: 0, errors: [] };

    // ── Send to specific users by FCM token ────────────────────────────────
    if (user_ids && user_ids.length > 0) {
      // Fetch all push tokens for these users
      const { data: tokenRows, error: tokenError } = await supabase
        .from("push_tokens")
        .select("user_id, token")
        .in("user_id", user_ids);

      if (tokenError) {
        return new Response(
          JSON.stringify({ error: `Failed to fetch tokens: ${tokenError.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Send one FCM message per token
      for (const row of tokenRows ?? []) {
        try {
          const fcmRes = await fetch(fcmUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              message: {
                token: row.token,
                notification: { title, body },
                webpush: action_url
                  ? { fcm_options: { link: action_url } }
                  : undefined,
                data: action_url ? { action_url } : undefined,
              },
            }),
          });

          if (fcmRes.ok) {
            result.sent++;
          } else {
            const errText = await fcmRes.text();
            result.failed++;
            result.errors.push(`token ${row.token.slice(0, 20)}…: ${errText}`);
          }
        } catch (err) {
          result.failed++;
          result.errors.push(String(err));
        }
      }

      // Insert a notification row for each user (drives the bell icon in Phase 1)
      const notificationRows = user_ids.map((uid) => ({
        user_id: uid,
        title,
        body,
        type: "info" as const,
        action_url: action_url ?? null,
      }));

      await supabase.from("notifications").insert(notificationRows);
    }

    // ── Send to an FCM topic ───────────────────────────────────────────────
    if (topic) {
      try {
        const fcmRes = await fetch(fcmUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            message: {
              topic,
              notification: { title, body },
              webpush: action_url
                ? { fcm_options: { link: action_url } }
                : undefined,
              data: action_url ? { action_url } : undefined,
            },
          }),
        });

        if (fcmRes.ok) {
          result.sent++;
        } else {
          const errText = await fcmRes.text();
          result.failed++;
          result.errors.push(`topic ${topic}: ${errText}`);
        }
      } catch (err) {
        result.failed++;
        result.errors.push(String(err));
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
