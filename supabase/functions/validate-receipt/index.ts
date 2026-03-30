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

// ─── Store receipt validators ──────────────────────────────────────────────
//
// Each validator receives the raw receipt token and the product ID and must
// return true if the receipt is valid (i.e. the purchase was actually made).
//
// Google Play: uses the Android Publisher API (server-to-server).
//   Requires GOOGLE_PLAY_PACKAGE_NAME, GOOGLE_PLAY_SERVICE_ACCOUNT_JSON env vars.
//
// Apple App Store: uses the App Store Server API (v2 JWT-based).
//   Requires APPLE_BUNDLE_ID, APPLE_ISSUER_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY env vars.
//
// IMPORTANT: Without these env vars set, the respective validator returns
//   false (rejects the purchase) to fail-safe rather than allowing free access.
// ─────────────────────────────────────────────────────────────────────────────

async function validateGooglePlayReceipt(
  receipt: string,
  product_id: string
): Promise<boolean> {
  const packageName = Deno.env.get("GOOGLE_PLAY_PACKAGE_NAME");
  const serviceAccountJson = Deno.env.get("GOOGLE_PLAY_SERVICE_ACCOUNT_JSON");

  if (!packageName || !serviceAccountJson) {
    console.warn(
      "validate-receipt: GOOGLE_PLAY_PACKAGE_NAME or GOOGLE_PLAY_SERVICE_ACCOUNT_JSON not set. " +
      "Rejecting receipt to prevent free subscription activation."
    );
    return false;
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson);

    // Obtain an OAuth 2.0 access token using a JWT signed with the service account key.
    // See: https://developers.google.com/identity/protocols/oauth2/service-account
    const now = Math.floor(Date.now() / 1000);
    const jwtHeader = { alg: "RS256", typ: "JWT" };
    const jwtPayload = {
      iss: serviceAccount.client_email,
      scope: "https://www.googleapis.com/auth/androidpublisher",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    };

    const encode = (obj: unknown) =>
      btoa(JSON.stringify(obj)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

    const signingInput = `${encode(jwtHeader)}.${encode(jwtPayload)}`;

    // Import the RSA private key from the service account JSON.
    const pkcs8 = serviceAccount.private_key
      .replace("-----BEGIN PRIVATE KEY-----", "")
      .replace("-----END PRIVATE KEY-----", "")
      .replace(/\s/g, "");

    const binaryKey = Uint8Array.from(atob(pkcs8), (c) => c.charCodeAt(0));
    const cryptoKey = await crypto.subtle.importKey(
      "pkcs8",
      binaryKey,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      cryptoKey,
      new TextEncoder().encode(signingInput)
    );

    const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    const jwt = `${signingInput}.${signatureB64}`;

    // Exchange JWT for access token.
    const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
    });

    if (!tokenResp.ok) {
      console.error("validate-receipt: Failed to obtain Google OAuth token", await tokenResp.text());
      return false;
    }

    const { access_token } = await tokenResp.json();

    // Validate the subscription purchase token.
    // receipt is the purchaseToken from Google Play Billing.
    const url =
      `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/` +
      `${packageName}/purchases/subscriptions/${product_id}/tokens/${receipt}`;

    const verifyResp = await fetch(url, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!verifyResp.ok) {
      console.error("validate-receipt: Google Play verification failed", await verifyResp.text());
      return false;
    }

    const purchaseData = await verifyResp.json();

    // paymentState 1 = payment received, 2 = free trial, 3 = deferred upgrade/downgrade
    const validPaymentStates = [1, 2, 3];
    return validPaymentStates.includes(purchaseData.paymentState);
  } catch (err) {
    console.error("validate-receipt: Error during Google Play validation", err);
    return false;
  }
}

async function validateAppleReceipt(
  receipt: string,
  _product_id: string
): Promise<boolean> {
  const bundleId = Deno.env.get("APPLE_BUNDLE_ID");
  const issuerId = Deno.env.get("APPLE_ISSUER_ID");
  const keyId = Deno.env.get("APPLE_KEY_ID");
  const privateKey = Deno.env.get("APPLE_PRIVATE_KEY");

  if (!bundleId || !issuerId || !keyId || !privateKey) {
    console.warn(
      "validate-receipt: Apple App Store credentials not set. " +
      "Rejecting receipt to prevent free subscription activation."
    );
    return false;
  }

  try {
    // Build a JWT for the App Store Server API.
    // See: https://developer.apple.com/documentation/appstoreserverapi/generating_tokens_for_api_requests
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: "ES256", kid: keyId, typ: "JWT" };
    const payload = {
      iss: issuerId,
      iat: now,
      exp: now + 3600,
      aud: "appstoreconnect-v1",
      bid: bundleId,
    };

    const encode = (obj: unknown) =>
      btoa(JSON.stringify(obj)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

    const signingInput = `${encode(header)}.${encode(payload)}`;

    // Import the EC P-256 private key (PKCS#8 PEM).
    const pemContent = privateKey
      .replace("-----BEGIN PRIVATE KEY-----", "")
      .replace("-----END PRIVATE KEY-----", "")
      .replace(/\s/g, "");

    const binaryKey = Uint8Array.from(atob(pemContent), (c) => c.charCodeAt(0));
    const cryptoKey = await crypto.subtle.importKey(
      "pkcs8",
      binaryKey,
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign(
      { name: "ECDSA", hash: "SHA-256" },
      cryptoKey,
      new TextEncoder().encode(signingInput)
    );

    const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    const jwt = `${signingInput}.${signatureB64}`;

    // Look up the transaction using the App Store Server API v2.
    // receipt is the original transaction ID from StoreKit.
    const resp = await fetch(
      `https://api.storekit.itunes.apple.com/inApps/v1/subscriptions/${receipt}`,
      {
        headers: { Authorization: `Bearer ${jwt}` },
      }
    );

    if (!resp.ok) {
      console.error("validate-receipt: Apple verification failed", await resp.text());
      return false;
    }

    const data = await resp.json();

    // Check that at least one subscription item is in an active ("subscribed") state.
    const items: Array<{ status: number }> = data.data?.[0]?.lastTransactions ?? [];
    // status 1 = subscribed (active)
    return items.some((item) => item.status === 1);
  } catch (err) {
    console.error("validate-receipt: Error during Apple validation", err);
    return false;
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────

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

    // --- Verify the receipt with the issuing store ---
    let receiptValid = false;

    if (store === "google_play") {
      receiptValid = await validateGooglePlayReceipt(receipt, product_id);
    } else if (store === "apple") {
      receiptValid = await validateAppleReceipt(receipt, product_id);
    } else if (store === "web") {
      // Web payments are handled out-of-band (e.g. Stripe webhook).
      // For safety, reject direct web receipt submissions here.
      return new Response(
        JSON.stringify({ error: "Web purchases must be verified via the payment webhook" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!receiptValid) {
      return new Response(JSON.stringify({ error: "Receipt validation failed" }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
  } catch (error) {
    console.error("validate-receipt unhandled error:", error);
    // Return a generic message — never expose internal error details to clients.
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
