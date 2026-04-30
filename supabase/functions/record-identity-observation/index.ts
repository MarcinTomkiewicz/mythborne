import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const IDENTITY_HASH_PEPPER = Deno.env.get("IDENTITY_HASH_PEPPER");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function requireEnv(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function getClientIp(req: Request): string | null {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || null;

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfConnectingIp = req.headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();

  return null;
}

function toIpPrefix(ip: string): string {
  if (ip.includes(".")) {
    const parts = ip.split(".");
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
  }

  if (ip.includes(":")) {
    return `${ip.split(":").slice(0, 4).join(":")}::/64`;
  }

  return ip;
}

async function sha256(value: string, pepper: string): Promise<string> {
  const payload = new TextEncoder().encode(`${pepper}:${value}`);
  const digest = await crypto.subtle.digest("SHA-256", payload);

  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function asStringOrNull(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return Response.json(
      { ok: false, error: "Method not allowed" },
      { status: 405, headers: corsHeaders },
    );
  }

  try {
    const supabaseUrl = requireEnv("SUPABASE_URL", SUPABASE_URL);
    const anonKey = requireEnv("SUPABASE_ANON_KEY", SUPABASE_ANON_KEY);
    const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY", SUPABASE_SERVICE_ROLE_KEY);
    const pepper = requireEnv("IDENTITY_HASH_PEPPER", IDENTITY_HASH_PEPPER);

    const authorization = req.headers.get("authorization");

    if (!authorization) {
      return Response.json(
        { ok: false, error: "Missing Authorization header" },
        { status: 401, headers: corsHeaders },
      );
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return Response.json(
        { ok: false, error: "Unauthorized" },
        { status: 401, headers: corsHeaders },
      );
    }

    const body = await req.json().catch(() => ({}));

    const serverId = asStringOrNull(body.serverId);
    const heroId = asStringOrNull(body.heroId);
    const sourceKey = asStringOrNull(body.sourceKey) ?? "app_request";
    const sourceEntityType = asStringOrNull(body.sourceEntityType);
    const sourceEntityId = asStringOrNull(body.sourceEntityId);
    const deviceToken = asStringOrNull(body.deviceToken);

    const clientIp = getClientIp(req);
    const userAgent = req.headers.get("user-agent") ?? "";

    const ipHash = clientIp ? await sha256(`ip:${clientIp}`, pepper) : null;
    const ipPrefixHash = clientIp ? await sha256(`ip_prefix:${toIpPrefix(clientIp)}`, pepper) : null;
    const userAgentHash = userAgent ? await sha256(`user_agent:${userAgent}`, pepper) : null;
    const deviceTokenHash = deviceToken ? await sha256(`device_token:${deviceToken}`, pepper) : null;

    if (!ipHash && !ipPrefixHash && !userAgentHash && !deviceTokenHash) {
      return Response.json(
        { ok: false, error: "No identity material available" },
        { status: 400, headers: corsHeaders },
      );
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data, error } = await adminClient.rpc("record_anti_abuse_identity_observation", {
      p_user_id: user.id,
      p_server_id: serverId,
      p_hero_id: heroId,
      p_observation_source_key: sourceKey,
      p_capture_source_key: "supabase_edge_function",
      p_source_entity_type: sourceEntityType,
      p_source_entity_id: sourceEntityId,
      p_ip_hash: ipHash,
      p_ip_prefix_hash: ipPrefixHash,
      p_user_agent_hash: userAgentHash,
      p_device_token_hash: deviceTokenHash,
      p_observed_at: new Date().toISOString(),
      p_retention_until: null,
      p_metadata_json: {
        hasIp: Boolean(clientIp),
        hasUserAgent: Boolean(userAgent),
        hasDeviceToken: Boolean(deviceToken),
        source: "record-identity-observation",
      },
    });

    if (error) {
      console.error("record_anti_abuse_identity_observation failed", error);
      return Response.json(
        { ok: false, error: error.message },
        { status: 500, headers: corsHeaders },
      );
    }

    return Response.json({ ok: true, observationId: data }, { headers: corsHeaders });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: corsHeaders },
    );
  }
});