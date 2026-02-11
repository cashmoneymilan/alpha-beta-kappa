import { describe, it, expect } from 'vitest';
import {
  calculateScore,
  calculateScoreWithBreakdown,
  calculateVelocity,
  getScoreTier,
  getScoreColor,
  type ScoreInput,
} from '../scoring';

describe('calculateScore', () => {
  const baseInput: ScoreInput = {
    sourceWeight: 5,
    velocity: 10,
    publishedAt: new Date(), // Just now
    tickerCount: 1,
  };

  it('should return a score between 0 and 100', () => {
    const score = calculateScore(baseInput);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('should give higher scores to high-weight sources', () => {
    const lowWeight = calculateScore({ ...baseInput, sourceWeight: 2 });
    const highWeight = calculateScore({ ...baseInput, sourceWeight: 10 });
    expect(highWeight).toBeGreaterThan(lowWeight);
  });

  it('should give higher scores to high-velocity items', () => {
    const lowVelocity = calculateScore({ ...baseInput, velocity: 0 });
    const highVelocity = calculateScore({ ...baseInput, velocity: 1000 });
    expect(highVelocity).toBeGreaterThan(lowVelocity);
  });

  it('should give lower scores to older items', () => {
    const now = new Date();
    const recent = calculateScore({ ...baseInput, publishedAt: now });
    const old = calculateScore({
      ...baseInput,
      publishedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12 hours ago
    });
    expect(recent).toBeGreaterThan(old);
  });

  it('should give higher scores to items with more tickers', () => {
    const oneTicker = calculateScore({ ...baseInput, tickerCount: 1 });
    const threeTickers = calculateScore({ ...baseInput, tickerCount: 3 });
    expect(threeTickers).toBeGreaterThan(oneTicker);
  });

  it('should cap ticker score at 10 points', () => {
    const breakdown3 = calculateScoreWithBreakdown({ ...baseInput, tickerCount: 3 });
    const breakdown10 = calculateScoreWithBreakdown({ ...baseInput, tickerCount: 10 });
    // tickerScore = min(10, tickerCount * 3), so both should be 10
    expect(breakdown3.tickerScore).toBe(9); // 3 * 3 = 9
    expect(breakdown10.tickerScore).toBe(10); // Capped at 10
  });
});

describe('calculateScoreWithBreakdown', () => {
  it('should provide detailed breakdown of score components', () => {
    const input: ScoreInput = {
      sourceWeight: 5,
      velocity: 100,
      publishedAt: new Date(),
      tickerCount: 2,
    };

    const breakdown = calculateScoreWithBreakdown(input);

    expect(breakdown).toHaveProperty('total');
    expect(breakdown).toHaveProperty('weightScore');
    expect(breakdown).toHaveProperty('velocityScore');
    expect(breakdown).toHaveProperty('recencyScore');
    expect(breakdown).toHaveProperty('tickerScore');
    expect(breakdown).toHaveProperty('sentimentScore');
    expect(breakdown).toHaveProperty('sourceAccuracyScore');
    expect(breakdown).toHaveProperty('multiplier');
    expect(breakdown).toHaveProperty('contrarianBonus');
  });

  it('should calculate weight score correctly', () => {
    // sourceWeight * 4, max 40
    const breakdown = calculateScoreWithBreakdown({
      sourceWeight: 8,
      velocity: 0,
      publishedAt: new Date(),
      tickerCount: 0,
    });
    expect(breakdown.weightScore).toBe(32); // 8 * 4 = 32
  });

  it('should cap weight score at 40', () => {
    const breakdown = calculateScoreWithBreakdown({
      sourceWeight: 15, // Above max
      velocity: 0,
      publishedAt: new Date(),
      tickerCount: 0,
    });
    expect(breakdown.weightScore).toBe(40);
  });

  it('should apply multi-source multiplier', () => {
    const withoutMultiSource = calculateScoreWithBreakdown({
      sourceWeight: 5,
      velocity: 10,
      publishedAt: new Date(),
      tickerCount: 1,
      isMultiSource: false,
    });

    const withMultiSource = calculateScoreWithBreakdown({
      sourceWeight: 5,
      velocity: 10,
      publishedAt: new Date(),
      tickerCount: 1,
      isMultiSource: true,
    });

    expect(withMultiSource.multiplier).toBe(withoutMultiSource.multiplier + 0.15);
    expect(withMultiSource.total).toBeGreaterThan(withoutMultiSource.total);
  });

  it('should apply breaking news multiplier', () => {
    const withoutBreaking = calculateScoreWithBreakdown({
      sourceWeight: 5,
      velocity: 10,
      publishedAt: new Date(),
      tickerCount: 1,
      isBreaking: false,
    });

    const withBreaking = calculateScoreWithBreakdown({
      sourceWeight: 5,
      velocity: 10,
      publishedAt: new Date(),
      tickerCount: 1,
      isBreaking: true,
    });

    expect(withBreaking.multiplier).toBe(withoutBreaking.multiplier + 0.10);
  });
});

describe('sentiment scoring', () => {
  const baseInput: ScoreInput = {
    sourceWeight: 5,
    velocity: 10,
    publishedAt: new Date(),
    tickerCount: 1,
  };

  it('should add points for positive sentiment', () => {
    const withoutSentiment = calculateScoreWithBreakdown(baseInput);
    const withSentiment = calculateScoreWithBreakdown({
      ...baseInput,
      sentiment: { label: 'positive', score: 0.9, normalized: 0.9 },
    });

    expect(withSentiment.sentimentScore).toBe(18); // 0.9 * 20 = 18
    expect(withSentiment.total).toBeGreaterThan(withoutSentiment.total);
  });

  it('should add points for negative sentiment', () => {
    const withSentiment = calculateScoreWithBreakdown({
      ...baseInput,
      sentiment: { label: 'negative', score: 0.85, normalized: -0.85 },
    });

    expect(withSentiment.sentimentScore).toBe(17); // 0.85 * 20 = 17
  });

  it('should not add points for neutral sentiment', () => {
    const withSentiment = calculateScoreWithBreakdown({
      ...baseInput,
      sentiment: { label: 'neutral', score: 0.8, normalized: 0 },
    });

    expect(withSentiment.sentimentScore).toBe(0);
  });

  it('should add source accuracy score', () => {
    const withAccuracy = calculateScoreWithBreakdown({
      ...baseInput,
      sourceHitRate: 0.7, // 70% accuracy
    });

    expect(withAccuracy.sourceAccuracyScore).toBe(11); // 0.7 * 15 = 10.5 rounded to 11
  });

  it('should apply contrarian bonus when sentiment opposes price move', () => {
    // Positive sentiment when price dropped > 2%
    const contrarian = calculateScoreWithBreakdown({
      ...baseInput,
      sentiment: { label: 'positive', score: 0.8, normalized: 0.8 },
      recentPriceChange: -0.05, // Price dropped 5%
    });

    expect(contrarian.contrarianBonus).toBe(true);
    expect(contrarian.multiplier).toBeGreaterThanOrEqual(1.10);
  });

  it('should not apply contrarian bonus when sentiment aligns with price move', () => {
    // Positive sentiment when price went up
    const notContrarian = calculateScoreWithBreakdown({
      ...baseInput,
      sentiment: { label: 'positive', score: 0.8, normalized: 0.8 },
      recentPriceChange: 0.05, // Price up 5%
    });

    expect(notContrarian.contrarianBonus).toBe(false);
  });
});

describe('calculateVelocity', () => {
  it('should return 0 for no engagement', () => {
    expect(calculateVelocity({})).toBe(0);
  });

  it('should weight retweets higher than likes', () => {
    const likesOnly = calculateVelocity({ likes: 100, retweets: 0 });
    const retweetsOnly = calculateVelocity({ likes: 0, retweets: 100 });
    expect(retweetsOnly).toBeGreaterThan(likesOnly);
  });

  it('should calculate weighted engagement correctly', () => {
    const velocity = calculateVelocity({
      likes: 100,      // 100 * 1 = 100
      retweets: 50,    // 50 * 2 = 100
      replies: 20,     // 20 * 1.5 = 30
      views: 10000,    // 10000 * 0.01 = 100
    });
    expect(velocity).toBe(330); // 100 + 100 + 30 + 100
  });
});

describe('getScoreTier', () => {
  it('should return high for scores >= 80', () => {
    expect(getScoreTier(80)).toBe('high');
    expect(getScoreTier(100)).toBe('high');
  });

  it('should return medium for scores >= 60 and < 80', () => {
    expect(getScoreTier(60)).toBe('medium');
    expect(getScoreTier(79)).toBe('medium');
  });

  it('should return low for scores < 60', () => {
    expect(getScoreTier(0)).toBe('low');
    expect(getScoreTier(59)).toBe('low');
  });
});

describe('getScoreColor', () => {
  it('should return green classes for high scores', () => {
    expect(getScoreColor(85)).toContain('green');
  });

  it('should return primary classes for medium scores', () => {
    expect(getScoreColor(70)).toContain('primary');
  });

  it('should return muted classes for low scores', () => {
    expect(getScoreColor(40)).toContain('muted');
  });
});
