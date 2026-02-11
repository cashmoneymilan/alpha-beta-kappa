import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// GET /api/sources - List all sources
export async function GET(request: NextRequest) {
  const supabase = createServiceClient();
  const searchParams = request.nextUrl.searchParams;

  const type = searchParams.get("type"); // "twitter" | "rss" | "news"
  const enabled = searchParams.get("enabled"); // "true" | "false"

  try {
    let query = supabase
      .from("sources")
      .select("*")
      .order("weight", { ascending: false })
      .order("name", { ascending: true });

    if (type) {
      query = query.eq("type", type);
    }
    if (enabled !== null) {
      query = query.eq("enabled", enabled === "true");
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ sources: data });
  } catch (error) {
    console.error("Sources API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/sources - Create a new source
export async function POST(request: NextRequest) {
  const supabase = createServiceClient();

  try {
    const body = await request.json();
    const { handle, name, type, url, weight = 5, category = "general" } = body;

    // Validate required fields
    if (!handle || !name || !type) {
      return NextResponse.json(
        { error: "Missing required fields: handle, name, type" },
        { status: 400 }
      );
    }

    // Validate type
    if (!["twitter", "rss", "news"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be: twitter, rss, or news" },
        { status: 400 }
      );
    }

    // RSS sources require a URL
    if (type === "rss" && !url) {
      return NextResponse.json(
        { error: "RSS sources require a URL" },
        { status: 400 }
      );
    }

    // Validate weight
    if (weight < 0 || weight > 10) {
      return NextResponse.json(
        { error: "Weight must be between 0 and 10" },
        { status: 400 }
      );
    }

    // Build insert object - category is optional until migration is run
    const insertData: Record<string, unknown> = {
      handle,
      name,
      type,
      url: url || null,
      weight,
      enabled: true,
    };

    // Only include category if explicitly provided (migration may not be run yet)
    if (category && category !== "general") {
      insertData.category = category;
    }

    const { data, error } = await supabase
      .from("sources")
      .insert(insertData as any)
      .select()
      .single();

    if (error) {
      // Handle unique constraint violation
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "A source with this handle and type already exists" },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ source: data }, { status: 201 });
  } catch (error) {
    console.error("Create source error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
