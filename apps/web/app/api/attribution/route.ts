import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import {
  processAllIntervals,
  recalculateSourcePerformance,
} from "@/lib/services/return-attribution";

// POST /api/attribution - Run return attribution and recalculate performance
export async function POST(request: NextRequest) {
  // Verify cron secret or manual trigger
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const isVercelCron = request.headers.get("x-vercel-cron") === "true";

  const body = await request.json().catch(() => ({}));

  if (!isVercelCron && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    if (!body.manual) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const supabase = createServiceClient();

  try {
    // Process return attribution for all intervals
    const attributionResults = await processAllIntervals(supabase);

    // Recalculate source performance
    await recalculateSourcePerformance(supabase);

    return NextResponse.json({
      success: true,
      attribution: attributionResults,
    });
  } catch (error) {
    console.error("Attribution error:", error);
    return NextResponse.json(
      {
        error: "Attribution failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET /api/attribution - Triggered by Vercel cron
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const isVercelCron = request.headers.get("x-vercel-cron") === "true";

  if (!isVercelCron && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  try {
    const attributionResults = await processAllIntervals(supabase);
    await recalculateSourcePerformance(supabase);

    return NextResponse.json({
      success: true,
      attribution: attributionResults,
    });
  } catch (error) {
    console.error("Attribution cron error:", error);
    return NextResponse.json(
      {
        error: "Attribution failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
