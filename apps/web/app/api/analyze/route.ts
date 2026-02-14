import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { analyzeSentimentBatch } from "@/lib/services/sentiment-analyzer";
import { calculateScore } from "@/lib/scoring";

const BATCH_SIZE = 200;

export async function GET(request: NextRequest) {
  // Auth: Vercel cron header or CRON_SECRET
  const isVercelCron = request.headers.get("x-vercel-cron") === "true";
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!isVercelCron && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.HUGGINGFACE_API_KEY && !process.env.HF_TOKEN) {
    return NextResponse.json(
      { error: "HUGGINGFACE_API_KEY not configured" },
      { status: 500 }
    );
  }

  const supabase = createServiceClient();

  try {
    // Fetch unanalyzed items (no sentiment_label yet)
    const { data: items, error: fetchError } = (await supabase
      .from("feed_items")
      .select(`
        id,
        text,
        velocity,
        score,
        published_at,
        source:sources(weight),
        tickers:feed_item_tickers(ticker_symbol),
        flags:feed_item_flags(flag)
      `)
      .is("sentiment_label", null)
      .order("published_at", { ascending: false })
      .limit(BATCH_SIZE)) as any;

    if (fetchError) {
      console.error("Analyze fetch error:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!items || items.length === 0) {
      return NextResponse.json({
        analyzed: 0,
        message: "No unanalyzed items found",
      });
    }

    // Extract texts for batch analysis
    const texts = items.map((item: any) => item.text as string);
    const sentimentResults = await analyzeSentimentBatch(texts, { concurrency: 5 });

    let analyzed = 0;
    let errors = 0;

    // Update each item with sentiment and recalculated score
    for (const item of items) {
      const sentiment = sentimentResults.get(item.text);

      if (!sentiment) {
        errors++;
        continue;
      }

      // Recalculate score with sentiment factored in
      const sourceWeight = item.source?.weight || 5;
      const tickerCount = item.tickers?.length || 0;
      const itemFlags = (item.flags || []).map((f: any) => f.flag);

      const newScore = calculateScore({
        sourceWeight,
        velocity: item.velocity || 0,
        publishedAt: new Date(item.published_at),
        tickerCount,
        isMultiSource: itemFlags.includes("multi-source"),
        isBreaking: itemFlags.includes("breaking"),
        sentiment,
      });

      // Update the feed item
      const { error: updateError } = await (supabase.from("feed_items") as any)
        .update({
          sentiment_label: sentiment.label,
          sentiment_score: sentiment.score,
          sentiment_analyzed_at: new Date().toISOString(),
          score: newScore,
        })
        .eq("id", item.id);

      if (updateError) {
        console.error(`Failed to update item ${item.id}:`, updateError);
        errors++;
      } else {
        analyzed++;
      }
    }

    console.log(`Sentiment analysis: ${analyzed} analyzed, ${errors} errors out of ${items.length} items`);

    return NextResponse.json({
      analyzed,
      errors,
      total: items.length,
    });
  } catch (error) {
    console.error("Sentiment analysis error:", error);
    return NextResponse.json(
      { error: "Analysis failed", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
