export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Source categories for alpha classification
export type SourceCategory =
  | "flow"       // Unusual options activity, whale alerts
  | "research"   // Deep dives, fundamental analysis
  | "breaking"   // Fast news bots
  | "sector"     // Domain specialists (semis, biotech, etc.)
  | "macro"      // Fed/rates/liquidity analysis
  | "filings"    // 13F, insider buying, SEC filings
  | "quant"      // Backtests, systematic signals
  | "contrarian" // Fade signals (inverse indicators)
  | "general";   // Default/unclassified

export type Database = {
  public: {
    Tables: {
      sources: {
        Row: {
          id: string;
          handle: string;
          name: string;
          type: "twitter" | "rss" | "news";
          category: SourceCategory;
          weight: number;
          url: string | null;
          enabled: boolean;
          created_at: string;
          updated_at: string;
          last_fetched_at: string | null;
        };
        Insert: {
          id?: string;
          handle: string;
          name: string;
          type: "twitter" | "rss" | "news";
          category?: SourceCategory;
          weight?: number;
          url?: string | null;
          enabled?: boolean;
          created_at?: string;
          updated_at?: string;
          last_fetched_at?: string | null;
        };
        Update: {
          id?: string;
          handle?: string;
          name?: string;
          type?: "twitter" | "rss" | "news";
          category?: SourceCategory;
          weight?: number;
          url?: string | null;
          enabled?: boolean;
          created_at?: string;
          updated_at?: string;
          last_fetched_at?: string | null;
        };
      };
      price_snapshots: {
        Row: {
          id: string;
          feed_item_id: string;
          ticker_symbol: string;
          snapshot_time: string;
          price: number;
          bid: number | null;
          ask: number | null;
          volume: number | null;
        };
        Insert: {
          id?: string;
          feed_item_id: string;
          ticker_symbol: string;
          snapshot_time?: string;
          price: number;
          bid?: number | null;
          ask?: number | null;
          volume?: number | null;
        };
        Update: {
          id?: string;
          feed_item_id?: string;
          ticker_symbol?: string;
          snapshot_time?: string;
          price?: number;
          bid?: number | null;
          ask?: number | null;
          volume?: number | null;
        };
      };
      signal_returns: {
        Row: {
          id: string;
          feed_item_id: string;
          ticker_symbol: string;
          entry_price: number;
          entry_time: string;
          return_1h: number | null;
          return_4h: number | null;
          return_1d: number | null;
          return_1w: number | null;
          price_1h: number | null;
          price_4h: number | null;
          price_1d: number | null;
          price_1w: number | null;
          measured_1h_at: string | null;
          measured_4h_at: string | null;
          measured_1d_at: string | null;
          measured_1w_at: string | null;
          signal_direction: number;
        };
        Insert: {
          id?: string;
          feed_item_id: string;
          ticker_symbol: string;
          entry_price: number;
          entry_time: string;
          return_1h?: number | null;
          return_4h?: number | null;
          return_1d?: number | null;
          return_1w?: number | null;
          price_1h?: number | null;
          price_4h?: number | null;
          price_1d?: number | null;
          price_1w?: number | null;
          measured_1h_at?: string | null;
          measured_4h_at?: string | null;
          measured_1d_at?: string | null;
          measured_1w_at?: string | null;
          signal_direction?: number;
        };
        Update: {
          id?: string;
          feed_item_id?: string;
          ticker_symbol?: string;
          entry_price?: number;
          entry_time?: string;
          return_1h?: number | null;
          return_4h?: number | null;
          return_1d?: number | null;
          return_1w?: number | null;
          price_1h?: number | null;
          price_4h?: number | null;
          price_1d?: number | null;
          price_1w?: number | null;
          measured_1h_at?: string | null;
          measured_4h_at?: string | null;
          measured_1d_at?: string | null;
          measured_1w_at?: string | null;
          signal_direction?: number;
        };
      };
      source_performance: {
        Row: {
          source_id: string;
          total_signals: number;
          signals_with_tickers: number;
          total_predictions: number;
          bullish_count: number;
          bearish_count: number;
          hit_rate_1h: number | null;
          hit_rate_4h: number | null;
          hit_rate_1d: number | null;
          hit_rate_1w: number | null;
          avg_return_1h: number | null;
          avg_return_4h: number | null;
          avg_return_1d: number | null;
          avg_return_1w: number | null;
          best_ticker: string | null;
          best_ticker_avg_return: number | null;
          best_return: number | null;
          worst_ticker: string | null;
          worst_return: number | null;
          alpha_score: number | null;
          last_calculated_at: string | null;
          updated_at: string;
        };
        Insert: {
          source_id: string;
          total_signals?: number;
          signals_with_tickers?: number;
          total_predictions?: number;
          bullish_count?: number;
          bearish_count?: number;
          hit_rate_1h?: number | null;
          hit_rate_4h?: number | null;
          hit_rate_1d?: number | null;
          hit_rate_1w?: number | null;
          avg_return_1h?: number | null;
          avg_return_4h?: number | null;
          avg_return_1d?: number | null;
          avg_return_1w?: number | null;
          best_ticker?: string | null;
          best_ticker_avg_return?: number | null;
          best_return?: number | null;
          worst_ticker?: string | null;
          worst_return?: number | null;
          alpha_score?: number | null;
          last_calculated_at?: string | null;
          updated_at?: string;
        };
        Update: {
          source_id?: string;
          total_signals?: number;
          signals_with_tickers?: number;
          total_predictions?: number;
          bullish_count?: number;
          bearish_count?: number;
          hit_rate_1h?: number | null;
          hit_rate_4h?: number | null;
          hit_rate_1d?: number | null;
          hit_rate_1w?: number | null;
          avg_return_1h?: number | null;
          avg_return_4h?: number | null;
          avg_return_1d?: number | null;
          avg_return_1w?: number | null;
          best_ticker?: string | null;
          best_ticker_avg_return?: number | null;
          best_return?: number | null;
          worst_ticker?: string | null;
          worst_return?: number | null;
          alpha_score?: number | null;
          last_calculated_at?: string | null;
          updated_at?: string;
        };
      };
      source_predictions: {
        Row: {
          id: string;
          source_id: string;
          feed_item_id: string;
          ticker: string;
          direction: 'bullish' | 'bearish' | 'neutral';
          entry_price: number | null;
          predicted_at: string;
          exit_price_1h: number | null;
          exit_price_4h: number | null;
          exit_price_1d: number | null;
          return_1h: number | null;
          return_4h: number | null;
          return_1d: number | null;
          outcome_1h: 'correct' | 'incorrect' | 'pending';
          outcome_4h: 'correct' | 'incorrect' | 'pending';
          outcome_1d: 'correct' | 'incorrect' | 'pending';
          processed_at: string | null;
        };
        Insert: {
          id?: string;
          source_id: string;
          feed_item_id: string;
          ticker: string;
          direction: 'bullish' | 'bearish' | 'neutral';
          entry_price?: number | null;
          predicted_at?: string;
          exit_price_1h?: number | null;
          exit_price_4h?: number | null;
          exit_price_1d?: number | null;
          return_1h?: number | null;
          return_4h?: number | null;
          return_1d?: number | null;
          outcome_1h?: 'correct' | 'incorrect' | 'pending';
          outcome_4h?: 'correct' | 'incorrect' | 'pending';
          outcome_1d?: 'correct' | 'incorrect' | 'pending';
          processed_at?: string | null;
        };
        Update: {
          id?: string;
          source_id?: string;
          feed_item_id?: string;
          ticker?: string;
          direction?: 'bullish' | 'bearish' | 'neutral';
          entry_price?: number | null;
          predicted_at?: string;
          exit_price_1h?: number | null;
          exit_price_4h?: number | null;
          exit_price_1d?: number | null;
          return_1h?: number | null;
          return_4h?: number | null;
          return_1d?: number | null;
          outcome_1h?: 'correct' | 'incorrect' | 'pending';
          outcome_4h?: 'correct' | 'incorrect' | 'pending';
          outcome_1d?: 'correct' | 'incorrect' | 'pending';
          processed_at?: string | null;
        };
      };
      tickers: {
        Row: {
          symbol: string;
          name: string | null;
          asset_class: "equities" | "crypto" | "macro" | "metals" | "commodities";
          aliases: string[];
          created_at: string;
        };
        Insert: {
          symbol: string;
          name?: string | null;
          asset_class?: "equities" | "crypto" | "macro" | "metals" | "commodities";
          aliases?: string[];
          created_at?: string;
        };
        Update: {
          symbol?: string;
          name?: string | null;
          asset_class?: "equities" | "crypto" | "macro" | "metals" | "commodities";
          aliases?: string[];
          created_at?: string;
        };
      };
      feed_items: {
        Row: {
          id: string;
          external_id: string | null;
          source_id: string | null;
          source_type: "twitter" | "rss" | "news" | "note";
          text: string;
          content: string;
          full_content: string | null;
          url: string | null;
          published_at: string;
          ingested_at: string;
          velocity: number;
          score: number;
          tickers: string[] | null;
          sentiment_label: 'positive' | 'negative' | 'neutral' | null;
          sentiment_score: number | null;
          sentiment_analyzed_at: string | null;
        };
        Insert: {
          id?: string;
          external_id?: string | null;
          source_id?: string | null;
          source_type: "twitter" | "rss" | "news" | "note";
          text: string;
          content?: string;
          full_content?: string | null;
          url?: string | null;
          published_at: string;
          ingested_at?: string;
          velocity?: number;
          score?: number;
          tickers?: string[] | null;
          sentiment_label?: 'positive' | 'negative' | 'neutral' | null;
          sentiment_score?: number | null;
          sentiment_analyzed_at?: string | null;
        };
        Update: {
          id?: string;
          external_id?: string | null;
          source_id?: string | null;
          source_type?: "twitter" | "rss" | "news" | "note";
          text?: string;
          content?: string;
          full_content?: string | null;
          url?: string | null;
          published_at?: string;
          ingested_at?: string;
          velocity?: number;
          score?: number;
          tickers?: string[] | null;
          sentiment_label?: 'positive' | 'negative' | 'neutral' | null;
          sentiment_score?: number | null;
          sentiment_analyzed_at?: string | null;
        };
      };
      feed_item_tickers: {
        Row: {
          feed_item_id: string;
          ticker_symbol: string;
          confidence: number;
        };
        Insert: {
          feed_item_id: string;
          ticker_symbol: string;
          confidence?: number;
        };
        Update: {
          feed_item_id?: string;
          ticker_symbol?: string;
          confidence?: number;
        };
      };
      feed_item_flags: {
        Row: {
          feed_item_id: string;
          flag: "new" | "repost" | "multi-source" | "breaking" | "starred";
          created_at: string;
        };
        Insert: {
          feed_item_id: string;
          flag: "new" | "repost" | "multi-source" | "breaking" | "starred";
          created_at?: string;
        };
        Update: {
          feed_item_id?: string;
          flag?: "new" | "repost" | "multi-source" | "breaking" | "starred";
          created_at?: string;
        };
      };
      user_notes: {
        Row: {
          id: string;
          title: string | null;
          content: string;
          tickers: string[];
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title?: string | null;
          content: string;
          tickers?: string[];
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string | null;
          content?: string;
          tickers?: string[];
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      ingestion_logs: {
        Row: {
          id: string;
          job_type: "twitter" | "rss" | "manual";
          source_id: string | null;
          status: "started" | "success" | "failed";
          items_processed: number;
          error_message: string | null;
          started_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          job_type: "twitter" | "rss" | "manual";
          source_id?: string | null;
          status: "started" | "success" | "failed";
          items_processed?: number;
          error_message?: string | null;
          started_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          job_type?: "twitter" | "rss" | "manual";
          source_id?: string | null;
          status?: "started" | "success" | "failed";
          items_processed?: number;
          error_message?: string | null;
          started_at?: string;
          completed_at?: string | null;
        };
      };
      user_credentials: {
        Row: {
          id: string;
          user_id: string;
          provider: 'alpaca' | 'ibkr' | 'resend';
          encrypted_data: string;
          label: string | null;
          is_active: boolean;
          last_used_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider: 'alpaca' | 'ibkr' | 'resend';
          encrypted_data: string;
          label?: string | null;
          is_active?: boolean;
          last_used_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          provider?: 'alpaca' | 'ibkr' | 'resend';
          encrypted_data?: string;
          label?: string | null;
          is_active?: boolean;
          last_used_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          email_notifications: boolean;
          browser_notifications: boolean;
          notification_email: string | null;
          default_position_size: number;
          risk_warning_threshold: number;
          theme: 'dark' | 'light' | 'system';
          workspace_layout: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email_notifications?: boolean;
          browser_notifications?: boolean;
          notification_email?: string | null;
          default_position_size?: number;
          risk_warning_threshold?: number;
          theme?: 'dark' | 'light' | 'system';
          workspace_layout?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email_notifications?: boolean;
          browser_notifications?: boolean;
          notification_email?: string | null;
          default_position_size?: number;
          risk_warning_threshold?: number;
          theme?: 'dark' | 'light' | 'system';
          workspace_layout?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_alert_rules: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          enabled: boolean;
          conditions: Record<string, unknown>[];
          logic: 'AND' | 'OR';
          browser_notify: boolean;
          email_notify: boolean;
          email: string | null;
          trigger_count: number;
          last_triggered_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          enabled?: boolean;
          conditions?: Record<string, unknown>[];
          logic?: 'AND' | 'OR';
          browser_notify?: boolean;
          email_notify?: boolean;
          email?: string | null;
          trigger_count?: number;
          last_triggered_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          enabled?: boolean;
          conditions?: Record<string, unknown>[];
          logic?: 'AND' | 'OR';
          browser_notify?: boolean;
          email_notify?: boolean;
          email?: string | null;
          trigger_count?: number;
          last_triggered_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
};

// Helper types
export type Source = Database["public"]["Tables"]["sources"]["Row"];
export type Ticker = Database["public"]["Tables"]["tickers"]["Row"];
export type FeedItem = Database["public"]["Tables"]["feed_items"]["Row"];
export type UserNote = Database["public"]["Tables"]["user_notes"]["Row"];
export type PriceSnapshot = Database["public"]["Tables"]["price_snapshots"]["Row"];
export type SignalReturn = Database["public"]["Tables"]["signal_returns"]["Row"];
export type SourcePerformance = Database["public"]["Tables"]["source_performance"]["Row"];
export type SourcePrediction = Database["public"]["Tables"]["source_predictions"]["Row"];
export type UserCredential = Database["public"]["Tables"]["user_credentials"]["Row"];
export type UserSettings = Database["public"]["Tables"]["user_settings"]["Row"];
export type UserAlertRule = Database["public"]["Tables"]["user_alert_rules"]["Row"];
