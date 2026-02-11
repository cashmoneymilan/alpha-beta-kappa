'use client';

import { useState } from 'react';
import { hackerNewsStyles as styles } from './cardStyles';
import type { FeedCardData } from './types';

interface HackerNewsCardProps {
  data: FeedCardData;
  rank?: number;
}

export function HackerNewsCard({ data, rank = 1 }: HackerNewsCardProps) {
  const [upvoted, setUpvoted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const basePoints = data.engagement?.points || data.score || 127;
  const displayPoints = upvoted ? basePoints + 1 : basePoints;

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'just now';
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return days === 1 ? '1 day ago' : `${days} days ago`;
  };

  const getDomain = () => {
    if (data.domain) return data.domain;
    // Generate domain from source name
    return `${data.source.name.toLowerCase().replace(/\s/g, '')}.com`;
  };

  return (
    <div
      style={{
        ...styles.container,
        backgroundColor: isHovered ? '#f0f0e8' : styles.background,
        transition: 'background-color 0.1s ease',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main row */}
      <div style={styles.row}>
        <span style={styles.rank}>{rank}.</span>
        <button
          onClick={() => setUpvoted(!upvoted)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            fontSize: '10pt',
            lineHeight: 1,
            marginRight: '4px',
          }}
        >
          <span style={upvoted ? styles.upvoteActive : styles.upvote}>
            {'\u25B2'}
          </span>
        </button>
        <span>
          <a
            href="#"
            style={styles.headline}
            onClick={(e) => e.preventDefault()}
          >
            {data.headline}
          </a>
          <span style={styles.domain}>
            ({getDomain()})
          </span>
        </span>
      </div>

      {/* Subtext row */}
      <div style={styles.subtext}>
        <span style={styles.points}>{displayPoints} points</span>
        {' by '}
        <a
          href="#"
          style={styles.user}
          onClick={(e) => e.preventDefault()}
        >
          {data.source.handle || data.source.name.toLowerCase().replace(/\s/g, '')}
        </a>
        {' '}
        <span>{formatTime(data.timestamp)}</span>
        {' | '}
        <a
          href="#"
          style={styles.link}
          onClick={(e) => e.preventDefault()}
        >
          hide
        </a>
        {' | '}
        <a
          href="#"
          style={styles.link}
          onClick={(e) => e.preventDefault()}
        >
          {data.engagement?.comments || 73} comments
        </a>
        {data.tickers.length > 0 && (
          <>
            {' | '}
            <span style={{ color: styles.accent, fontWeight: 700 }}>
              {data.tickers.map(t => `$${t}`).join(' ')}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
