/**
 * Loads KEY=VALUE pairs from a dotenv-style file into process.env
 * (only if the key is not already set — later files can override by loading last).
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

export function loadEnvFile(filename, { override = false } = {}) {
  const envPath = resolve(process.cwd(), filename);
  if (!existsSync(envPath)) return false;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (override || process.env[key] === undefined) process.env[key] = val;
  }
  return true;
}
