export interface FeedCardData {
  id: string;
  headline: string;
  summary?: string;
  source: {
    name: string;
    handle?: string;
    avatar?: string;
  };
  timestamp: Date;
  tickers: string[];
  sentiment?: 'bullish' | 'bearish' | 'neutral';
  score?: number;
  engagement?: {
    comments?: number;
    shares?: number;
    likes?: number;
    points?: number;
    upvotes?: number;
    downvotes?: number;
  };
  domain?: string;
  category?: string;
  imageUrl?: string;
}
