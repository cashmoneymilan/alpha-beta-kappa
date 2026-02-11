import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { extractTickersQuick } from "@/lib/ticker-extraction";
import { calculateScore } from "@/lib/scoring";

// GET /api/notes - List all notes
export async function GET(request: NextRequest) {
  const supabase = createServiceClient();
  const searchParams = request.nextUrl.searchParams;

  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
  const offset = parseInt(searchParams.get("offset") || "0");

  try {
    const { data, error, count } = await supabase
      .from("user_notes")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      notes: data,
      total: count || 0,
      has_more: offset + limit < (count || 0),
    });
  } catch (error) {
    console.error("Notes API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/notes - Create a new note
export async function POST(request: NextRequest) {
  const supabase = createServiceClient();

  try {
    const body = await request.json();
    const { title, content, tickers: providedTickers, tags = [] } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Auto-extract tickers if not provided
    const tickers = providedTickers || extractTickersQuick(content);

    // Insert into user_notes table
    const { data: note, error: noteError } = (await supabase
      .from("user_notes")
      .insert({
        title: title || null,
        content,
        tickers,
        tags,
      } as any)
      .select()
      .single()) as any;

    if (noteError) {
      return NextResponse.json({ error: noteError.message }, { status: 500 });
    }

    // Also create a feed item for the note so it appears in the feed
    const score = calculateScore({
      sourceWeight: 10, // User's own notes get max source weight
      velocity: 0,
      publishedAt: new Date(),
      tickerCount: tickers.length,
    });

    const { data: feedItem, error: feedError } = (await supabase
      .from("feed_items")
      .insert({
        external_id: `note-${note.id}`,
        source_id: null, // Notes don't have a source
        source_type: "note",
        text: content.substring(0, 500), // Truncate for preview
        full_content: content,
        url: null,
        published_at: new Date().toISOString(),
        velocity: 0,
        score,
      } as any)
      .select()
      .single()) as any;

    if (feedError) {
      console.error("Failed to create feed item for note:", feedError);
      // Don't fail the request, the note was still created
    }

    // Link tickers to feed item
    if (feedItem && tickers.length > 0) {
      const tickerLinks = tickers.map((ticker: string) => ({
        feed_item_id: feedItem.id,
        ticker_symbol: ticker,
        confidence: 1.0,
      }));

      await supabase.from("feed_item_tickers").insert(tickerLinks as any);
    }

    return NextResponse.json({ note, feedItem }, { status: 201 });
  } catch (error) {
    console.error("Create note error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
