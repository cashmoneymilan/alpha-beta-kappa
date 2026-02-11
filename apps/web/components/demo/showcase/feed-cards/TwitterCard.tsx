'use client';

import { useState } from 'react';
import { twitterStyles as styles } from './cardStyles';
import type { FeedCardData } from './types';

interface TwitterCardProps {
  data: FeedCardData;
}

export function TwitterCard({ data }: TwitterCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const formatCount = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Parse headline for tickers and highlight them
  const renderTweetText = () => {
    let text = data.headline;
    data.tickers.forEach(ticker => {
      const regex = new RegExp(`\\$?${ticker}\\b`, 'gi');
      text = text.replace(regex, `<ticker>$${ticker}</ticker>`);
    });

    const parts = text.split(/(<ticker>.*?<\/ticker>)/);
    return parts.map((part, i) => {
      if (part.startsWith('<ticker>')) {
        const ticker = part.replace(/<\/?ticker>/g, '');
        return (
          <span key={i} style={styles.ticker}>{ticker}</span>
        );
      }
      return part;
    });
  };

  const likeCount = data.engagement?.likes || 1500;
  const viewCount = 50000;

  return (
    <div
      style={{
        ...styles.container,
        backgroundColor: isHovered ? '#080808' : '#000000',
        transition: 'background-color 0.15s ease',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main content area with avatar */}
      <div style={styles.content}>
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* Avatar */}
          <div style={styles.avatar}>
            {data.source.avatar || data.source.name.charAt(0).toUpperCase()}
          </div>

          {/* Tweet content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Header row: Name, verified, handle, time */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0, overflow: 'hidden' }}>
              <span style={styles.displayName}>{data.source.name}</span>
              {/* Verified badge */}
              <svg viewBox="0 0 22 22" width="14" height="14" style={{ flexShrink: 0 }}>
                <path
                  fill="#1d9bf0"
                  d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.706 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681.132-.637.075-1.299-.165-1.903.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"
                />
              </svg>
              <span style={styles.handle}>@{data.source.handle || data.source.name.toLowerCase().replace(/\s/g, '')}</span>
              <span style={{ ...styles.separator, flexShrink: 0 }}>·</span>
              <span style={{ ...styles.timestamp, flexShrink: 0 }}>{formatTime(data.timestamp)}</span>
            </div>

            {/* Tweet text */}
            <div style={styles.tweetText}>
              {renderTweetText()}
            </div>

            {/* Engagement metrics */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '8px',
              color: '#71767b',
              fontSize: '12px',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="#71767b">
                  <path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" />
                </svg>
                {formatCount(likeCount)}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="#71767b">
                  <path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z" />
                </svg>
                {formatCount(viewCount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
