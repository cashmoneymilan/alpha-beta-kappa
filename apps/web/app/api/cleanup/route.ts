import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  // Auth: Vercel cron header or CRON_SECRET
  const isVercelCron = request.headers.get("x-vercel-cron") === "true";
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!isVercelCron && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  try {
    // Get IDs of items to delete (for cascade tracking)
    const { data: oldItems, error: selectError } = (await supabase
      .from("feed_items")
      .select("id")
      .lt("published_at", cutoffDate)) as any;

    if (selectError) {
      console.error("Cleanup select error:", selectError);
      return NextResponse.json({ error: selectError.message }, { status: 500 });
    }

    if (!oldItems || oldItems.length === 0) {
      return NextResponse.json({
        deletedCount: 0,
        message: "No items older than 30 days",
      });
    }

    const oldIds = oldItems.map((item: any) => item.id);

    // Delete related records first (in case cascade isn't configured)
    await (supabase.from("feed_item_tickers") as any)
      .delete()
      .in("feed_item_id", oldIds);

    await (supabase.from("feed_item_flags") as any)
      .delete()
      .in("feed_item_id", oldIds);

    await (supabase.from("price_snapshots") as any)
      .delete()
      .in("feed_item_id", oldIds);

    await (supabase.from("signal_returns") as any)
      .delete()
      .in("feed_item_id", oldIds);

    // Delete the feed items themselves
    const { error: deleteError } = await (supabase.from("feed_items") as any)
      .delete()
      .lt("published_at", cutoffDate);

    if (deleteError) {
      console.error("Cleanup delete error:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Get remaining count
    const { count } = (await supabase
      .from("feed_items")
      .select("id", { count: "exact", head: true })) as any;

    console.log(`Cleanup: deleted ${oldIds.length} items older than 30 days, ${count} remaining`);

    return NextResponse.json({
      deletedCount: oldIds.length,
      remainingItems: count || 0,
      cutoffDate,
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json(
      { error: "Cleanup failed", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
