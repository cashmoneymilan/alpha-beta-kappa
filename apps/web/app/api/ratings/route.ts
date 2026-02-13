import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// GET /api/ratings - Get user's ratings
// Query params: item_id (optional) - get rating for specific item
export async function GET(request: NextRequest) {
  const supabase = createServiceClient();
  const searchParams = request.nextUrl.searchParams;
  const itemId = searchParams.get("item_id");

  try {
    // For now, use service role since we don't have auth setup for ratings
    // In production, this would use the authenticated user's ID
    let query = supabase.from("user_ratings").select("*");

    if (itemId) {
      query = query.eq("feed_item_id", itemId);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("Get ratings error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ratings: data });
  } catch (error) {
    console.error("Ratings API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/ratings - Create or update a rating
// Body: { feed_item_id, rating, tags? }
export async function POST(request: NextRequest) {
  const supabase = createServiceClient();

  try {
    const body = await request.json();
    const { feed_item_id, rating, tags = [] } = body;

    if (!feed_item_id) {
      return NextResponse.json(
        { error: "feed_item_id is required" },
        { status: 400 }
      );
    }

    if (rating !== 1 && rating !== -1) {
      return NextResponse.json(
        { error: "rating must be 1 (thumbs up) or -1 (thumbs down)" },
        { status: 400 }
      );
    }

    // Validate tags
    const validTags = ["actionable", "noise", "already_knew", "too_late"];
    const filteredTags = tags.filter((t: string) => validTags.includes(t));

    // For now, use a placeholder user_id since we don't have auth
    // In production, this would be auth.uid()
    const placeholderUserId = "00000000-0000-0000-0000-000000000000";

    // Upsert rating (insert or update if exists)
    const { data, error } = await supabase
      .from("user_ratings")
      .upsert(
        {
          user_id: placeholderUserId,
          feed_item_id,
          rating,
          tags: filteredTags,
          updated_at: new Date().toISOString(),
        } as any,
        {
          onConflict: "user_id,feed_item_id",
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Create rating error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ rating: data });
  } catch (error) {
    console.error("Ratings API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/ratings - Remove a rating
// Query params: item_id - the feed item to remove rating for
export async function DELETE(request: NextRequest) {
  const supabase = createServiceClient();
  const searchParams = request.nextUrl.searchParams;
  const itemId = searchParams.get("item_id");

  if (!itemId) {
    return NextResponse.json(
      { error: "item_id is required" },
      { status: 400 }
    );
  }

  try {
    // For now, use placeholder user_id
    const placeholderUserId = "00000000-0000-0000-0000-000000000000";

    const { error } = await supabase
      .from("user_ratings")
      .delete()
      .eq("user_id", placeholderUserId)
      .eq("feed_item_id", itemId);

    if (error) {
      console.error("Delete rating error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ratings API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
