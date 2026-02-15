/**
 * Sentiment Analysis Service
 *
 * Uses Hugging Face Inference API with FinBERT model for financial sentiment
 * Returns: positive, negative, or neutral with confidence score
 */

const HF_API_URL = 'https://router.huggingface.co/hf-inference/models/ProsusAI/finbert';

export interface SentimentResult {
  label: 'positive' | 'negative' | 'neutral';
  score: number; // Confidence 0-1
  normalized: number; // -1 to +1 scale (negative = -1, neutral = 0, positive = +1)
}

export interface BatchSentimentResult {
  text: string;
  sentiment: SentimentResult;
}

interface HuggingFaceResult {
  label: string;
  score: number;
}

/**
 * Analyze sentiment of a single text
 */
export async function analyzeSentiment(text: string): Promise<SentimentResult | null> {
  const HF_TOKEN = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN;

  if (!HF_TOKEN) {
    console.warn('HuggingFace API key not configured, skipping sentiment analysis');
    return null;
  }

  try {
    // Clean and truncate text for API (FinBERT has 512 token limit)
    const cleanedText = cleanTextForAnalysis(text);

    if (!cleanedText) {
      return { label: 'neutral', score: 0.5, normalized: 0 };
    }

    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: cleanedText }),
    });

    if (!response.ok) {
      // Handle model loading (503)
      if (response.status === 503) {
        console.log('FinBERT model is loading, retrying...');
        // Wait and retry once
        await new Promise(resolve => setTimeout(resolve, 20000));
        return analyzeSentiment(text);
      }
      throw new Error(`HuggingFace API error: ${response.status}`);
    }

    const results: HuggingFaceResult[][] = await response.json();

    // HuggingFace returns array of arrays for classification
    if (!results?.[0]?.length) {
      return { label: 'neutral', score: 0.5, normalized: 0 };
    }

    // Find highest scoring label
    const sortedResults = results[0].sort((a, b) => b.score - a.score);
    const topResult = sortedResults[0];

    const label = normalizeLabel(topResult!.label);

    return {
      label,
      score: topResult!.score,
      normalized: labelToNormalized(label, topResult!.score),
    };
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return null;
  }
}

/**
 * Batch analyze sentiment for multiple texts
 * More efficient for processing feed items in bulk
 */
export async function analyzeSentimentBatch(
  texts: string[],
  options: { concurrency?: number } = {}
): Promise<Map<string, SentimentResult | null>> {
  const { concurrency = 5 } = options;
  const results = new Map<string, SentimentResult | null>();

  // Process in batches to avoid rate limiting
  for (let i = 0; i < texts.length; i += concurrency) {
    const batch = texts.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(async (text) => {
        const sentiment = await analyzeSentiment(text);
        return { text, sentiment };
      })
    );

    for (const { text, sentiment } of batchResults) {
      results.set(text, sentiment);
    }

    // Small delay between batches to avoid rate limiting
    if (i + concurrency < texts.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
}

/**
 * Clean text for analysis
 */
function cleanTextForAnalysis(text: string): string {
  if (!text) return '';

  return text
    // Remove URLs
    .replace(/https?:\/\/\S+/g, '')
    // Remove mentions
    .replace(/@\w+/g, '')
    // Remove hashtags (keep the word)
    .replace(/#(\w+)/g, '$1')
    // Remove special characters but keep punctuation
    .replace(/[^\w\s.,!?;:'-]/g, ' ')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim()
    // Truncate to ~500 chars to stay within token limit
    .slice(0, 500);
}

/**
 * Normalize HuggingFace label to our standard format
 */
function normalizeLabel(label: string): 'positive' | 'negative' | 'neutral' {
  const lower = label.toLowerCase();
  if (lower.includes('positive') || lower === 'bullish') return 'positive';
  if (lower.includes('negative') || lower === 'bearish') return 'negative';
  return 'neutral';
}

/**
 * Convert label to normalized score (-1 to +1)
 */
function labelToNormalized(label: 'positive' | 'negative' | 'neutral', confidence: number): number {
  switch (label) {
    case 'positive':
      return confidence; // 0 to +1
    case 'negative':
      return -confidence; // -1 to 0
    case 'neutral':
      return 0;
  }
}

/**
 * Get emoji for sentiment display
 */
export function getSentimentEmoji(label: 'positive' | 'negative' | 'neutral'): string {
  switch (label) {
    case 'positive':
      return '🐂'; // Bull
    case 'negative':
      return '🐻'; // Bear
    case 'neutral':
      return '➖';
  }
}

/**
 * Get color class for sentiment display
 */
export function getSentimentColor(label: 'positive' | 'negative' | 'neutral'): string {
  switch (label) {
    case 'positive':
      return 'text-green-400';
    case 'negative':
      return 'text-red-400';
    case 'neutral':
      return 'text-muted-foreground';
  }
}

/**
 * Get background color class for sentiment badge
 */
export function getSentimentBgColor(label: 'positive' | 'negative' | 'neutral'): string {
  switch (label) {
    case 'positive':
      return 'bg-green-500/20 text-green-400';
    case 'negative':
      return 'bg-red-500/20 text-red-400';
    case 'neutral':
      return 'bg-muted text-muted-foreground';
  }
}

/**
 * Calculate contrarian bonus
 * If sentiment opposes recent price movement, add bonus points
 */
export function calculateContrarianBonus(
  sentiment: SentimentResult,
  recentPriceChange: number // Positive = price went up, negative = down
): number {
  // Sentiment is bullish but price went down, or vice versa
  const isContrarian =
    (sentiment.label === 'positive' && recentPriceChange < -0.02) ||
    (sentiment.label === 'negative' && recentPriceChange > 0.02);

  // Award bonus based on confidence and how contrarian it is
  if (isContrarian) {
    return Math.round(sentiment.score * 10); // Up to 10% bonus
  }

  return 0;
}
