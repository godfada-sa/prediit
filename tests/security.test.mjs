import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const migration = readFileSync("supabase/migrations/20260820010000_security_hardening.sql", "utf8");
const orderMigration = readFileSync("supabase/migrations/20260820223000_order_submission_responses.sql", "utf8");
const retentionMigration = readFileSync("supabase/migrations/20260820230000_proof_image_retention.sql", "utf8");
const admin = readFileSync("assets/admin-KUKfOpip.js", "utf8");
const adminFunctions = readFileSync("assets/admin.functions-Qwu3nqHw.js", "utf8");
const prediction = readFileSync("assets/predict.functions-DuIWAvRz.js", "utf8");
const cleanupProofs = readFileSync("supabase/functions/cleanup-proof-images/index.ts", "utf8");

test("profile privileges exclude role, status, and balances", () => {
  assert.match(migration, /grant update \(full_name, phone, referral_code\)/i);
  assert.doesNotMatch(migration, /grant update \([^)]*(?:is_admin|diamonds|gold|tickets|status)/i);
});

test("admin access code becomes an opaque expiring session", () => {
  assert.match(migration, /crypt\(/);
  assert.match(migration, /interval '30 minutes'/);
  assert.match(migration, /alter table public\.app_secrets drop column if exists admin_access_code/i);
  assert.match(migration, /drop function if exists public\.get_app_secrets\(text\)/i);
  assert.match(admin, /p_admin_token/);
  assert.doesNotMatch(admin, /session\?*\.(?:passcode|code)|passcode\s*:\s*[^"'`\s]/i);
  assert.doesNotMatch(admin, /verified\s*:\s*true|ts\s*:\s*Date\.now/i);
});

test("AI key and provider request are absent from the browser prediction client", () => {
  assert.doesNotMatch(prediction, /get_gemini_key|generativelanguage\.googleapis\.com/);
  assert.match(prediction, /functions\.invoke\("get-prediction"/);
});

test("prediction charge is serialized in one database transaction", () => {
  assert.match(migration, /submit_prediction[\s\S]*for update[\s\S]*insert into public\.transactions[\s\S]*insert into public\.predictions/i);
});

test("proof uploads are private, owner-scoped, typed, and size-limited", () => {
  assert.match(migration, /storage\.foldername\(name\)[\s\S]*auth\.uid\(\)::text/i);
  assert.match(migration, /storage\.extension\(name\)[\s\S]*8388608/i);
});

test("admin proof buttons request the correct private image URL", () => {
  assert.match(adminFunctions, /body:\s*\{\s*adminToken:\s*session\.token,\s*kind:\s*'payment',\s*recordId:\s*paymentId\s*\}/);
  assert.match(adminFunctions, /body:\s*\{\s*adminToken:\s*session\.token,\s*kind:\s*'order',\s*recordId:\s*orderId\s*\}/);
  assert.match(adminFunctions, /l as s,[\s\S]*n as o/);
  assert.doesNotMatch(adminFunctions, /f as o\s*\n?\s*\}/);
});

test("reviewed proof images expire after 15 days through the Storage API", () => {
  assert.match(retentionMigration, /'15 3 \* \* \*'/);
  assert.match(retentionMigration, /cleanup-proof-images-daily/);
  assert.match(retentionMigration, /proof_deleted_at/);
  assert.match(cleanupProofs, /RETENTION_DAYS = 15/);
  assert.match(cleanupProofs, /\.neq\("status", "pending"\)/);
  assert.match(cleanupProofs, /\.storage[\s\S]*\.remove\(/);
  assert.doesNotMatch(retentionMigration, /delete\s+from\s+storage\.objects/i);
});

test("admin cannot fabricate prediction history", () => {
  assert.doesNotMatch(admin, /admin_insert_prediction|Mock\/Manual|Manual prediction/i);
});

test("expected order rejections are structured and duplicate-safe", () => {
  assert.match(orderMigration, /pg_advisory_xact_lock/i);
  assert.match(orderMigration, /This transaction ID has already been submitted/i);
  assert.match(orderMigration, /return jsonb_build_object\('ok', false/i);
});
