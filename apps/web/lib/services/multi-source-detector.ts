/**
 * Multi-Source Confirmation Detector
 *
 * Runs after PM + social ingesters complete. Checks temporal ordering
 * between PM and social signals to detect true multi-source confirmation.
 *
 * Key principle: PM must LEAD social for genuine alpha.
 * If PM and social fire simultaneously, they're both reacting to the same
 * news (double-counting, not independent confirmation).
 *
 * Conviction levels (stored in feed_item full_content):
 * - HIGH: PM-led + social confirms + multi-alignment
 * - MEDIUM: PM-led + single social confirms
 * - LOW: Single PM event, no social confirmation
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export interface MultiSourceResult {
  processed: number;
  flagged: number;
  pmLeadEvents: number;
  simultaneousEvents: number;
  socialLeadEvents: number;
  errors: string[];
}

type ConvictionLevel = "HIGH" | "MEDIUM" | "LOW";

// Time window for considering events as related (hours)
const LOOKBACK_HOURS = 24;
// Events within this window of each other are considered simultaneous
const SIMULTANEOUS_WINDOW_MS = 60 * 60 * 1000; // 1 hour

/**
 * Detect multi-source confirmations between PM and social signals.
 */
export async function detectMultiSourceConfirmations(
  supabase: SupabaseClient<Database>
): Promise<MultiSourceResult> {
  const result: MultiSourceResult = {
    processed: 0,
    flagged: 0,
    pmLeadEvents: 0,
    simultaneousEvents: 0,
    socialLeadEvents: 0,
    errors: [],
  };

  const lookbackTime = new Date(
    Date.now() - LOOKBACK_HOURS * 60 * 60 * 1000
  ).toISOString();

  try {
    // 1. Get PM feed_items from the lookback window
    const { data: pmItems, error: pmError } = (await supabase
      .from("feed_items")
      .select(
        `
        id,
        published_at,
        sentiment_label,
        full_content,
        source_type,
        feed_item_tickers!inner(ticker_symbol)
      `
      )
      .eq("source_type", "prediction_market")
      .gte("published_at", lookbackTime)
      .order("published_at", { ascending: true })) as any;

    if (pmError) {
      result.errors.push(`Failed to fetch PM items: ${pmError.message}`);
      return result;
    }

    if (!pmItems?.length) {
      return result; // No PM items to check
    }

    // 2. Get social (twitter, reddit, rss) feed_items from the lookback window
    const { data: socialItems, error: socialError } = (await supabase
      .from("feed_items")
      .select(
        `
        id,
        published_at,
        sentiment_label,
        source_type,
        feed_item_tickers!inner(ticker_symbol)
      `
      )
      .in("source_type", ["twitter", "reddit", "rss"])
      .gte("published_at", lookbackTime)
      .order("published_at", { ascending: true })) as any;

    if (socialError) {
      result.errors.push(
        `Failed to fetch social items: ${socialError.message}`
      );
      return result;
    }

    if (!socialItems?.length) {
      return result; // No social items to compare
    }

    // 3. Build ticker lookup for social items
    const socialByTicker = new Map<
      string,
      Array<{
        id: string;
        published_at: string;
        sentiment_label: string | null;
        source_type: string;
      }>
    >();

    for (const item of socialItems) {
      const tickers = (item.feed_item_tickers || []) as Array<{
        ticker_symbol: string;
      }>;
      for (const t of tickers) {
        const existing = socialByTicker.get(t.ticker_symbol) || [];
        existing.push({
          id: item.id,
          published_at: item.published_at,
          sentiment_label: item.sentiment_label,
          source_type: item.source_type,
        });
        socialByTicker.set(t.ticker_symbol, existing);
      }
    }

    // 4. For each PM item, check for social confirmation
    for (const pmItem of pmItems) {
      result.processed++;

      const pmTickers = (
        (pmItem.feed_item_tickers || []) as Array<{
          ticker_symbol: string;
        }>
      ).map((t) => t.ticker_symbol);
      const pmTime = new Date(pmItem.published_at).getTime();
      const pmSentiment = pmItem.sentiment_label;

      // Check if any social items mention the same tickers
      let bestMatch: {
        socialId: string;
        ordering: "pm_led" | "simultaneous" | "social_led";
        sentiment_aligns: boolean;
        source_type: string;
      } | null = null;

      for (const ticker of pmTickers) {
        const socialMatches = socialByTicker.get(ticker) || [];

        for (const social of socialMatches) {
          const socialTime = new Date(social.published_at).getTime();
          const timeDiff = socialTime - pmTime; // Positive = social is later (PM led)

          let ordering: "pm_led" | "simultaneous" | "social_led";
          if (timeDiff > SIMULTANEOUS_WINDOW_MS) {
            ordering = "pm_led"; // PM came first, social followed
          } else if (timeDiff < -SIMULTANEOUS_WINDOW_MS) {
            ordering = "social_led"; // Social came first
          } else {
            ordering = "simultaneous"; // Within 1 hour of each other
          }

          const sentimentAligns =
            pmSentiment != null &&
            social.sentiment_label != null &&
            pmSentiment === social.sentiment_label;

          // Prefer PM-led matches, then simultaneous
          if (
            !bestMatch ||
            (ordering === "pm_led" && bestMatch.ordering !== "pm_led") ||
            (ordering === "simultaneous" &&
              bestMatch.ordering === "social_led")
          ) {
            bestMatch = {
              socialId: social.id,
              ordering,
              sentiment_aligns: sentimentAligns,
              source_type: social.source_type,
            };
          }
        }
      }

      if (!bestMatch) continue;

      // 5. Apply flags based on temporal ordering
      if (bestMatch.ordering === "pm_led") {
        result.pmLeadEvents++;

        if (bestMatch.sentiment_aligns) {
          // Strong multi-source: PM led and sentiment confirms
          await addMultiSourceFlag(supabase, pmItem.id);
          await addMultiSourceFlag(supabase, bestMatch.socialId);
          result.flagged += 2;

          // Update PM item conviction in full_content
          await updateConviction(supabase, pmItem.id, pmItem.full_content, "MEDIUM");
        }

        // Check for contrarian opportunity (PM bullish, social bearish or vice versa)
        if (
          pmSentiment != null &&
          bestMatch.sentiment_aligns === false &&
          bestMatch.ordering === "pm_led"
        ) {
          // Sentiment diverges — flag as contrarian
          // Don't add multi-source flag (they disagree), but note the divergence
          console.log(
            `Contrarian opportunity: PM=${pmSentiment}, Social=${bestMatch.source_type} on same ticker`
          );
        }
      } else if (bestMatch.ordering === "simultaneous") {
        result.simultaneousEvents++;
        // Both reacting to same news — weaker signal, still flag but don't boost score
        if (bestMatch.sentiment_aligns) {
          await addMultiSourceFlag(supabase, pmItem.id);
          result.flagged++;
        }
      } else {
        result.socialLeadEvents++;
        // Social led PM — PM is lagging indicator, don't flag
      }
    }

    // 6. Check for multi_alignment events and upgrade conviction to HIGH
    const { data: multiAlignItems } = (await supabase
      .from("feed_items")
      .select("id, full_content")
      .eq("source_type", "prediction_market")
      .gte("published_at", lookbackTime)
      .like("full_content", '%"event_type":"multi_alignment"%')) as any;

    if (multiAlignItems) {
      for (const item of multiAlignItems) {
        // Check if it already has multi-source flag (PM-led + social confirms)
        const { data: flags } = (await supabase
          .from("feed_item_flags")
          .select("flag")
          .eq("feed_item_id", item.id)
          .eq("flag", "multi-source")
          .single()) as any;

        if (flags) {
          // Has both multi-alignment AND multi-source → HIGH conviction
          await updateConviction(
            supabase,
            item.id,
            item.full_content,
            "HIGH"
          );
        }
      }
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    result.errors.push(`Multi-source detection failed: ${msg}`);
    console.error("Multi-source detection error:", error);
  }

  console.log(
    `Multi-source detector: processed=${result.processed}, flagged=${result.flagged}, ` +
      `pm_led=${result.pmLeadEvents}, simultaneous=${result.simultaneousEvents}, ` +
      `social_led=${result.socialLeadEvents}`
  );

  return result;
}

/**
 * Add multi-source flag to a feed item (idempotent).
 */
async function addMultiSourceFlag(
  supabase: SupabaseClient<Database>,
  feedItemId: string
): Promise<void> {
  await supabase
    .from("feed_item_flags")
    .upsert(
      {
        feed_item_id: feedItemId,
        flag: "multi-source",
      } as any,
      { onConflict: "feed_item_id,flag" }
    )
    .select();
}

/**
 * Update conviction level in feed item's full_content JSON.
 */
async function updateConviction(
  supabase: SupabaseClient<Database>,
  feedItemId: string,
  existingContent: string | null,
  conviction: ConvictionLevel
): Promise<void> {
  try {
    let content: Record<string, unknown> = {};
    if (existingContent) {
      try {
        content = JSON.parse(existingContent);
      } catch {
        content = { original_content: existingContent };
      }
    }

    content.conviction = conviction;

    await (supabase.from("feed_items") as any)
      .update({ full_content: JSON.stringify(content) })
      .eq("id", feedItemId);
  } catch (error) {
    console.error(`Failed to update conviction for ${feedItemId}:`, error);
  }
}
