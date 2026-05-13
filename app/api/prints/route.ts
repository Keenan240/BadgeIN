import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const PRINT_KEY = "badgein:print_clicks";

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

/** Counts each time a user triggers Print in the app (best-effort if Redis is down). */
export async function POST() {
  const redis = getRedis();
  if (redis) {
    try {
      await redis.incr(PRINT_KEY);
    } catch {
      // still allow printing UX if Redis fails
    }
  }
  return new NextResponse(null, { status: 204 });
}

/** Read total print clicks. Requires STATS_SECRET as Bearer token. */
export async function GET(request: Request) {
  const secret = process.env.STATS_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "STATS_SECRET is not set on the server" },
      { status: 503 }
    );
  }
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json(
      { error: "Redis is not configured (UPSTASH_REDIS_REST_URL / TOKEN)" },
      { status: 503 }
    );
  }
  try {
    const raw = await redis.get(PRINT_KEY);
    const n = typeof raw === "number" ? raw : Number(raw ?? 0);
    return NextResponse.json({ count: Number.isFinite(n) ? n : 0 });
  } catch {
    return NextResponse.json({ error: "Failed to read counter" }, { status: 502 });
  }
}
