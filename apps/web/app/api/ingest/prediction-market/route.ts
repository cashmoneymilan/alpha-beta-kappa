import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { ingestPmSignals } from "@/lib/services/pm-signal-ingester";
import { detectMultiSourceConfirmations } from "@/lib/services/multi-source-detector";

// POST /api/ingest/prediction-market — Manual trigger
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    const body = await request.json().catch(() => ({}));
    if (!body.manual) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const supabase = createServiceClient();

  try {
    const body = await request.json().catch(() => ({}));
    const category = body.category as string | undefined;

    const result = await ingestPmSignals(supabase, { category });

    // Run multi-source detection after ingestion
    const multiSourceResult = await detectMultiSourceConfirmations(supabase);

    return NextResponse.json({ ...result, multiSource: multiSourceResult });
  } catch (error) {
    console.error("PM ingestion error:", error);
    return NextResponse.json(
      {
        error: "Ingestion failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET /api/ingest/prediction-market — Triggered by Vercel cron
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const isVercelCron = request.headers.get("x-vercel-cron") === "true";

  if (!isVercelCron && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  try {
    // Check for category filter (used by crypto hourly cron)
    const category = request.nextUrl.searchParams.get("category") || undefined;

    const result = await ingestPmSignals(supabase, { category });

    // Run multi-source detection after ingestion
    const multiSourceResult = await detectMultiSourceConfirmations(supabase);

    return NextResponse.json({ ...result, multiSource: multiSourceResult });
  } catch (error) {
    console.error("PM cron ingestion error:", error);
    return NextResponse.json(
      {
        error: "Ingestion failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
