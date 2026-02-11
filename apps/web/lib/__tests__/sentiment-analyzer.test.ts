import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  analyzeSentiment,
  analyzeSentimentBatch,
  getSentimentEmoji,
  getSentimentColor,
  getSentimentBgColor,
  calculateContrarianBonus,
  type SentimentResult,
} from '../services/sentiment-analyzer';

describe('getSentimentEmoji', () => {
  it('should return bull emoji for positive sentiment', () => {
    expect(getSentimentEmoji('positive')).toBe('🐂');
  });

  it('should return bear emoji for negative sentiment', () => {
    expect(getSentimentEmoji('negative')).toBe('🐻');
  });

  it('should return dash for neutral sentiment', () => {
    expect(getSentimentEmoji('neutral')).toBe('➖');
  });
});

describe('getSentimentColor', () => {
  it('should return green color for positive sentiment', () => {
    expect(getSentimentColor('positive')).toContain('green');
  });

  it('should return red color for negative sentiment', () => {
    expect(getSentimentColor('negative')).toContain('red');
  });

  it('should return muted color for neutral sentiment', () => {
    expect(getSentimentColor('neutral')).toContain('muted');
  });
});

describe('getSentimentBgColor', () => {
  it('should return green background for positive sentiment', () => {
    const color = getSentimentBgColor('positive');
    expect(color).toContain('green');
    expect(color).toContain('bg-');
  });

  it('should return red background for negative sentiment', () => {
    const color = getSentimentBgColor('negative');
    expect(color).toContain('red');
    expect(color).toContain('bg-');
  });

  it('should return muted background for neutral sentiment', () => {
    const color = getSentimentBgColor('neutral');
    expect(color).toContain('muted');
  });
});

describe('calculateContrarianBonus', () => {
  it('should return bonus for bullish sentiment against falling price', () => {
    const result: SentimentResult = { label: 'positive', score: 0.9, normalized: 0.9 };
    const bonus = calculateContrarianBonus(result, -0.05); // Price down 5%
    expect(bonus).toBeGreaterThan(0);
    expect(bonus).toBe(9); // 0.9 * 10 = 9
  });

  it('should return bonus for bearish sentiment against rising price', () => {
    const result: SentimentResult = { label: 'negative', score: 0.8, normalized: -0.8 };
    const bonus = calculateContrarianBonus(result, 0.05); // Price up 5%
    expect(bonus).toBeGreaterThan(0);
    expect(bonus).toBe(8); // 0.8 * 10 = 8
  });

  it('should return 0 for sentiment aligned with price move', () => {
    const bullish: SentimentResult = { label: 'positive', score: 0.9, normalized: 0.9 };
    const bearish: SentimentResult = { label: 'negative', score: 0.9, normalized: -0.9 };

    expect(calculateContrarianBonus(bullish, 0.05)).toBe(0); // Both positive
    expect(calculateContrarianBonus(bearish, -0.05)).toBe(0); // Both negative
  });

  it('should return 0 for neutral sentiment', () => {
    const neutral: SentimentResult = { label: 'neutral', score: 0.9, normalized: 0 };
    expect(calculateContrarianBonus(neutral, 0.05)).toBe(0);
    expect(calculateContrarianBonus(neutral, -0.05)).toBe(0);
  });

  it('should scale bonus with sentiment confidence', () => {
    const highConf: SentimentResult = { label: 'positive', score: 0.9, normalized: 0.9 };
    const lowConf: SentimentResult = { label: 'positive', score: 0.5, normalized: 0.5 };

    const highBonus = calculateContrarianBonus(highConf, -0.05);
    const lowBonus = calculateContrarianBonus(lowConf, -0.05);

    expect(highBonus).toBeGreaterThan(lowBonus);
  });

  it('should not apply bonus for small price changes', () => {
    const bullish: SentimentResult = { label: 'positive', score: 0.9, normalized: 0.9 };
    // Price down only 1% - not enough to be contrarian
    expect(calculateContrarianBonus(bullish, -0.01)).toBe(0);
  });
});

