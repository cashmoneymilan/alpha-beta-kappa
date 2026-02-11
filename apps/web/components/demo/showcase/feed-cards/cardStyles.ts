import type { CSSProperties } from 'react';

// Bloomberg Terminal Style - Uses theme CSS variables
export const bloombergStyles = {
  container: {
    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
    borderRadius: '0px',
  } as CSSProperties,
  header: {
    padding: '8px 12px',
  } as CSSProperties,
  headerText: {
    fontWeight: 700,
    fontSize: '10px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
  } as CSSProperties,
  content: {
    padding: '12px',
  } as CSSProperties,
  headline: {
    fontSize: '13px',
    fontWeight: 600,
    lineHeight: 1.4,
    marginBottom: '8px',
  } as CSSProperties,
  summary: {
    fontSize: '11px',
    lineHeight: 1.5,
  } as CSSProperties,
  ticker: {
    padding: '2px 6px',
    fontSize: '11px',
    fontWeight: 700,
  } as CSSProperties,
  tickerBullish: {
  } as CSSProperties,
  tickerBearish: {
  } as CSSProperties,
  timestamp: {
    fontSize: '10px',
  } as CSSProperties,
  footer: {
    padding: '8px 12px',
  } as CSSProperties,
  // These are now CSS variable references for use in className
  accent: 'hsl(var(--demo-primary))',
  bullish: 'hsl(var(--demo-bullish))',
  bearish: 'hsl(var(--demo-bearish))',
};

// TradingView Style - Clean white with blue accents
export const tradingViewStyles = {
  container: {
    backgroundColor: '#ffffff',
    color: '#131722',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    borderRadius: '8px',
    border: '1px solid #e0e3eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  } as CSSProperties,
  header: {
    padding: '12px 16px',
    borderBottom: '1px solid #e0e3eb',
  } as CSSProperties,
  headerText: {
    color: '#787b86',
    fontWeight: 600,
    fontSize: '11px',
    textTransform: 'uppercase' as const,
  } as CSSProperties,
  content: {
    padding: '16px',
  } as CSSProperties,
  headline: {
    color: '#131722',
    fontSize: '15px',
    fontWeight: 600,
    lineHeight: 1.4,
    marginBottom: '8px',
  } as CSSProperties,
  summary: {
    color: '#787b86',
    fontSize: '13px',
    lineHeight: 1.5,
  } as CSSProperties,
  ticker: {
    color: '#2962ff',
    backgroundColor: '#e3f2fd',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
  } as CSSProperties,
  tickerBullish: {
    color: '#26a69a',
    backgroundColor: '#e8f5e9',
  } as CSSProperties,
  tickerBearish: {
    color: '#ef5350',
    backgroundColor: '#ffebee',
  } as CSSProperties,
  timestamp: {
    color: '#787b86',
    fontSize: '12px',
  } as CSSProperties,
  sparkline: {
    stroke: '#2962ff',
    fill: 'none',
    strokeWidth: 1.5,
  } as CSSProperties,
  footer: {
    borderTop: '1px solid #e0e3eb',
    padding: '12px 16px',
    backgroundColor: '#fafafa',
  } as CSSProperties,
  footerCompact: {
    borderTop: '1px solid #e0e3eb',
    padding: '4px 12px',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  } as CSSProperties,
  footerRich: {
    borderTop: '1px solid #e0e3eb',
    padding: '10px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as CSSProperties,
  tickerPill: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    backgroundColor: '#e3f2fd',
    color: '#2962ff',
  } as CSSProperties,
  sentimentBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.02em',
  } as CSSProperties,
  sentimentBullish: {
    backgroundColor: '#e8f5e9',
    color: '#26a69a',
  } as CSSProperties,
  sentimentBearish: {
    backgroundColor: '#ffebee',
    color: '#ef5350',
  } as CSSProperties,
  sentimentNeutral: {
    backgroundColor: '#f5f5f5',
    color: '#787b86',
  } as CSSProperties,
  accent: '#2962ff',
  bullish: '#26a69a',
  bearish: '#ef5350',
};

// Twitter/X Style - Pure black with blue accents
export const twitterStyles = {
  container: {
    backgroundColor: '#000000',
    color: '#e7e9ea',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    borderRadius: '16px',
    borderBottom: '1px solid #2f3336',
  } as CSSProperties,
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '4px',
    minWidth: 0,
  } as CSSProperties,
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#1d9bf0',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '13px',
    flexShrink: 0,
  } as CSSProperties,
  displayName: {
    color: '#e7e9ea',
    fontWeight: 700,
    fontSize: '13px',
    whiteSpace: 'nowrap' as const,
    flexShrink: 0,
  } as CSSProperties,
  handle: {
    color: '#71767b',
    fontSize: '13px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    minWidth: 0,
  } as CSSProperties,
  separator: {
    color: '#71767b',
    fontSize: '13px',
    padding: '0 2px',
  } as CSSProperties,
  timestamp: {
    color: '#71767b',
    fontSize: '13px',
  } as CSSProperties,
  content: {
    padding: '12px 14px',
  } as CSSProperties,
  tweetText: {
    color: '#e7e9ea',
    fontSize: '13px',
    lineHeight: 1.4,
    marginTop: '6px',
    wordWrap: 'break-word' as const,
  } as CSSProperties,
  ticker: {
    color: '#1d9bf0',
    fontWeight: 400,
  } as CSSProperties,
  accent: '#1d9bf0',
};

