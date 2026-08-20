import { copyFileSync, cpSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = join(root, "public");

// Start from an empty, deterministic deployment directory so stale files can
// never leak into a Vercel build.
rmSync(output, { recursive: true, force: true });

const validation = spawnSync(process.execPath, [join(root, "scripts", "validate.mjs")], {
  cwd: root,
  env: process.env,
  stdio: "inherit",
});
if (validation.status !== 0) process.exit(validation.status ?? 1);

mkdirSync(output, { recursive: true });

for (const file of ["index.html", "404.html", "login.html", "signup.html", "_flock.js", "favicon.png"]) {
  copyFileSync(join(root, file), join(output, file));
}

for (const directory of [
  "assets",
  "account",
  "admin",
  "checkout",
  "dashboard",
  "diamonds",
  "efootball",
  "gold",
  "login",
  "predict",
  "signup",
  "spin",
  "tickets",
  "wallet",
]) {
  cpSync(join(root, directory), join(output, directory), { recursive: true });
}

console.log("Prepared static deployment in public/");
