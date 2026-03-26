/**
 * Admin Broadcast Edge Function
 *
 * Sends a notification to a filtered set of users across one or more channels
 * (email, push, in_app) in a single API call.
 *
 * Authorization: Must include the service role key as Bearer token.
 *
 * POST body:
 * {
 *   template: string,
 *   data: Record<string, string>,
 *   filters?: {
 *     all_users?: boolean,
 *     user_ids?: string[],
 *     signup_after?: string      // ISO 8601 date string, e.g. "2025-01-01"
 *   },
 *   channels: ('email' | 'push' | 'in_app')[]
 * }
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Channel = "email" | "push" | "in_app";

interface BroadcastFilters {
  all_users?: boolean;
  user_ids?: string[];
  signup_after?: string;
}

interface BroadcastBody {
  template: string;
  data: Record<string, string>;
  filters?: BroadcastFilters;
  channels: Channel[];
}

interface ChannelResult {
  sent: number;
  failed: number;
  errors?: string[];
}

interface BroadcastResult {
  total_users: number;
  email?: ChannelResult;
  push?: ChannelResult;
  in_app?: ChannelResult;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // ── Auth: require service role key ─────────────────────────────────────────
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace("Bearer ", "").trim();
  if (token !== serviceRoleKey) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const body: BroadcastBody = await req.json();
    const { template, data, filters = {}, channels } = body;

    if (!template || !data || !channels?.length) {
      return new Response(
        JSON.stringify({ error: "template, data, and channels are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Fetch target users from the leads table ──────────────────────────────
    let query = supabase
      .from("leads")
      .select("user_id, email, name")
      .not("email", "is", null);

    if (filters.user_ids?.length) {
      query = query.in("user_id", filters.user_ids);
    } else if (filters.signup_after) {
      query = query.gte("created_at", filters.signup_after);
    }
    // filters.all_users = true → no additional filter (fetch everyone)

    const { data: users, error: usersError } = await query;

    if (usersError) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch users: ${usersError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userList = (users ?? []) as { user_id: string; email: string; name: string | null }[];
    const result: BroadcastResult = { total_users: userList.length };

    const fnBase = `${supabaseUrl}/functions/v1`;
    const serviceHeaders = {
      "Authorization": `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    };

    // ── EMAIL channel ────────────────────────────────────────────────────────
    if (channels.includes("email")) {
      let emailSent = 0;
      let emailFailed = 0;
      const emailErrors: string[] = [];

      for (const user of userList) {
        // Merge per-user name into the template data
        const userData = { ...data, name: user.name ?? "there" };

        try {
          const res = await fetch(`${fnBase}/send-email`, {
            method: "POST",
            headers: serviceHeaders,
            body: JSON.stringify({
              to: user.email,
              template,
              data: userData,
              user_id: user.user_id,
            }),
          });

          const json = await res.json();
          emailSent += json.sent ?? 0;
          emailFailed += json.failed ?? 0;
          if (json.errors?.length) emailErrors.push(...json.errors);
        } catch (err) {
          emailFailed++;
          emailErrors.push(`${user.email}: ${String(err)}`);
        }
      }

      result.email = { sent: emailSent, failed: emailFailed, errors: emailErrors };
    }

    // ── PUSH channel ─────────────────────────────────────────────────────────
    if (channels.includes("push")) {
      try {
        const userIds = userList.map((u) => u.user_id);
        const res = await fetch(`${fnBase}/send-push`, {
          method: "POST",
          headers: serviceHeaders,
          body: JSON.stringify({
            user_ids: userIds,
            title: data.subject ?? template,
            body: data.message ?? data.body ?? "",
            action_url: data.cta_url ?? data.dashboard_url ?? undefined,
          }),
        });
        const json = await res.json();
        result.push = {
          sent: json.sent ?? 0,
          failed: json.failed ?? 0,
          errors: json.errors,
        };
      } catch (err) {
        result.push = { sent: 0, failed: userList.length, errors: [String(err)] };
      }
    }

    // ── IN_APP channel — direct insert into notifications table ───────────────
    if (channels.includes("in_app")) {
      const rows = userList.map((u) => ({
        user_id: u.user_id,
        title: data.subject ?? template,
        body: data.message ?? data.body ?? "",
        type: "info" as const,
        action_url: data.cta_url ?? data.dashboard_url ?? null,
      }));

      const { error: insertError } = await supabase
        .from("notifications")
        .insert(rows);

      result.in_app = {
        sent: insertError ? 0 : rows.length,
        failed: insertError ? rows.length : 0,
        errors: insertError ? [insertError.message] : [],
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[broadcast] Unhandled error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
