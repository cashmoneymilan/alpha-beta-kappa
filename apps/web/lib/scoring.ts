/**
 * Scoring algorithm for feed items
 *
 * Components (95 base max):
 * - Source Weight (0-40 points): weight * 4
 * - Velocity (0-25 points): log10(velocity + 1) * 10
 * - Recency (0-20 points): Decays over 24 hours
 * - Ticker Count (0-10 points): min(10, tickerCount * 3)
 *
 * Sentiment Components (up to 35 additional):
 * - Sentiment Confidence (0-20 points): sentimentScore * 20
 * - Source Accuracy (0-15 points): historicalHitRate * 15
 *
 * Position Boost (optional):
 * - Position Match (0-20 points): If item mentions a ticker user holds
 *
 * Multipliers:
 * - +15% for multi-source confirmation
 * - +10% for breaking news
 * - +10% for contrarian sentiment (if sentiment opposes price move)
 */

import type { SentimentResult } from './services/sentiment-analyzer';

export interface ScoreInput {
  sourceWeight: number;      // 0-10 from sources table
  velocity: number;          // Engagement metric (likes, retweets, etc.)
  publishedAt: Date;         // When the item was published
  tickerCount: number;       // Number of tickers mentioned
  isMultiSource?: boolean;   // Same story from multiple sources
  isBreaking?: boolean;      // Marked as breaking news
  // Sentiment fields
  sentiment?: SentimentResult | null;
  sourceHitRate?: number;    // Historical accuracy 0-1
  recentPriceChange?: number; // For contrarian bonus calculation
  // Position-based boost
  itemTickers?: string[];    // Tickers mentioned in this item
  positionTickers?: string[]; // Tickers user has positions in
  positionBoostAmount?: number; // Points to add for position match (default: 20)
}

export interface ScoreBreakdown {
  total: number;
  weightScore: number;
  velocityScore: number;
  recencyScore: number;
  tickerScore: number;
  sentimentScore: number;
  sourceAccuracyScore: number;
  positionScore: number;
  multiplier: number;
  contrarianBonus: boolean;
}

/**
 * Calculate score for a feed item
 * @returns Score from 0-100
 */
export function calculateScore(input: ScoreInput): number {
  const breakdown = calculateScoreWithBreakdown(input);
  return breakdown.total;
}

/**
 * Calculate score with detailed breakdown
 */
