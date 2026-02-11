/// <reference lib="webworker" />

// FMP WebSocket Worker
// Handles real-time market data streaming from Financial Modeling Prep

import type { FMPWebSocketMessage } from '@/lib/fmp/types';

// Message types for communication with main thread
type IncomingMessage =
  | { type: 'CONNECT'; payload: { apiKey: string } }
  | { type: 'SUBSCRIBE'; payload: { symbols: string[] } }
  | { type: 'UNSUBSCRIBE'; payload: { symbols: string[] } }
  | { type: 'DISCONNECT' };

interface ProcessedQuote {
  type: 'QUOTE';
  data: {
    symbol: string;
    bid: number;
    ask: number;
    bidSize: number;
    askSize: number;
    lastPrice: number;
    lastSize: number;
    volume: number;
    timestamp: number;
  };
}

interface ProcessedTrade {
  type: 'TRADE';
  data: {
    symbol: string;
    price: number;
    size: number;
    timestamp: number;
  };
}

type ProcessedMessage = ProcessedQuote | ProcessedTrade;

type OutgoingMessage =
  | { type: 'BATCH_UPDATE'; payload: ProcessedMessage[] }
  | { type: 'STATUS'; payload: 'connected' | 'disconnected' | 'connecting' | 'authenticated' }
  | { type: 'ERROR'; payload: { code?: number; message: string } }
  | { type: 'SUBSCRIPTION'; payload: { symbols: string[] } };

// WebSocket state
let ws: WebSocket | null = null;
let reconnectAttempts = 0;
let apiKey: string | null = null;
let subscribedSymbols: Set<string> = new Set();

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY_BASE = 1000;
const MESSAGE_BUFFER_INTERVAL = 50; // ms

// Message buffer for batching
let messageBuffer: ProcessedMessage[] = [];
let bufferFlushTimer: number | null = null;

function postToMain(message: OutgoingMessage) {
  self.postMessage(message);
}

function flushBuffer() {
  if (messageBuffer.length > 0) {
    postToMain({ type: 'BATCH_UPDATE', payload: messageBuffer });
    messageBuffer = [];
  }
}

function startBufferFlush() {
  if (bufferFlushTimer === null) {
    bufferFlushTimer = self.setInterval(flushBuffer, MESSAGE_BUFFER_INTERVAL) as unknown as number;
  }
}

function stopBufferFlush() {
  if (bufferFlushTimer !== null) {
    clearInterval(bufferFlushTimer);
    bufferFlushTimer = null;
  }
  // Flush any remaining messages
  flushBuffer();
}

function processMessage(msg: FMPWebSocketMessage): ProcessedMessage | null {
  // FMP WebSocket message format:
  // { s: "AAPL", t: 1705123456789, lp: 185.92, ls: 100, bp: 185.90, ap: 185.94, bs: 500, as: 300, v: 52431234 }

  if (!msg.s || typeof msg.lp !== 'number') {
    return null;
  }

  // If we have bid/ask data, treat as a quote
  if (typeof msg.bp === 'number' && typeof msg.ap === 'number') {
    return {
      type: 'QUOTE',
      data: {
        symbol: msg.s,
        bid: msg.bp,
        ask: msg.ap,
        bidSize: msg.bs || 0,
        askSize: msg.as || 0,
        lastPrice: msg.lp,
        lastSize: msg.ls || 0,
        volume: msg.v || 0,
        timestamp: msg.t,
      },
    };
  }

  // Otherwise treat as a trade
  return {
    type: 'TRADE',
    data: {
      symbol: msg.s,
      price: msg.lp,
      size: msg.ls || 0,
      timestamp: msg.t,
    },
  };
}

