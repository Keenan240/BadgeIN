/**
 * Prints the live print-click total from production (or any URL you set).
 * Usage: npm run stats
 *
 * Loads env from (in order):
 *   1. .env.development.local — from `npm run env:pull` / Vercel CLI (optional)
 *   2. .env.local — overrides; put BADGEIN_STATS_URL + STATS_SECRET here
 */
import { loadEnvFile } from "./load-dotenv.mjs";

loadEnvFile(".env.development.local");
loadEnvFile(".env.local", { override: true });

const url = process.env.BADGEIN_STATS_URL;
const secret = process.env.STATS_SECRET;

if (!url || !secret) {
  console.error(
    "Missing BADGEIN_STATS_URL or STATS_SECRET.\n" +
      "Add both to .env.local (see README).\n" +
      "Tip: run `npm run env:pull` after `vercel link` to sync other vars into .env.development.local."
  );
  process.exit(1);
}

const res = await fetch(url, {
  headers: { Authorization: `Bearer ${secret}` },
});

const text = await res.text();
let body;
try {
  body = JSON.parse(text);
} catch {
  body = text;
}

if (!res.ok) {
  console.error(`HTTP ${res.status}:`, body);
  process.exit(1);
}

console.log(`Print clicks (all time in Redis): ${body.count ?? body}`);
