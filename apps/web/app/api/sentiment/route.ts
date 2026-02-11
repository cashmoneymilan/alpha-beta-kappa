import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { analyzeSentiment, analyzeSentimentBatch } from '@/lib/services/sentiment-analyzer';

/**
 * POST /api/sentiment
 * Analyze sentiment for feed items
 *
 * Body:
 * - itemIds: string[] - Feed item IDs to analyze
 * - text?: string - Single text to analyze (alternative to itemIds)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemIds, text } = body;

    // Single text analysis
    if (text) {
      const result = await analyzeSentiment(text);
      return NextResponse.json({ sentiment: result });
    }

    // Batch analysis by item IDs
    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json(
        { error: 'itemIds array or text required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Fetch items that need sentiment analysis
    const { data: items, error: fetchError } = await supabase
      .from('feed_items')
      .select('id, text, full_content')
      .in('id', itemIds)
      .is('sentiment_label', null) as any;

    if (fetchError) {
      console.error('Error fetching items:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!items || items.length === 0) {
      return NextResponse.json({
        message: 'No items need analysis',
        analyzed: 0,
      });
    }

    // Analyze sentiment for each item
    const results: Array<{
      id: string;
      sentiment: { label: string; score: number } | null;
    }> = [];

    // Use full_content if available, otherwise text
    const textsToAnalyze = items.map((item: any) =>
      item.full_content || item.text
    );

    const sentimentResults = await analyzeSentimentBatch(textsToAnalyze);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const textKey = item.full_content || item.text;
      const sentiment = sentimentResults.get(textKey);

      results.push({
        id: item.id,
        sentiment: sentiment
          ? { label: sentiment.label, score: sentiment.score }
          : null,
      });

      // Update database with sentiment
      if (sentiment) {
        await (supabase
          .from('feed_items') as any)
          .update({
            sentiment_label: sentiment.label,
            sentiment_score: sentiment.score,
            sentiment_analyzed_at: new Date().toISOString(),
          })
          .eq('id', item.id);
      }
    }

    return NextResponse.json({
      analyzed: results.filter(r => r.sentiment !== null).length,
      results,
    });
  } catch (error) {
    console.error('Sentiment API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sentiment/pending
 * Get count of items pending sentiment analysis
 */
export async function GET() {
  try {
    const supabase = createServiceClient();

    const { count, error } = await supabase
      .from('feed_items')
      .select('*', { count: 'exact', head: true })
      .is('sentiment_label', null);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ pending: count || 0 });
  } catch (error) {
    console.error('Sentiment pending API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
