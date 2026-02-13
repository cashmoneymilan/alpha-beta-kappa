import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { ingestRedditFeeds } from "@/lib/services/reddit-ingester";

// POST /api/ingest/reddit - Trigger Reddit ingestion
export async function POST(request: NextRequest) {
  // Verify cron secret for automated calls
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Allow if no secret is set (development) or if secret matches
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Also allow manual trigger without auth for testing
    const body = await request.json().catch(() => ({}));
    if (!body.manual) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const supabase = createServiceClient();

  try {
    const body = await request.json().catch(() => ({}));
    const sourceIds = body.source_ids as string[] | undefined;

    const result = await ingestRedditFeeds(supabase, sourceIds);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Reddit ingestion error:", error);
    return NextResponse.json(
      {
        error: "Ingestion failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET /api/ingest/reddit - Triggered by Vercel cron
export async function GET(request: NextRequest) {
  // Verify cron secret for automated calls
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Check for Vercel cron header or secret
  const isVercelCron = request.headers.get("x-vercel-cron") === "true";

  if (!isVercelCron && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  try {
    const result = await ingestRedditFeeds(supabase);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Reddit cron ingestion error:", error);
    return NextResponse.json(
      {
        error: "Ingestion failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
