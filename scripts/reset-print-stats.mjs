/**
 * Resets the live print counter (deletes the Redis key).
 * Usage: npm run stats:reset
 *
 * Uses the same .env files as `npm run stats` (BADGEIN_STATS_URL + STATS_SECRET).
 */
import { loadEnvFile } from "./load-dotenv.mjs";

loadEnvFile(".env.development.local");
loadEnvFile(".env.local", { override: true });

const url = process.env.BADGEIN_STATS_URL;
const secret = process.env.STATS_SECRET;

if (!url || !secret) {
  console.error(
    "Missing BADGEIN_STATS_URL or STATS_SECRET.\n" +
      "Add both to .env.local (see README)."
  );
  process.exit(1);
}

const res = await fetch(url, {
  method: "DELETE",
  headers: { Authorization: `Bearer ${secret}` },
});

const text = await res.text();

if (!res.ok) {
  let body = text;
  try {
    body = JSON.parse(text);
  } catch {
    /* keep raw */
  }
  console.error(`HTTP ${res.status}:`, body);
  process.exit(1);
}

console.log("Print counter reset (key deleted). Next print will start counting from 1 again.");
