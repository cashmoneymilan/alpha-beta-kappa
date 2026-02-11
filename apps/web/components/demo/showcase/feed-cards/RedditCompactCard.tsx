'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown, MessageSquare } from 'lucide-react';
import { redditStyles as styles } from './cardStyles';
import type { FeedCardData } from './types';

interface RedditCompactCardProps {
  data: FeedCardData;
}

export function RedditCompactCard({ data }: RedditCompactCardProps) {
  const [vote, setVote] = useState<'up' | 'down' | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const baseScore = data.engagement?.points || data.score || 127;
  const displayScore = vote === 'up' ? baseScore + 1 : vote === 'down' ? baseScore - 1 : baseScore;

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'just now';
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <div
      style={{
        ...styles.container,
        backgroundColor: isHovered ? '#222223' : '#1a1a1b',
        transition: 'background-color 0.1s ease',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.row}>
        {/* Vote buttons */}
        <div style={styles.votes}>
          <button
            onClick={() => setVote(vote === 'up' ? null : 'up')}
            style={{
              background: 'none',
              border: 'none',
              padding: '2px',
              cursor: 'pointer',
              display: 'flex',
            }}
          >
            <ChevronUp
              size={20}
              style={vote === 'up' ? styles.upvoteActive : styles.upvote}
            />
          </button>
          <span style={{
            ...styles.score,
            color: vote === 'up' ? styles.upvoteColor
                 : vote === 'down' ? styles.downvoteColor
                 : '#d7dadc',
          }}>
            {displayScore}
          </span>
          <button
            onClick={() => setVote(vote === 'down' ? null : 'down')}
            style={{
              background: 'none',
              border: 'none',
              padding: '2px',
              cursor: 'pointer',
              display: 'flex',
            }}
          >
            <ChevronDown
              size={20}
              style={vote === 'down' ? styles.downvoteActive : styles.downvote}
            />
          </button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          <div style={styles.headline}>
            {data.headline}
            {data.tickers.length > 0 && (
              <span style={{ marginLeft: '6px' }}>
                {data.tickers.map(t => (
                  <span key={t} style={styles.ticker}> ${t}</span>
                ))}
              </span>
            )}
          </div>
          <div style={{ ...styles.meta, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={styles.subreddit}>r/wallstreetbets</span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <MessageSquare size={12} />
              {data.engagement?.comments || 42}
            </span>
            <span>•</span>
            <span>{formatTime(data.timestamp)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
