import { NextRequest, NextResponse } from "next/server";
import { postTweet, isTwitterConfigured } from "@/lib/services/twitter-client";

const API_KEY = process.env.SNAPTRADE_PROXY_KEY || process.env.CRON_SECRET || "";

// Rate limit: max 10 tweets per day
const DAILY_LIMIT = 10;
let dailyCount = 0;
let lastResetDay = new Date().toDateString();

function checkRateLimit(): boolean {
  const today = new Date().toDateString();
  if (today !== lastResetDay) {
    dailyCount = 0;
    lastResetDay = today;
  }
  return dailyCount < DAILY_LIMIT;
}

/**
 * POST /api/bot/twitter/post
 * Body: { text: string, replyTo?: string }
 * Auth: X-API-Key header
 */
export async function POST(req: NextRequest) {
  // Auth check
  const key = req.headers.get("x-api-key") || "";
  if (!API_KEY || key !== API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isTwitterConfigured()) {
    return NextResponse.json(
      { error: "Twitter not configured. Set TWITTER_USERNAME, TWITTER_PASSWORD, TWITTER_EMAIL in .env.local" },
      { status: 503 }
    );
  }

  // Rate limit check
  if (!checkRateLimit()) {
    return NextResponse.json(
      { error: `Daily tweet limit reached (${DAILY_LIMIT}/day)`, remaining: 0 },
      { status: 429 }
    );
  }

  let body: { text?: string; replyTo?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { text, replyTo } = body;
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json({ error: "text field is required" }, { status: 400 });
  }

  if (text.length > 280) {
    return NextResponse.json(
      { error: `Tweet too long (${text.length}/280 characters)` },
      { status: 400 }
    );
  }

  try {
    const response = await postTweet(text.trim(), replyTo);

    dailyCount++;

    // Try to extract tweet ID from the response
    let tweetId: string | null = null;
    try {
      const responseData = await response.json();
      tweetId =
        responseData?.data?.create_tweet?.tweet_results?.result?.rest_id ??
        null;
    } catch {
      // Response may not be JSON — that's OK
    }

    const tweetUrl = tweetId
      ? `https://twitter.com/${process.env.TWITTER_USERNAME}/status/${tweetId}`
      : null;

    return NextResponse.json({
      success: true,
      tweetId,
      tweetUrl,
      remaining: DAILY_LIMIT - dailyCount,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to post tweet",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
