import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4"

function corsHeaders(req: Request) {
  const allowed = (Deno.env.get("ALLOWED_ORIGINS") ?? "*").split(",").map((v) => v.trim())
  const origin = req.headers.get("origin") ?? ""
  return {
    "Access-Control-Allow-Origin": allowed.includes("*") ? "*" : allowed.includes(origin) ? origin : allowed[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  }
}

function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json; charset=utf-8" },
  })
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) })
  if (req.method !== "POST") return json(req, { error: "Method not allowed" }, 405)

  try {
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
    if (!serviceRoleKey || !supabaseUrl) return json(req, { error: "Service unavailable" }, 503)

    const body = await req.json().catch(() => null) as Record<string, unknown> | null
    const adminToken = typeof body?.adminToken === "string" ? body.adminToken : ""
    const recordId = typeof body?.recordId === "string" ? body.recordId : ""
    const kind = body?.kind === "payment" ? "payment" : body?.kind === "order" ? "order" : ""
    if (!adminToken || !recordId || !kind) return json(req, { error: "Invalid request" }, 400)

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data: valid, error: validationError } = await supabase.rpc("admin_validate_edge_session", {
      p_admin_token: adminToken,
    })
    if (validationError || !valid) return json(req, { error: "Admin session expired" }, 401)

    const table = kind === "payment" ? "payments" : "orders"
    const bucket = kind === "payment" ? "payment-proofs" : "screenshot-proofs"
    const { data: record, error: recordError } = await supabase
      .from(table)
      .select("screenshot_path,proof_deleted_at")
      .eq("id", recordId)
      .maybeSingle()
    if (recordError || !record) return json(req, { url: null }, 404)
    if (!record.screenshot_path) {
      return json(req, { url: null, expired: Boolean(record.proof_deleted_at) })
    }

    const { data: signed, error: signedError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(record.screenshot_path, 300)
    if (signedError) throw signedError
    return json(req, { url: signed.signedUrl })
  } catch (error) {
    console.error("admin-proof-url failed", error instanceof Error ? error.message : "unknown")
    return json(req, { error: "Could not open proof" }, 500)
  }
})