// Reddit Compact Style - Dense with orange accent
export const redditStyles = {
  container: {
    backgroundColor: '#1a1a1b',
    color: '#d7dadc',
    fontFamily: 'IBM Plex Sans, sans-serif',
    borderRadius: '4px',
    border: '1px solid #343536',
  } as CSSProperties,
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
  } as CSSProperties,
  votes: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    minWidth: '40px',
  } as CSSProperties,
  upvote: {
    color: '#818384',
    cursor: 'pointer',
  } as CSSProperties,
  upvoteActive: {
    color: '#ff4500',
  } as CSSProperties,
  downvote: {
    color: '#818384',
    cursor: 'pointer',
  } as CSSProperties,
  downvoteActive: {
    color: '#7193ff',
  } as CSSProperties,
  score: {
    color: '#d7dadc',
    fontSize: '12px',
    fontWeight: 700,
  } as CSSProperties,
  content: {
    flex: 1,
    minWidth: 0,
  } as CSSProperties,
  headline: {
    color: '#d7dadc',
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: 1.3,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  } as CSSProperties,
  meta: {
    color: '#818384',
    fontSize: '12px',
    marginTop: '4px',
  } as CSSProperties,
  subreddit: {
    color: '#d7dadc',
    fontWeight: 600,
  } as CSSProperties,
  link: {
    color: '#4fbcff',
    fontSize: '12px',
  } as CSSProperties,
  ticker: {
    color: '#ff4500',
    fontWeight: 700,
  } as CSSProperties,
  accent: '#ff4500',
  upvoteColor: '#ff4500',
  downvoteColor: '#7193ff',
};

// Hacker News Style - Classic minimalist
export const hackerNewsStyles = {
  container: {
    backgroundColor: '#f6f6ef',
    color: '#000000',
    fontFamily: 'Verdana, Geneva, sans-serif',
    fontSize: '10pt',
    padding: '0',
  } as CSSProperties,
  row: {
    padding: '4px 8px',
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
  } as CSSProperties,
  rank: {
    color: '#828282',
    fontSize: '10pt',
    minWidth: '24px',
    textAlign: 'right' as const,
  } as CSSProperties,
  upvote: {
    color: '#828282',
    cursor: 'pointer',
    fontSize: '10pt',
  } as CSSProperties,
  upvoteActive: {
    color: '#ff6600',
  } as CSSProperties,
  headline: {
    color: '#000000',
    fontSize: '10pt',
    textDecoration: 'none',
  } as CSSProperties,
  headlineVisited: {
    color: '#828282',
  } as CSSProperties,
  domain: {
    color: '#828282',
    fontSize: '8pt',
    marginLeft: '4px',
  } as CSSProperties,
  subtext: {
    padding: '2px 8px 6px 32px',
    color: '#828282',
    fontSize: '8pt',
  } as CSSProperties,
  points: {
    color: '#828282',
  } as CSSProperties,
  user: {
    color: '#828282',
    textDecoration: 'none',
  } as CSSProperties,
  link: {
    color: '#828282',
    textDecoration: 'none',
  } as CSSProperties,
  accent: '#ff6600',
  background: '#f6f6ef',
  topbar: '#ff6600',
};

// Apple News Style - Editorial with serif headlines
export const appleNewsStyles = {
  container: {
    backgroundColor: '#ffffff',
    color: '#1d1d1f',
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    overflow: 'hidden',
  } as CSSProperties,
  heroImage: {
    height: '160px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    position: 'relative' as const,
  } as CSSProperties,
  heroOverlay: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: '80px',
    background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
  } as CSSProperties,
  categoryBadge: {
    position: 'absolute' as const,
    top: '12px',
    left: '12px',
    backgroundColor: '#ff3b30',
    color: '#ffffff',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  } as CSSProperties,
  content: {
    padding: '20px',
  } as CSSProperties,
  headline: {
    fontFamily: 'New York, Georgia, "Times New Roman", serif',
    fontSize: '22px',
    fontWeight: 700,
    lineHeight: 1.25,
    color: '#1d1d1f',
    marginBottom: '12px',
  } as CSSProperties,
  summary: {
    color: '#6e6e73',
    fontSize: '15px',
    lineHeight: 1.5,
    marginBottom: '16px',
  } as CSSProperties,
  source: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  } as CSSProperties,
  sourceIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    backgroundColor: '#f5f5f7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 700,
    color: '#1d1d1f',
  } as CSSProperties,
  sourceName: {
    color: '#6e6e73',
    fontSize: '13px',
    fontWeight: 500,
  } as CSSProperties,
  timestamp: {
    color: '#86868b',
    fontSize: '13px',
  } as CSSProperties,
  ticker: {
    display: 'inline-block',
    color: '#0071e3',
    fontWeight: 600,
    fontSize: '13px',
  } as CSSProperties,
  tickerBullish: {
    color: '#34c759',
  } as CSSProperties,
  tickerBearish: {
    color: '#ff3b30',
  } as CSSProperties,
  footerCompact: {
    borderTop: '1px solid #f5f5f7',
    padding: '4px 12px',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  } as CSSProperties,
  footerRich: {
    borderTop: '1px solid #f5f5f7',
    padding: '12px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as CSSProperties,
  tickerPill: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    backgroundColor: '#f5f5f7',
    color: '#0071e3',
  } as CSSProperties,
  sentimentBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.02em',
  } as CSSProperties,
  sentimentBullish: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    color: '#34c759',
  } as CSSProperties,
  sentimentBearish: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    color: '#ff3b30',
  } as CSSProperties,
  sentimentNeutral: {
    backgroundColor: '#f5f5f7',
    color: '#86868b',
  } as CSSProperties,
  accent: '#ff3b30',
  link: '#0071e3',
  bullish: '#34c759',
  bearish: '#ff3b30',
};
