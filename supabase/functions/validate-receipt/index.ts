import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Restrict CORS to the configured allowed origin.
// Set ALLOWED_ORIGIN in your Supabase project's Edge Function secrets.
// Falls back to "*" only if the variable is not set (local dev).
const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") ?? "*";

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map store product IDs to plan names.
// Extend or override these via the PRODUCT_ID_MAP env var (JSON object).
const DEFAULT_PRODUCT_MAP: Record<string, string> = {
  "modular": "modular",
  "combo": "combo",
  "full": "full",
};

function resolvePlan(product_id: string): string | null {
  const raw = Deno.env.get("PRODUCT_ID_MAP");
  const map: Record<string, string> = raw ? JSON.parse(raw) : DEFAULT_PRODUCT_MAP;
  for (const [key, plan] of Object.entries(map)) {
    if (product_id.includes(key)) return plan;
  }
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // --- Authenticate the calling user ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Parse and validate the request body ---
    let body: { store?: string; receipt?: string; product_id?: string; transaction_id?: string };
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { store, receipt, product_id, transaction_id } = body;

    if (!store || !receipt || !product_id || !transaction_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: store, receipt, product_id, transaction_id" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const allowedStores = ["google_play", "apple", "web"];
    if (!allowedStores.includes(store)) {
      return new Response(JSON.stringify({ error: "Invalid store value" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Guard against duplicate / replayed transactions ---
    const { data: existing } = await supabaseClient
      .from("subscriptions")
      .select("id")
      .eq("store_transaction_id", transaction_id)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ error: "Transaction already processed" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Validate the receipt against the store APIs ---
    // TODO: Before going to production, replace this block with real receipt
    // validation calls:
    //   • Google Play: https://developers.google.com/android-publisher/api-ref/rest/v3/purchases.subscriptions
    //   • Apple App Store: https://developer.apple.com/documentation/appstoreserverapi
    //
    // Trusting the client receipt without server-side verification allows users
    // to claim paid subscriptions for free.  The duplicate-transaction guard
    // above provides a minimal safety net until real validation is wired up.

    const plan = resolvePlan(product_id);
    if (!plan) {
      return new Response(JSON.stringify({ error: "Unrecognized product_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Activate the subscription ---
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const { error: updateError } = await supabaseClient
      .from("subscriptions")
      .update({
        status: "active",
        plan,
        store,
        store_transaction_id: transaction_id,
        store_product_id: product_id,
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq("user_id", user.id);

    if (updateError) {
      throw updateError;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (_error) {
    // Return a generic message — never expose internal error details to clients.
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
