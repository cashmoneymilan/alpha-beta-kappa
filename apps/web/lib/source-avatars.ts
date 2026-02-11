/**
 * Source avatar resolution utility
 * Resolves avatars for Twitter, RSS, and news sources
 */

export interface Source {
  id: string;
  name: string;
  type: "twitter" | "rss" | "news";
  handle?: string;
  url?: string;
  avatar_url?: string;
}

// Known news sources with their brand colors
const NEWS_SOURCE_COLORS: Record<string, string> = {
  "Bloomberg": "#000000",
  "Reuters": "#FF8000",
  "WSJ": "#0274B6",
  "CNBC": "#003E7E",
  "Financial Times": "#FFF1E5",
  "MarketWatch": "#00AC4E",
  "Barron's": "#000000",
  "The Economist": "#E3120B",
  "Zero Hedge": "#333333",
  "Seeking Alpha": "#F7931A",
};

/**
 * Extract domain from URL
 */
function getDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return url;
  }
}

/**
 * Generate a consistent color from a string
 */
function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 45%)`;
}

/**
 * Get the first letter or two for avatar fallback
 */
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0]!.charAt(0).toUpperCase();
  }
  return (words[0]!.charAt(0) + words[1]!.charAt(0)).toUpperCase();
}

/**
 * Get avatar URL for a source
 * Returns the URL for the avatar image, or null if using fallback
 */
export function getSourceAvatarUrl(source: Source): string | null {
  // If source has a custom avatar URL, use it
  if (source.avatar_url) {
    return source.avatar_url;
  }

  // Twitter: use unavatar.io
  if (source.type === "twitter" && source.handle) {
    const handle = source.handle.replace("@", "");
    return `https://unavatar.io/twitter/${handle}?fallback=false`;
  }

  // RSS/News: use Google favicon service
  if ((source.type === "rss" || source.type === "news") && source.url) {
    const domain = getDomain(source.url);
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  }

  return null;
}

/**
 * Get fallback avatar info (color and initials)
 */
export function getSourceFallback(source: Source): { color: string; initials: string } {
  const color = NEWS_SOURCE_COLORS[source.name] || stringToColor(source.name);
  const initials = getInitials(source.name);
  return { color, initials };
}

/**
 * Format source display name
 * Twitter: @handle, RSS/News: source name
 */
export function getSourceDisplayName(source: Source): string {
  if (source.type === "twitter" && source.handle) {
    return source.handle.startsWith("@") ? source.handle : `@${source.handle}`;
  }
  return source.name;
}

/**
 * Get source link URL
 */
export function getSourceLink(source: Source): string | null {
  if (source.type === "twitter" && source.handle) {
    const handle = source.handle.replace("@", "");
    return `https://twitter.com/${handle}`;
  }
  return source.url || null;
}
