import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(process.cwd());
const failures = [];
const isVercelBuild = process.env.VERCEL === "1";
const forbiddenClaims = [
  "14,990+", "15,504+", "256,604+", "GHS 245K+", "96.0%",
  "win rate", "total won", "under a minute", "instant activation",
  "round-the-clock picks"
];

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() && ![".git", "node_modules", ".freebuff", ".tool-preview"].includes(entry.name)
      ? walk(path)
      : entry.isFile() ? [path] : [];
  });
}

const files = walk(root);
const htmlFiles = files.filter((file) => extname(file) === ".html");
for (const file of htmlFiles) {
  const source = readFileSync(file, "utf8");
  if (!source.includes('/assets/theme-red.css')) failures.push(`${file}: missing red theme stylesheet`);
  if (source.includes("hydration-suppress.js")) failures.push(`${file}: still loads hydration suppression`);
  if (/\bsuppressHydrationWarning\b/.test(source)) failures.push(`${file}: still globally suppresses hydration warnings`);
  for (const match of source.matchAll(/(?:src|href)="(\/[^"]+)"/g)) {
    const target = match[1].split(/[?#]/)[0];
    if (target.startsWith("/~api/") || target === "/") continue;
    const localPath = join(root, target.replace(/^\//, ""));
    if (!existsSync(localPath) && !existsSync(join(localPath, "index.html"))) {
      failures.push(`${file}: missing local asset ${target}`);
    }
  }
}

const searchable = files
  .filter((file) => [".html", ".js", ".css", ".sql", ".ts"].includes(extname(file)))
  .filter((file) => !file.endsWith(join("scripts", "validate.mjs")))
  .map((file) => [file, readFileSync(file, "utf8")]);
for (const [file, source] of searchable) {
  for (const claim of forbiddenClaims) {
    if (source.toLowerCase().includes(claim.toLowerCase())) failures.push(`${file}: unsupported claim ${claim}`);
  }
}

const predictionClient = readFileSync(join(root, "assets", "predict.functions-DuIWAvRz.js"), "utf8");
if (predictionClient.includes("get_gemini_key") || predictionClient.includes("generativelanguage.googleapis.com")) {
  failures.push("Prediction client still exposes direct AI-key access");
}
if (!predictionClient.includes('functions.invoke("get-prediction"')) {
  failures.push("Prediction client is not routed through the Edge Function");
}

const adminBundle = readFileSync(join(root, "assets", "admin-KUKfOpip.js"), "utf8");
if (/session\?*\.(?:passcode|code)|passcode\s*:\s*[^"'`\s]|verified\s*:\s*true|ts\s*:\s*Date\.now/i.test(adminBundle)) {
  failures.push("Admin bundle stores or trusts the access code in browser state");
}
if (!adminBundle.includes("p_admin_token")) failures.push("Admin RPC calls do not carry a server session token");
if (/admin_insert_prediction|Mock\/Manual|Manual prediction/.test(adminBundle)) {
  failures.push("Admin bundle still contains fabricated manual prediction tooling");
}

const appBundle = readFileSync(join(root, "assets", "index-sG8SpmM9.js"), "utf8");
if (!appBundle.includes("e.createRoot=function") || !appBundle.includes("Tv.createRoot")) {
  failures.push("React client-only mount support is missing from the generated bundle");
}

const migrationPath = join(root, "supabase", "migrations", "20260820010000_security_hardening.sql");
if (existsSync(migrationPath)) {
  const migration = readFileSync(migrationPath, "utf8");
  for (const required of [
    "grant update (full_name, phone, referral_code)",
    "require_admin_session",
    "for update",
    "submit_prediction",
    "drop function if exists public.get_gemini_key"
  ]) {
    if (!migration.toLowerCase().includes(required.toLowerCase())) failures.push(`Security migration missing: ${required}`);
  }
} else if (!isVercelBuild) {
  failures.push(`Security migration missing: ${migrationPath}`);
}

const javascriptFiles = files.filter((file) => extname(file) === ".js" && !file.endsWith("_flock.js"));
for (const file of javascriptFiles) {
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (result.status !== 0) failures.push(`${file}: ${result.stderr.trim() || "JavaScript syntax error"}`);
}

if (failures.length) {
  console.error(`Validation failed (${failures.length}):\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log(`Validated ${htmlFiles.length} routes, ${javascriptFiles.length} JavaScript files, security migrations, and private AI/admin boundaries.`);
