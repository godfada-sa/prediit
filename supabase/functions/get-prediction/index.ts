import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4"

const MAX_IMAGE_BYTES = 8 * 1024 * 1024
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])

function corsHeaders(req: Request) {
  const configured = (Deno.env.get("ALLOWED_ORIGINS") ?? "*")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
  const requestOrigin = req.headers.get("origin") ?? ""
  const allowOrigin = configured.includes("*")
    ? "*"
    : configured.includes(requestOrigin)
      ? requestOrigin
      : configured[0] ?? ""

  return {
    "Access-Control-Allow-Origin": allowOrigin,
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

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : ""
}

function normalizeMatches(value: unknown) {
  if (!Array.isArray(value)) return []

  return value.slice(0, 24).flatMap((candidate) => {
    if (!candidate || typeof candidate !== "object") return []
    const row = candidate as Record<string, unknown>
    const home = cleanText(row.home, 80)
    const away = cleanText(row.away, 80)
    if (!home || !away) return []

    const probabilities = row.probabilities && typeof row.probabilities === "object"
      ? row.probabilities as Record<string, unknown>
      : {}
    const homeProbability = Math.max(0, Math.min(100, Number(probabilities.home) || 0))
    const drawProbability = Math.max(0, Math.min(100, Number(probabilities.draw) || 0))
    const awayProbability = Math.max(0, Math.min(100, Number(probabilities.away) || 0))
    const pick = ["1", "X", "2"].includes(String(row.pick)) ? String(row.pick) : "X"

    return [{
      home,
      away,
      homeDomain: cleanText(row.homeDomain, 120) || null,
      awayDomain: cleanText(row.awayDomain, 120) || null,
      probabilities: { home: homeProbability, draw: drawProbability, away: awayProbability },
      pick,
      pickLabel: cleanText(row.pickLabel, 80),
      drawChance: Math.max(0, Math.min(100, Number(row.drawChance) || drawProbability)),
      correctScore: cleanText(row.correctScore, 20),
      goals: cleanText(row.goals, 40),
      confidence: Math.max(0, Math.min(100, Number(row.confidence) || 0)),
      note: cleanText(row.note, 240),
    }]
  })
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) })
  if (req.method !== "POST") return json(req, { error: "Method not allowed" }, 405)

  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) return json(req, { error: "Unauthorized" }, 401)

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    let geminiKey = Deno.env.get("GEMINI_API_KEY") ?? ""
    if (!supabaseUrl || !anonKey) {
      return json(req, { error: "Prediction service is not configured" }, 503)
    }

    // Every user-data call runs in the caller's authenticated context.
    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return json(req, { error: "Unauthorized" }, 401)

    // A hosted environment secret takes precedence. The admin-configured
    // database value is a server-only fallback and is never returned to the
    // browser.
    if (!geminiKey) {
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      if (serviceRoleKey) {
        const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        })
        const { data: secretRow } = await serviceClient
          .from("app_secrets")
          .select("gemini_api_key")
          .eq("id", "global_config")
          .maybeSingle()
        geminiKey = secretRow?.gemini_api_key ?? ""
      }
    }
    if (!geminiKey) return json(req, { error: "Prediction service is not configured" }, 503)

    const payload = await req.json().catch(() => null) as Record<string, unknown> | null
    const fileBase64 = cleanText(payload?.fileBase64, MAX_IMAGE_BYTES * 2)
      .replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, "")
    const mime = cleanText(payload?.mime, 80).toLowerCase()
    if (!fileBase64 || !ALLOWED_MIME_TYPES.has(mime)) {
      return json(req, { error: "Upload a JPEG, PNG, or WebP screenshot" }, 400)
    }

    let decodedLength = 0
    try {
      decodedLength = atob(fileBase64).length
    } catch {
      return json(req, { error: "Invalid image data" }, 400)
    }
    if (decodedLength > MAX_IMAGE_BYTES) {
      return json(req, { error: "Screenshot must be smaller than 8 MB" }, 413)
    }

    const model = Deno.env.get("GEMINI_MODEL") ?? "gemini-3.6-flash"
    const prompt = `Read the virtual-football fixtures in this screenshot and return only a JSON array.
Each item must contain: home, away, homeDomain, awayDomain, probabilities {home, draw, away}, pick (1, X, or 2), pickLabel, drawChance, correctScore, goals, confidence, and note.
Use only team names visible in the uploaded screenshot. Do not invent fixtures. Probabilities must be numbers from 0 to 100. If no fixtures are legible, return []. Predictions are probabilistic estimates, not guaranteed outcomes.`

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(geminiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [
            { text: prompt },
            { inlineData: { mimeType: mime, data: fileBase64 } },
          ] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.35 },
        }),
      },
    )

    if (!geminiResponse.ok) {
      console.error("Gemini request failed", geminiResponse.status)
      return json(req, { error: "Prediction analysis is temporarily unavailable" }, 502)
    }

    const geminiData = await geminiResponse.json()
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]"
    let parsed: unknown
    try {
      parsed = JSON.parse(String(rawText).replace(/```json/gi, "").replace(/```/g, "").trim())
    } catch {
      return json(req, { ok: false, reason: "ocr_failed" }, 422)
    }

    const matches = normalizeMatches(parsed)
    if (matches.length === 0) return json(req, { ok: false, reason: "no_fixtures" }, 422)

    // One database transaction locks the profile, verifies the current price,
    // charges the wallet, writes the ledger, and stores the prediction.
    const { data: chargeResult, error: chargeError } = await supabase.rpc("submit_prediction", {
      p_result: { matches, source: "gemini" },
    })
    if (chargeError) throw chargeError
    if (!chargeResult?.ok) return json(req, chargeResult, 409)

    return json(req, {
      ok: true,
      matches,
      source: "gemini",
      cost: chargeResult.cost,
      balanceAfter: chargeResult.balanceAfter,
    })
  } catch (error) {
    console.error("get-prediction failed", error instanceof Error ? error.message : "unknown")
    return json(req, { error: "Prediction request failed" }, 500)
  }
})
