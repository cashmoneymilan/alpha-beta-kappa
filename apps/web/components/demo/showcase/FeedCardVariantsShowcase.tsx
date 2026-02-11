'use client';

import { useState } from 'react';
import {
  TradingViewCard,
  AppleNewsCard,
} from './feed-cards';
import { ExpandedCardPanel } from './feed-cards/expanded';
import type { FeedCardData } from './feed-cards';
import { useBookmarks } from '@/lib/hooks/useBookmarks';

interface FeedCardVariantsShowcaseProps {
  themeName: string;
}

// Sample data for demonstration
const sampleArticles: FeedCardData[] = [
  {
    id: '1',
    headline: 'Fed signals potential rate cut as inflation shows signs of cooling',
    summary: 'Markets rally on dovish commentary from Fed officials suggesting September pivot is increasingly likely.',
    source: { name: 'Bloomberg', handle: 'business' },
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    tickers: ['SPY', 'QQQ', 'TLT'],
    sentiment: 'bullish',
    score: 94,
    category: 'Macro',
    engagement: { comments: 127, shares: 45, likes: 892 },
  },
  {
    id: '2',
    headline: 'NVIDIA beats earnings expectations, AI demand remains strong',
    summary: 'Data center revenue surges 171% YoY as hyperscalers increase GPU orders for AI infrastructure.',
    source: { name: 'Reuters', handle: 'reuters' },
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    tickers: ['NVDA', 'AMD', 'TSM'],
    sentiment: 'bullish',
    score: 91,
    category: 'Earnings',
    engagement: { comments: 342, shares: 156, likes: 2103 },
  },
  {
    id: '3',
    headline: 'Tesla faces headwinds in China as BYD gains market share',
    summary: 'Q3 delivery estimates may need revision as price competition intensifies in key EV market.',
    source: { name: 'Seeking Alpha', handle: 'seekingalpha' },
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    tickers: ['TSLA', 'BYDDY'],
    sentiment: 'bearish',
    score: 67,
    category: 'Analysis',
    engagement: { comments: 89, shares: 23, likes: 156 },
  },
  {
    id: '4',
    headline: 'Bitcoin ETF inflows hit record $1.2B as institutional adoption accelerates',
    summary: 'BlackRock and Fidelity lead the charge as crypto sentiment turns bullish.',
    source: { name: 'CoinDesk', handle: 'coindesk' },
    timestamp: new Date(Date.now() - 1000 * 60 * 300),
    tickers: ['BTC', 'IBIT', 'COIN'],
    sentiment: 'bullish',
    score: 85,
    category: 'Crypto',
    domain: 'coindesk.com',
    engagement: { comments: 234, shares: 89, likes: 1567 },
  },
];

// Section header component
function SectionHeader({ title, color }: { title: string; color: string }) {
  return (
    <div style={{
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: color,
      marginBottom: '16px',
      paddingBottom: '8px',
      borderBottom: `2px solid ${color}`,
      fontFamily: 'system-ui, sans-serif',
    }}>
      {title}
    </div>
  );
}

export function FeedCardVariantsShowcase({ themeName }: FeedCardVariantsShowcaseProps) {
  void themeName;

  const [selectedArticle, setSelectedArticle] = useState<FeedCardData | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const { toggle: toggleBookmark, isBookmarked, count: bookmarkCount } = useBookmarks();

  const handleCardClick = (article: FeedCardData) => {
    setSelectedArticle(article);
    setPanelOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Instructions */}
      <div style={{
        backgroundColor: '#e3f2fd',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '13px',
        color: '#1565c0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <span style={{ fontSize: '16px' }}>👆</span>
        <span><strong>Click any card</strong> to open the side panel with full article details and bookmark option</span>
      </div>

      {/* TradingView Style Feed */}
      <div>
        <SectionHeader title="TradingView Style" color="#2962ff" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sampleArticles.slice(0, 2).map((article) => (
            <TradingViewCard
              key={article.id}
              data={article}
              onClick={() => handleCardClick(article)}
            />
          ))}
        </div>
      </div>

      {/* Apple News Style Feed */}
      <div>
        <SectionHeader title="Apple News Style" color="#ff3b30" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sampleArticles.slice(2, 4).map((article) => (
            <AppleNewsCard
              key={article.id}
              data={article}
              onClick={() => handleCardClick(article)}
            />
          ))}
        </div>
      </div>

      {/* Bookmark Status */}
      {bookmarkCount > 0 && (
        <div style={{
          backgroundColor: '#fff8e1',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '13px',
          color: '#f57c00',
        }}>
          <strong>{bookmarkCount} article{bookmarkCount > 1 ? 's' : ''} bookmarked</strong>
          <span style={{ color: '#999', marginLeft: '8px' }}>(persisted in localStorage)</span>
        </div>
      )}

      {/* Summary */}
      <div style={{
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        padding: '16px',
        fontSize: '13px',
        color: '#555',
        lineHeight: 1.6,
      }}>
        <div style={{ fontWeight: 600, marginBottom: '8px', color: '#333' }}>
          Implementation Summary
        </div>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li><strong>Card Design:</strong> Clean, no footer – maximizes content visibility</li>
          <li><strong>Click Action:</strong> Opens side panel with full article</li>
          <li><strong>Bookmarks:</strong> Accessible in expanded panel, persisted to localStorage</li>
          <li><strong>Source Link:</strong> Open Source button in panel footer</li>
        </ul>
      </div>

      {/* Side Panel */}
      <ExpandedCardPanel
        data={selectedArticle}
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        onBookmark={toggleBookmark}
        isBookmarked={selectedArticle ? isBookmarked(selectedArticle.id) : false}
      />
    </div>
  );
}
