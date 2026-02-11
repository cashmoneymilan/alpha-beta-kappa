'use client';

import * as React from 'react';
import {
  Send,
  Square,
  Wifi,
  WifiOff,
  Bot,
  User,
  Loader2,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import type { Tile } from '@/stores/workspace';
import { useMoltbotStore } from '@/stores/moltbotStore';
import type { ChatMessage } from '@/stores/moltbotStore';
import { cn } from '@/lib/utils';

// ============================================
// Constants
// ============================================

const QUICK_ACTIONS = [
  { label: 'Portfolio', message: "What's my portfolio?" },
  { label: 'Positions', message: 'Show my positions' },
  { label: 'Market', message: 'Is the market open?' },
  { label: 'Orders', message: 'Show my open orders' },
] as const;

const GATEWAY_URL =
  process.env.NEXT_PUBLIC_MOLTBOT_GATEWAY_URL || 'ws://127.0.0.1:18789';
const GATEWAY_TOKEN =
  process.env.NEXT_PUBLIC_MOLTBOT_GATEWAY_TOKEN || '';

// ============================================
// Status Indicator
// ============================================

function StatusDot({ status }: { status: string }) {
  const color =
    status === 'connected'
      ? 'bg-emerald-500'
      : status === 'connecting'
        ? 'bg-amber-400 animate-pulse'
        : 'bg-red-500';

  return (
    <span className="relative flex h-2 w-2">
      {status === 'connected' && (
        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40 animate-ping" />
      )}
      <span className={cn('relative inline-flex h-2 w-2 rounded-full', color)} />
    </span>
  );
}

// ============================================
// Message Bubble
// ============================================

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';

  return (
    <div className={cn('flex gap-1.5 px-2', isUser ? 'justify-end' : 'justify-start')}>
      {/* Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-5 h-5 rounded bg-primary/20 flex items-center justify-center mt-0.5">
          <Bot className="h-3 w-3 text-primary" />
        </div>
      )}

      {/* Bubble */}
      <div
        className={cn(
          'max-w-[85%] rounded px-2.5 py-1.5 text-xs leading-relaxed break-words',
          isUser
            ? 'bg-primary/20 text-foreground border border-primary/30'
            : 'bg-muted/60 text-foreground border border-border/50'
        )}
      >
        <pre className="font-mono text-[11px] whitespace-pre-wrap break-words m-0 p-0 bg-transparent border-none">
          {msg.content}
        </pre>
        <div
          className={cn(
            'text-[9px] mt-1 tabular-nums',
            isUser ? 'text-primary/50 text-right' : 'text-muted-foreground/50'
          )}
        >
          {new Date(msg.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="flex-shrink-0 w-5 h-5 rounded bg-muted flex items-center justify-center mt-0.5">
          <User className="h-3 w-3 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

// ============================================
// Streaming Indicator
// ============================================

function StreamingBubble({ text }: { text: string }) {
  return (
    <div className="flex gap-1.5 px-2 justify-start">
      <div className="flex-shrink-0 w-5 h-5 rounded bg-primary/20 flex items-center justify-center mt-0.5">
        <Bot className="h-3 w-3 text-primary" />
      </div>
      <div className="max-w-[85%] rounded px-2.5 py-1.5 bg-muted/60 border border-border/50">
        <pre className="font-mono text-[11px] whitespace-pre-wrap break-words m-0 p-0 bg-transparent border-none text-foreground">
          {text}
          <span className="inline-block w-1.5 h-3.5 bg-primary/70 ml-px animate-pulse" />
        </pre>
      </div>
    </div>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex gap-1.5 px-2 justify-start">
      <div className="flex-shrink-0 w-5 h-5 rounded bg-primary/20 flex items-center justify-center mt-0.5">
        <Bot className="h-3 w-3 text-primary" />
      </div>
      <div className="rounded px-2.5 py-2 bg-muted/60 border border-border/50 flex items-center gap-1.5">
        <span className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1 h-1 rounded-full bg-primary/60"
              style={{
                animation: 'pulse 1.4s ease-in-out infinite',
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </span>
        <span className="text-[10px] text-muted-foreground font-mono">thinking</span>
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

interface MoltbotTileProps {
  tile: Tile;
}

export function MoltbotTile({ tile }: MoltbotTileProps) {
  const status = useMoltbotStore((s) => s.status);
  const messages = useMoltbotStore((s) => s.messages);
  const streamingText = useMoltbotStore((s) => s.streamingText);
  const isThinking = useMoltbotStore((s) => s.isThinking);
  const lastError = useMoltbotStore((s) => s.lastError);
  const connect = useMoltbotStore((s) => s.connect);
  const disconnect = useMoltbotStore((s) => s.disconnect);
  const sendMessage = useMoltbotStore((s) => s.sendMessage);
  const abortResponse = useMoltbotStore((s) => s.abortResponse);
  const clearMessages = useMoltbotStore((s) => s.clearMessages);

  const [input, setInput] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Auto-connect on mount
  React.useEffect(() => {
    if (status === 'disconnected' && GATEWAY_TOKEN) {
      connect(GATEWAY_URL, GATEWAY_TOKEN);
    }
    return () => {
      // Don't disconnect on unmount — keep connection alive
      // across tile close/reopen
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to bottom
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText, isThinking]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || status !== 'connected') return;
    sendMessage(text);
    setInput('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (message: string) => {
    if (status !== 'connected') return;
    sendMessage(message);
  };

  const isStreaming = streamingText.length > 0 || isThinking;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ---- Header Bar ---- */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <StatusDot status={status} />
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Moltbot
          </span>
          <span className="text-[9px] font-mono text-muted-foreground/50">
            {status}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Reconnect */}
          {(status === 'disconnected' || status === 'error') && (
            <button
              onClick={() => connect(GATEWAY_URL, GATEWAY_TOKEN)}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Reconnect"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          )}
          {/* Clear */}
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Clear messages"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
          {/* Connection icon */}
          {status === 'connected' ? (
            <Wifi className="h-3 w-3 text-emerald-500/70" />
          ) : (
            <WifiOff className="h-3 w-3 text-muted-foreground/40" />
          )}
        </div>
      </div>

      {/* ---- Error Banner ---- */}
      {lastError && (
        <div className="px-3 py-1 bg-destructive/10 border-b border-destructive/20">
          <span className="text-[10px] font-mono text-destructive">{lastError}</span>
        </div>
      )}

      {/* ---- Messages ---- */}
      <div className="flex-1 overflow-y-auto py-2 space-y-2">
        {messages.length === 0 && !isStreaming && (
          <div className="h-full flex flex-col items-center justify-center gap-3 px-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary/60" />
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                {status === 'connected'
                  ? 'Connected. Ask me anything.'
                  : status === 'connecting'
                    ? 'Connecting to gateway...'
                    : 'Disconnected from gateway'}
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}

        {isThinking && !streamingText && <ThinkingIndicator />}
        {streamingText && <StreamingBubble text={streamingText} />}

        <div ref={messagesEndRef} />
      </div>

      {/* ---- Quick Actions ---- */}
      {messages.length === 0 && status === 'connected' && (
        <div className="px-2 py-1.5 border-t border-border/50 flex flex-wrap gap-1">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              onClick={() => handleQuickAction(action.message)}
              className={cn(
                'px-2 py-0.5 rounded-full text-[10px] font-mono',
                'border border-border/60 text-muted-foreground',
                'hover:border-primary/40 hover:text-primary hover:bg-primary/5',
                'transition-colors cursor-pointer'
              )}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* ---- Input ---- */}
      <div className="px-2 py-1.5 border-t border-border">
        <div className="flex items-center gap-1.5">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              status === 'connected'
                ? 'Message Moltbot...'
                : 'Not connected'
            }
            disabled={status !== 'connected'}
            className={cn(
              'flex-1 bg-transparent text-xs font-mono py-1.5 px-2 rounded',
              'border border-border/50 placeholder:text-muted-foreground/40',
              'focus:outline-none focus:border-primary/40',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              'text-foreground'
            )}
          />

          {isStreaming ? (
            <button
              onClick={() => abortResponse()}
              className="p-1.5 rounded bg-destructive/20 hover:bg-destructive/30 text-destructive transition-colors"
              title="Stop"
            >
              <Square className="h-3 w-3" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim() || status !== 'connected'}
              className={cn(
                'p-1.5 rounded transition-colors',
                input.trim() && status === 'connected'
                  ? 'bg-primary/20 hover:bg-primary/30 text-primary'
                  : 'text-muted-foreground/30 cursor-not-allowed'
              )}
              title="Send"
            >
              <Send className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
