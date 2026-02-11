"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface FeedItem {
  id: string;
  external_id: string | null;
  source_id: string | null;
  source_type: string;
  text: string;
  full_content: string | null;
  url: string | null;
  published_at: string;
  ingested_at: string;
  velocity: number;
  score: number;
}

interface UseRealtimeFeedOptions {
  onNewItem?: (item: FeedItem) => void;
  onUpdate?: (item: FeedItem) => void;
  onDelete?: (id: string) => void;
  enabled?: boolean;
}

export function useRealtimeFeed(options: UseRealtimeFeedOptions = {}) {
  const { onNewItem, onUpdate, onDelete, enabled = true } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [newItemsCount, setNewItemsCount] = useState(0);

  // Reset new items count
  const clearNewItems = useCallback(() => {
    setNewItemsCount(0);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const supabase = createClient();
    let channel: RealtimeChannel | null = null;

    const setupSubscription = () => {
      channel = supabase
        .channel("feed_items_changes")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "feed_items",
          },
          (payload) => {
            const newItem = payload.new as FeedItem;
            setNewItemsCount((prev) => prev + 1);
            onNewItem?.(newItem);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "feed_items",
          },
          (payload) => {
            const updatedItem = payload.new as FeedItem;
            onUpdate?.(updatedItem);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "feed_items",
          },
          (payload) => {
            const deletedId = (payload.old as { id: string }).id;
            onDelete?.(deletedId);
          }
        )
        .subscribe((status) => {
          setIsConnected(status === "SUBSCRIBED");
        });
    };

    setupSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [enabled, onNewItem, onUpdate, onDelete]);

  return {
    isConnected,
    newItemsCount,
    clearNewItems,
  };
}
