import { NextRequest, NextResponse } from "next/server";
import {
  fetchUserTweets,
  isTwitterConfigured,
} from "@/lib/services/twitter-client";

const API_KEY =
  process.env.SNAPTRADE_PROXY_KEY || process.env.CRON_SECRET || "";

/**
 * POST /api/bot/twitter/lookup
 * Body: { username: string, limit?: number }
 * Auth: X-API-Key header
 *
 * Fetches recent tweets from any public Twitter/X account.
 */
export async function POST(req: NextRequest) {
  const key = req.headers.get("x-api-key") || "";
  if (!API_KEY || key !== API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isTwitterConfigured()) {
    return NextResponse.json(
      { error: "Twitter not configured" },
      { status: 503 }
    );
  }

  let body: { username?: string; limit?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { username, limit = 10 } = body;
  if (!username || typeof username !== "string") {
    return NextResponse.json(
      { error: "username field is required" },
      { status: 400 }
    );
  }

  const handle = username.replace(/^@/, "").trim();
  if (!handle) {
    return NextResponse.json(
      { error: "Invalid username" },
      { status: 400 }
    );
  }

  const clampedLimit = Math.min(Math.max(1, limit), 50);

  try {
    const tweets = await fetchUserTweets(handle, clampedLimit);

    const results = tweets.map((t) => ({
      id: t.id,
      text: t.text,
      likes: t.likes ?? 0,
      retweets: t.retweets ?? 0,
      replies: t.replies ?? 0,
      views: t.views ?? 0,
      timestamp: t.timeParsed?.toISOString() ?? null,
      url: t.permanentUrl ?? `https://x.com/${handle}/status/${t.id}`,
    }));

    return NextResponse.json({
      username: handle,
      count: results.length,
      tweets: results,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch tweets",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
