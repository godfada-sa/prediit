import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.4"

const RETENTION_DAYS = 15
const BATCH_SIZE = 500
const MAX_BATCHES_PER_RUN = 10

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  })
}

async function removeExpiredProofs(
  supabase: SupabaseClient,
  table: "payments" | "orders",
  bucket: "payment-proofs" | "screenshot-proofs",
  cutoff: string,
) {
  let deleted = 0

  for (let batch = 0; batch < MAX_BATCHES_PER_RUN; batch += 1) {
    const { data: rows, error: queryError } = await supabase
      .from(table)
      .select("id,screenshot_path")
      .neq("status", "pending")
      .lt("created_at", cutoff)
      .not("screenshot_path", "is", null)
      .order("created_at", { ascending: true })
      .limit(BATCH_SIZE)

    if (queryError) throw queryError
    if (!rows?.length) break

    const validRows = rows.filter(
      (row): row is { id: string; screenshot_path: string } =>
        typeof row.id === "string" && typeof row.screenshot_path === "string" && row.screenshot_path.length > 0,
    )
    if (!validRows.length) break

    const { error: storageError } = await supabase.storage
      .from(bucket)
      .remove(validRows.map((row) => row.screenshot_path))
    if (storageError) throw storageError

    const deletedAt = new Date().toISOString()
    const { error: updateError } = await supabase
      .from(table)
      .update({ screenshot_path: null, proof_deleted_at: deletedAt })
      .in("id", validRows.map((row) => row.id))
    if (updateError) throw updateError

    deleted += validRows.length
    if (rows.length < BATCH_SIZE) break
  }

  return deleted
}

serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405)

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    const cleanupSecret = req.headers.get("x-cleanup-secret") ?? ""
    if (!supabaseUrl || !serviceRoleKey) return json({ error: "Service unavailable" }, 503)
    if (!cleanupSecret) return json({ error: "Unauthorized" }, 401)

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data: authorized, error: authError } = await supabase.rpc(
      "validate_proof_cleanup_secret",
      { p_secret: cleanupSecret },
    )
    if (authError || !authorized) return json({ error: "Unauthorized" }, 401)

    const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString()
    const paymentsDeleted = await removeExpiredProofs(supabase, "payments", "payment-proofs", cutoff)
    const ordersDeleted = await removeExpiredProofs(supabase, "orders", "screenshot-proofs", cutoff)

    return json({
      ok: true,
      retentionDays: RETENTION_DAYS,
      paymentsDeleted,
      ordersDeleted,
      deleted: paymentsDeleted + ordersDeleted,
    })
  } catch (error) {
    console.error("cleanup-proof-images failed", error instanceof Error ? error.message : "unknown")
    return json({ error: "Proof cleanup failed" }, 500)
  }
})