function connect(key: string) {
  apiKey = key;
  postToMain({ type: 'STATUS', payload: 'connecting' });

  const wsUrl = `wss://websockets.financialmodelingprep.com?apiKey=${key}`;

  try {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('[FMP WS] Connected');
      postToMain({ type: 'STATUS', payload: 'connected' });
      reconnectAttempts = 0;
      startBufferFlush();

      // Resubscribe to any previously subscribed symbols
      if (subscribedSymbols.size > 0) {
        const symbols = Array.from(subscribedSymbols);
        subscribe(symbols);
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Handle array of messages
        if (Array.isArray(data)) {
          for (const msg of data) {
            const processed = processMessage(msg);
            if (processed) {
              messageBuffer.push(processed);
            }
          }
        } else if (typeof data === 'object') {
          // Handle subscription confirmation
          if (data.event === 'subscribe') {
            postToMain({
              type: 'SUBSCRIPTION',
              payload: { symbols: data.data?.ticker || [] },
            });
          }
          // Handle single message
          else if (data.s) {
            const processed = processMessage(data);
            if (processed) {
              messageBuffer.push(processed);
            }
          }
        }
      } catch (error) {
        console.error('[FMP WS] Error parsing message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('[FMP WS] Error:', error);
      postToMain({ type: 'ERROR', payload: { message: 'WebSocket connection error' } });
    };

    ws.onclose = (event) => {
      console.log('[FMP WS] Closed:', event.code, event.reason);
      stopBufferFlush();
      postToMain({ type: 'STATUS', payload: 'disconnected' });

      // Attempt reconnection with exponential backoff
      if (apiKey && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        const delay = RECONNECT_DELAY_BASE * Math.pow(2, reconnectAttempts);
        reconnectAttempts++;
        console.log(`[FMP WS] Reconnecting in ${delay}ms (attempt ${reconnectAttempts})`);
        setTimeout(() => {
          if (apiKey) {
            connect(apiKey);
          }
        }, delay);
      } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        postToMain({
          type: 'ERROR',
          payload: { message: 'Max reconnection attempts reached' },
        });
      }
    };
  } catch (error) {
    postToMain({
      type: 'ERROR',
      payload: { message: error instanceof Error ? error.message : 'Failed to connect' },
    });
  }
}

function subscribe(symbols: string[]) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.warn('[FMP WS] Not connected, cannot subscribe');
    return;
  }

  const upperSymbols = symbols.map(s => s.toUpperCase());

  // Add to tracked subscriptions
  for (const symbol of upperSymbols) {
    subscribedSymbols.add(symbol);
  }

  // FMP subscription format
  const message = JSON.stringify({
    event: 'subscribe',
    data: {
      ticker: upperSymbols,
    },
  });

  ws.send(message);
  console.log('[FMP WS] Subscribed to:', upperSymbols);
}

function unsubscribe(symbols: string[]) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    return;
  }

  const upperSymbols = symbols.map(s => s.toUpperCase());

  // Remove from tracked subscriptions
  for (const symbol of upperSymbols) {
    subscribedSymbols.delete(symbol);
  }

  // FMP unsubscription format
  const message = JSON.stringify({
    event: 'unsubscribe',
    data: {
      ticker: upperSymbols,
    },
  });

  ws.send(message);
  console.log('[FMP WS] Unsubscribed from:', upperSymbols);
}

function disconnect() {
  apiKey = null;
  reconnectAttempts = MAX_RECONNECT_ATTEMPTS; // Prevent reconnection
  stopBufferFlush();

  if (ws) {
    ws.close();
    ws = null;
  }

  subscribedSymbols.clear();
}

// Handle messages from main thread
self.onmessage = (event: MessageEvent<IncomingMessage>) => {
  const message = event.data;

  switch (message.type) {
    case 'CONNECT':
      connect(message.payload.apiKey);
      break;
    case 'SUBSCRIBE':
      subscribe(message.payload.symbols);
      break;
    case 'UNSUBSCRIBE':
      unsubscribe(message.payload.symbols);
      break;
    case 'DISCONNECT':
      disconnect();
      break;
  }
};

// Export for TypeScript - this file runs in worker context
export {};
