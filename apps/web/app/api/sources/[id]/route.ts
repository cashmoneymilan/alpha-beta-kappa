import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/sources/[id] - Get a single source
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const supabase = createServiceClient();

  try {
    const { data, error } = await supabase
      .from("sources")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Source not found" }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ source: data });
  } catch (error) {
    console.error("Get source error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/sources/[id] - Update a source
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const supabase = createServiceClient();

  try {
    const body = await request.json();
    const { weight, enabled, name, url } = body;

    // Build update object with only provided fields
    const updates: Record<string, unknown> = {};

    if (weight !== undefined) {
      if (weight < 0 || weight > 10) {
        return NextResponse.json(
          { error: "Weight must be between 0 and 10" },
          { status: 400 }
        );
      }
      updates.weight = weight;
    }

    if (enabled !== undefined) {
      updates.enabled = enabled;
    }

    if (name !== undefined) {
      updates.name = name;
    }

    if (url !== undefined) {
      updates.url = url;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const { data, error } = (await (supabase
      .from("sources") as any)
      .update(updates)
      .eq("id", id)
      .select()
      .single()) as any;

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Source not found" }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ source: data });
  } catch (error) {
    console.error("Update source error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/sources/[id] - Delete a source
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const supabase = createServiceClient();

  try {
    const { error } = await supabase.from("sources").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete source error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
