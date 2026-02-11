import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// GET /api/tickers - List all tickers
export async function GET(request: NextRequest) {
  const supabase = createServiceClient();
  const searchParams = request.nextUrl.searchParams;

  const assetClass = searchParams.get("asset_class");
  const search = searchParams.get("search");

  try {
    let query = supabase
      .from("tickers")
      .select("*")
      .order("symbol", { ascending: true });

    if (assetClass) {
      query = query.eq("asset_class", assetClass);
    }

    if (search) {
      // Search by symbol or name
      query = query.or(`symbol.ilike.%${search}%,name.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tickers: data });
  } catch (error) {
    console.error("Tickers API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/tickers - Add a new ticker
export async function POST(request: NextRequest) {
  const supabase = createServiceClient();

  try {
    const body = await request.json();
    const { symbol, name, asset_class = "equities", aliases = [] } = body;

    if (!symbol) {
      return NextResponse.json(
        { error: "Symbol is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("tickers")
      .insert({
        symbol: symbol.toUpperCase(),
        name: name || null,
        asset_class,
        aliases,
      } as any)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Ticker already exists" },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ticker: data }, { status: 201 });
  } catch (error) {
    console.error("Create ticker error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
