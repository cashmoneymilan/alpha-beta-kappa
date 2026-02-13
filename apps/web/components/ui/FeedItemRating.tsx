'use client';

import * as React from 'react';
import { useState } from 'react';
import { ThumbsUp, ThumbsDown, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRatings, type RatingTag } from '@/lib/hooks/useRatings';

interface FeedItemRatingProps {
  itemId: string;
  compact?: boolean;
  className?: string;
}

const RATING_TAGS: { value: RatingTag; label: string; emoji: string }[] = [
  { value: 'actionable', label: 'Actionable', emoji: '🎯' },
  { value: 'noise', label: 'Noise', emoji: '📢' },
  { value: 'already_knew', label: 'Already knew', emoji: '💡' },
  { value: 'too_late', label: 'Too late', emoji: '⏰' },
];

export function FeedItemRating({ itemId, compact = false, className }: FeedItemRatingProps) {
  const { thumbsUp, thumbsDown, isRatedUp, isRatedDown, toggleTag, hasTag, getRating } = useRatings();
  const [showTags, setShowTags] = useState(false);

  const rating = getRating(itemId);
  const hasRating = rating !== null && rating.value !== null;

  // Compact mode: just thumbs buttons
  if (compact) {
    return (
      <div className={cn('flex items-center gap-0.5', className)}>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            thumbsUp(itemId);
          }}
          className={cn(
            'h-6 w-6',
            isRatedUp(itemId)
              ? 'text-green-400 bg-green-400/20 hover:bg-green-400/30'
              : 'text-muted-foreground hover:text-green-400'
          )}
        >
          <ThumbsUp className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            thumbsDown(itemId);
          }}
          className={cn(
            'h-6 w-6',
            isRatedDown(itemId)
              ? 'text-red-400 bg-red-400/20 hover:bg-red-400/30'
              : 'text-muted-foreground hover:text-red-400'
          )}
        >
          <ThumbsDown className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  // Full mode: thumbs + expandable tags
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <Button
          variant={isRatedUp(itemId) ? 'default' : 'outline'}
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            thumbsUp(itemId);
          }}
          className={cn(
            'h-8',
            isRatedUp(itemId) && 'bg-green-600 hover:bg-green-700 text-white'
          )}
        >
          <ThumbsUp className="h-3.5 w-3.5 mr-1" />
          Useful
        </Button>
        <Button
          variant={isRatedDown(itemId) ? 'default' : 'outline'}
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            thumbsDown(itemId);
          }}
          className={cn(
            'h-8',
            isRatedDown(itemId) && 'bg-red-600 hover:bg-red-700 text-white'
          )}
        >
          <ThumbsDown className="h-3.5 w-3.5 mr-1" />
          Not useful
        </Button>

        {hasRating && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowTags(!showTags);
            }}
            className="h-8 text-muted-foreground"
          >
            {showTags ? (
              <>
                <ChevronUp className="h-3.5 w-3.5 mr-1" />
                Hide tags
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5 mr-1" />
                Add tags
              </>
            )}
          </Button>
        )}
      </div>

      {/* Expandable tags */}
      {hasRating && showTags && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {RATING_TAGS.map(({ value, label, emoji }) => (
            <Badge
              key={value}
              variant={hasTag(itemId, value) ? 'filled' : 'secondary'}
              className={cn(
                'cursor-pointer transition-colors',
                hasTag(itemId, value)
                  ? 'bg-primary text-primary-foreground hover:bg-primary/80'
                  : 'hover:bg-muted'
              )}
              onClick={(e) => {
                e.stopPropagation();
                toggleTag(itemId, value);
              }}
            >
              <span className="mr-1">{emoji}</span>
              {label}
            </Badge>
          ))}
        </div>
      )}

      {/* Show selected tags count */}
      {hasRating && !showTags && rating.tags && rating.tags.length > 0 && (
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span>{rating.tags.length} tag{rating.tags.length !== 1 ? 's' : ''} selected</span>
        </div>
      )}
    </div>
  );
}
