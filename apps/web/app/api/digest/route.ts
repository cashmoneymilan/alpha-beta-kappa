import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const MIN_MENTIONS_FOR_DIGEST = 3;

export async function GET(request: NextRequest) {
  // Auth: Vercel cron header or CRON_SECRET
  const isVercelCron = request.headers.get("x-vercel-cron") === "true";
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!isVercelCron && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  if (!deepseekKey) {
    return NextResponse.json(
      { error: "DEEPSEEK_API_KEY not configured" },
      { status: 500 }
    );
  }

  const supabase = createServiceClient();
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  try {
    // Fetch feed items from the last hour with their tickers
    const { data: items, error: fetchError } = (await supabase
      .from("feed_items")
      .select(`
        id,
        text,
        sentiment_label,
        sentiment_score,
        source_type,
        published_at,
        tickers:feed_item_tickers(ticker_symbol)
      `)
      .gte("published_at", oneHourAgo.toISOString())
      .order("score", { ascending: false })
      .limit(100)) as any;

    if (fetchError) {
      console.error("Digest fetch error:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!items || items.length === 0) {
      return NextResponse.json({
        digests: 0,
        message: "No items in the last hour",
      });
    }

    // Group items by ticker
    const tickerGroups: Record<string, {
      texts: string[];
      sentiments: Array<{ label: string; score: number }>;
      sourceTypes: Set<string>;
    }> = {};

    for (const item of items) {
      const tickers = (item.tickers || []).map((t: any) => t.ticker_symbol);
      for (const ticker of tickers) {
        if (!tickerGroups[ticker]) {
          tickerGroups[ticker] = { texts: [], sentiments: [], sourceTypes: new Set() };
        }
        tickerGroups[ticker].texts.push(item.text);
        if (item.sentiment_label && item.sentiment_score) {
          tickerGroups[ticker].sentiments.push({
            label: item.sentiment_label,
            score: item.sentiment_score,
          });
        }
        tickerGroups[ticker].sourceTypes.add(item.source_type);
      }
    }

    // Filter to tickers with enough mentions
    const eligibleTickers = Object.entries(tickerGroups)
      .filter(([, data]) => data.texts.length >= MIN_MENTIONS_FOR_DIGEST);

    if (eligibleTickers.length === 0) {
      return NextResponse.json({
        digests: 0,
        message: `No tickers with ${MIN_MENTIONS_FOR_DIGEST}+ mentions in the last hour`,
      });
    }

    let digestsCreated = 0;
    const errors: string[] = [];

    // Generate digest for each eligible ticker
    for (const [ticker, data] of eligibleTickers) {
      try {
        const sampleTexts = data.texts.slice(0, 8).map((t, i) => `[${i + 1}] ${t.substring(0, 200)}`).join("\n");

        const prompt = `Analyze these ${data.texts.length} recent market posts about ${ticker} and write a concise 1-2 sentence narrative summary capturing the key theme and sentiment:

${sampleTexts}

Respond with ONLY the summary text, no JSON or formatting.`;

        const response = await fetch(DEEPSEEK_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${deepseekKey}`,
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
              {
                role: "system",
                content: "You are a financial market analyst. Write concise, actionable narrative summaries.",
              },
              { role: "user", content: prompt },
            ],
            temperature: 0.3,
            max_tokens: 200,
          }),
        });

        if (!response.ok) {
          errors.push(`DeepSeek API error for ${ticker}: ${response.status}`);
          continue;
        }

        const aiResponse = await response.json();
        const summary = aiResponse.choices?.[0]?.message?.content?.trim();

        if (!summary) {
          errors.push(`Empty AI response for ${ticker}`);
          continue;
        }

        // Calculate average sentiment
        let sentimentAvg: number | null = null;
        if (data.sentiments.length > 0) {
          sentimentAvg = data.sentiments.reduce((sum, s) => {
            const normalized = s.label === "positive" ? s.score : s.label === "negative" ? -s.score : 0;
            return sum + normalized;
          }, 0) / data.sentiments.length;
        }

        // Insert digest
        const { error: insertError } = await (supabase.from("ticker_digests") as any)
          .insert({
            ticker_symbol: ticker,
            summary,
            sentiment_avg: sentimentAvg,
            source_count: data.sourceTypes.size,
            mention_count: data.texts.length,
            window_start: oneHourAgo.toISOString(),
            window_end: now.toISOString(),
          });

        if (insertError) {
          errors.push(`Insert error for ${ticker}: ${insertError.message}`);
        } else {
          digestsCreated++;
        }
      } catch (err) {
        errors.push(`Error processing ${ticker}: ${err instanceof Error ? err.message : "Unknown"}`);
      }
    }

    console.log(`Digest: ${digestsCreated} digests created for ${eligibleTickers.length} tickers, ${errors.length} errors`);

    return NextResponse.json({
      digests: digestsCreated,
      tickersProcessed: eligibleTickers.length,
      errors: errors.length > 0 ? errors : undefined,
      window: {
        start: oneHourAgo.toISOString(),
        end: now.toISOString(),
      },
    });
  } catch (error) {
    console.error("Digest error:", error);
    return NextResponse.json(
      { error: "Digest generation failed", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
