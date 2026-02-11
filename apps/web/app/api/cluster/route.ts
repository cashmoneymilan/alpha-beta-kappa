import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

interface FeedItem {
  id: string;
  text: string;
  source_type: string;
  published_at: string;
  score: number;
}

interface Cluster {
  id: string;
  title: string;
  summary: string;
  momentum: "accelerating" | "stable" | "fading";
  tickers: string[];
  itemIds: string[];
  itemCount: number;
}

// POST /api/cluster - Trigger AI clustering of recent feed items
export async function POST(request: NextRequest) {
  const deepseekKey = process.env.DEEPSEEK_API_KEY;

  if (!deepseekKey) {
    return NextResponse.json(
      { error: "DEEPSEEK_API_KEY not configured" },
      { status: 500 }
    );
  }

  const supabase = createServiceClient();

  try {
    const body = await request.json().catch(() => ({}));
    const limit = Math.min(body.limit || 30, 50);

    // Fetch recent feed items
    const { data: items, error: fetchError } = await supabase
      .from("feed_items")
      .select("id, text, source_type, published_at, score")
      .order("published_at", { ascending: false })
      .limit(limit) as any;

    if (fetchError) {
      return NextResponse.json(
        { error: "Failed to fetch feed items" },
        { status: 500 }
      );
    }

    if (!items || items.length < 3) {
      return NextResponse.json({
        clusters: [],
        message: "Not enough items to cluster",
      });
    }

    // Prepare items for clustering
    const itemsForAI = items.map((item: FeedItem, idx: number) => ({
      idx,
      text: item.text.substring(0, 300), // Truncate for token efficiency
    }));

    // Call DeepSeek API
    const prompt = `You are a financial analyst assistant. Analyze these market-related posts and group them into narrative clusters.

Posts to analyze:
${itemsForAI.map((item: { idx: number; text: string }) => `[${item.idx}] ${item.text}`).join("\n\n")}

Instructions:
1. Identify 2-5 distinct narrative themes/clusters from these posts
2. For each cluster, provide:
   - A short title (3-6 words)
   - A one-sentence summary of the narrative
   - Momentum assessment: "accelerating" (gaining attention), "stable" (steady discussion), or "fading" (declining interest)
   - List of relevant ticker symbols mentioned (like NVDA, AAPL, BTC, etc.)
   - List of post indices [0, 1, 2...] that belong to this cluster

Respond ONLY with valid JSON in this exact format:
{
  "clusters": [
    {
      "title": "Cluster Title",
      "summary": "Brief summary of the narrative.",
      "momentum": "accelerating",
      "tickers": ["NVDA", "AMD"],
      "itemIndices": [0, 2, 5]
    }
  ]
}`;

    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${deepseekKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "You are a financial market analyst. Respond only with valid JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepSeek API error:", errorText);
      return NextResponse.json(
        { error: "AI clustering failed" },
        { status: 500 }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let parsedClusters;
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      parsedClusters = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    // Map indices back to item IDs
    const clusters: Cluster[] = (parsedClusters.clusters || []).map(
      (cluster: {
        title: string;
        summary: string;
        momentum: string;
        tickers: string[];
        itemIndices: number[];
      }, idx: number) => ({
        id: `cluster-${Date.now()}-${idx}`,
        title: cluster.title,
        summary: cluster.summary,
        momentum: cluster.momentum || "stable",
        tickers: cluster.tickers || [],
        itemIds: (cluster.itemIndices || [])
          .filter((i: number) => i < items.length)
          .map((i: number) => items[i]!.id),
        itemCount: (cluster.itemIndices || []).length,
      })
    );

    return NextResponse.json({
      clusters,
      itemsAnalyzed: items.length,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Clustering error:", error);
    return NextResponse.json(
      { error: "Clustering failed" },
      { status: 500 }
    );
  }
}

// GET /api/cluster - Check if clustering is available
export async function GET() {
  const isConfigured = !!process.env.DEEPSEEK_API_KEY;
  return NextResponse.json({
    available: isConfigured,
    provider: "deepseek",
  });
}