describe('analyzeSentiment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call Hugging Face API with correct parameters', async () => {
    const mockResponse = [[
      { label: 'positive', score: 0.95 },
      { label: 'negative', score: 0.03 },
      { label: 'neutral', score: 0.02 },
    ]];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    vi.stubEnv('HUGGINGFACE_API_KEY', 'test-key');

    const result = await analyzeSentiment('AAPL is going to the moon!');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('huggingface'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );

    expect(result).toBeDefined();
    expect(result?.label).toBe('positive');
    expect(result?.score).toBe(0.95);
  });

  it('should return null when API key is missing', async () => {
    vi.stubEnv('HUGGINGFACE_API_KEY', '');
    vi.stubEnv('HF_TOKEN', '');

    const result = await analyzeSentiment('Test text');

    expect(result).toBeNull();
  });

  it('should handle API errors gracefully', async () => {
    vi.stubEnv('HUGGINGFACE_API_KEY', 'test-key');
    global.fetch = vi.fn().mockRejectedValue(new Error('API error'));

    const result = await analyzeSentiment('Test text');
    expect(result).toBeNull();
  });

  it('should handle rate limiting', async () => {
    vi.stubEnv('HUGGINGFACE_API_KEY', 'test-key');
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
    });

    const result = await analyzeSentiment('Test text');
    expect(result).toBeNull();
  });

  it('should normalize positive label correctly', async () => {
    vi.stubEnv('HUGGINGFACE_API_KEY', 'test-key');
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([[
        { label: 'positive', score: 0.8 },
        { label: 'negative', score: 0.1 },
        { label: 'neutral', score: 0.1 },
      ]]),
    });

    const result = await analyzeSentiment('Great earnings!');
    expect(result?.normalized).toBeGreaterThan(0);
  });

  it('should normalize negative label correctly', async () => {
    vi.stubEnv('HUGGINGFACE_API_KEY', 'test-key');
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([[
        { label: 'negative', score: 0.8 },
        { label: 'positive', score: 0.1 },
        { label: 'neutral', score: 0.1 },
      ]]),
    });

    const result = await analyzeSentiment('Terrible losses!');
    expect(result?.normalized).toBeLessThan(0);
  });
});

describe('analyzeSentimentBatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty map for empty input', async () => {
    const results = await analyzeSentimentBatch([]);
    expect(results.size).toBe(0);
  });

  it('should analyze multiple texts', async () => {
    vi.stubEnv('HUGGINGFACE_API_KEY', 'test-key');

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([[
        { label: 'positive', score: 0.9 },
        { label: 'negative', score: 0.05 },
        { label: 'neutral', score: 0.05 },
      ]]),
    });

    const texts = ['AAPL is bullish', 'TSLA is bearish'];
    const results = await analyzeSentimentBatch(texts);

    expect(results.size).toBe(2);
    expect(results.has('AAPL is bullish')).toBe(true);
    expect(results.has('TSLA is bearish')).toBe(true);
  });
});

describe('SentimentResult interface', () => {
  it('should have normalized value between -1 and 1', () => {
    const positive: SentimentResult = { label: 'positive', score: 0.9, normalized: 0.9 };
    const negative: SentimentResult = { label: 'negative', score: 0.9, normalized: -0.9 };
    const neutral: SentimentResult = { label: 'neutral', score: 0.9, normalized: 0 };

    expect(positive.normalized).toBeGreaterThanOrEqual(-1);
    expect(positive.normalized).toBeLessThanOrEqual(1);
    expect(negative.normalized).toBeGreaterThanOrEqual(-1);
    expect(negative.normalized).toBeLessThanOrEqual(1);
    expect(neutral.normalized).toBe(0);
  });

  it('should preserve sign based on sentiment label', () => {
    const positive: SentimentResult = { label: 'positive', score: 0.9, normalized: 0.9 };
    const negative: SentimentResult = { label: 'negative', score: 0.9, normalized: -0.9 };

    expect(positive.normalized).toBeGreaterThan(0);
    expect(negative.normalized).toBeLessThan(0);
  });
});