export function calculateScoreWithBreakdown(input: ScoreInput): ScoreBreakdown {
  const {
    sourceWeight,
    velocity,
    publishedAt,
    tickerCount,
    isMultiSource = false,
    isBreaking = false,
    sentiment,
    sourceHitRate,
    recentPriceChange,
    itemTickers = [],
    positionTickers = [],
    positionBoostAmount = 20,
  } = input;

  // 1. Base score from source weight (0-40 points)
  // weight of 10 = 40 points, weight of 5 = 20 points
  const weightScore = Math.min(40, Math.max(0, sourceWeight * 4));

  // 2. Velocity score with diminishing returns (0-25 points)
  // Uses logarithmic scale so 10 likes ≈ 10 points, 100 likes ≈ 20 points, 1000 likes ≈ 25 points
  const velocityScore = Math.min(25, Math.log10(Math.max(1, velocity) + 1) * 10);

  // 3. Recency decay (0-20 points)
  // Full points if < 1 hour, linear decay to 0 over 24 hours
  const now = new Date();
  const ageMs = now.getTime() - publishedAt.getTime();
  const ageHours = ageMs / (1000 * 60 * 60);
  const recencyScore = Math.max(0, Math.min(20, 20 - (ageHours * (20 / 24))));

  // 4. Ticker relevance bonus (0-10 points)
  // More tickers = more relevant (capped at 10 points = 3+ tickers)
  const tickerScore = Math.min(10, tickerCount * 3);

  // 5. Sentiment confidence score (0-20 points)
  // High confidence sentiment gets more points
  let sentimentScore = 0;
  if (sentiment && sentiment.label !== 'neutral') {
    // Only non-neutral sentiment adds points
    // Higher confidence = more points
    sentimentScore = Math.round(sentiment.score * 20);
  }

  // 6. Source accuracy score (0-15 points)
  // Sources with better historical accuracy get bonus
  let sourceAccuracyScore = 0;
  if (sourceHitRate !== undefined && sourceHitRate > 0) {
    sourceAccuracyScore = Math.round(sourceHitRate * 15);
  }

  // 7. Position boost score (0-20 points default)
  // Items mentioning tickers the user holds positions in get boosted
  let positionScore = 0;
  if (positionTickers.length > 0 && itemTickers.length > 0) {
    const positionSet = new Set(positionTickers.map(t => t.toUpperCase()));
    const hasPositionTicker = itemTickers.some(t => positionSet.has(t.toUpperCase()));
    if (hasPositionTicker) {
      positionScore = positionBoostAmount;
    }
  }

  // 8. Calculate base score (max 150 before multipliers)
  const baseScore = weightScore + velocityScore + recencyScore + tickerScore + sentimentScore + sourceAccuracyScore + positionScore;

  // 9. Apply multipliers
  let multiplier = 1.0;
  if (isMultiSource) multiplier += 0.15;  // +15% if confirmed by multiple sources
  if (isBreaking) multiplier += 0.10;     // +10% if breaking news

  // 10. Contrarian bonus (+10% if sentiment opposes recent price move)
  let contrarianBonus = false;
  if (sentiment && recentPriceChange !== undefined) {
    const isContrarian =
      (sentiment.label === 'positive' && recentPriceChange < -0.02) ||
      (sentiment.label === 'negative' && recentPriceChange > 0.02);

    if (isContrarian) {
      multiplier += 0.10;
      contrarianBonus = true;
    }
  }

  // 11. Final score (capped at 100)
  const total = Math.min(100, Math.round(baseScore * multiplier));

  return {
    total,
    weightScore: Math.round(weightScore),
    velocityScore: Math.round(velocityScore),
    recencyScore: Math.round(recencyScore),
    tickerScore: Math.round(tickerScore),
    sentimentScore: Math.round(sentimentScore),
    sourceAccuracyScore: Math.round(sourceAccuracyScore),
    positionScore: Math.round(positionScore),
    multiplier,
    contrarianBonus,
  };
}

/**
 * Calculate velocity from engagement metrics
 * For Twitter: likes + retweets * 2 + replies * 1.5
 * For RSS: 0 (no engagement data)
 */
export function calculateVelocity(metrics: {
  likes?: number;
  retweets?: number;
  replies?: number;
  views?: number;
}): number {
  const { likes = 0, retweets = 0, replies = 0, views = 0 } = metrics;

  // Weighted engagement score
  // Retweets are most valuable (amplification)
  // Replies indicate discussion
  // Likes are basic engagement
  // Views are least valuable but still count
  return Math.round(
    likes * 1 +
    retweets * 2 +
    replies * 1.5 +
    views * 0.01
  );
}

/**
 * Batch recalculate scores for items (useful for refreshing old items)
 */
export function recalculateScores(
  items: Array<{
    sourceWeight: number;
    velocity: number;
    publishedAt: Date;
    tickerCount: number;
    flags: string[];
    sentiment?: SentimentResult | null;
    sourceHitRate?: number;
    recentPriceChange?: number;
  }>
): number[] {
  return items.map((item) =>
    calculateScore({
      sourceWeight: item.sourceWeight,
      velocity: item.velocity,
      publishedAt: item.publishedAt,
      tickerCount: item.tickerCount,
      isMultiSource: item.flags.includes("multi-source"),
      isBreaking: item.flags.includes("breaking"),
      sentiment: item.sentiment,
      sourceHitRate: item.sourceHitRate,
      recentPriceChange: item.recentPriceChange,
    })
  );
}

/**
 * Get score tier for display purposes
 */
export function getScoreTier(score: number): 'high' | 'medium' | 'low' {
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  return 'low';
}

/**
 * Get score color class
 */
export function getScoreColor(score: number): string {
  const tier = getScoreTier(score);
  switch (tier) {
    case 'high':
      return 'text-green-400 bg-green-500/10';
    case 'medium':
      return 'text-primary bg-primary/10';
    case 'low':
      return 'text-muted-foreground';
  }
}
