/// <reference lib="webworker" />

import type {
  AlpacaStreamMessage,
  AlpacaStreamQuote,
  AlpacaStreamTrade,
  AlpacaStreamBar,
} from '@/types/alpaca';

// Message types for communication with main thread
type IncomingMessage =
  | { type: 'CONNECT'; payload: { apiKey: string; apiSecret: string; paper: boolean } }
  | { type: 'SUBSCRIBE'; payload: { symbols: string[]; channels: string[] } }
  | { type: 'UNSUBSCRIBE'; payload: { symbols: string[]; channels: string[] } }
  | { type: 'DISCONNECT' };

interface ProcessedQuote {
  type: 'QUOTE';
  data: {
    symbol: string;
    bid: number;
    ask: number;
    bidSize: number;
    askSize: number;
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

interface ProcessedBar {
  type: 'BAR';
  data: {
    symbol: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    timestamp: number;
  };
}

type ProcessedMessage = ProcessedQuote | ProcessedTrade | ProcessedBar;

type OutgoingMessage =
  | { type: 'BATCH_UPDATE'; payload: ProcessedMessage[] }
  | { type: 'STATUS'; payload: 'connected' | 'disconnected' | 'connecting' | 'authenticated' }
  | { type: 'ERROR'; payload: { code?: number; message: string } }
  | { type: 'SUBSCRIPTION'; payload: { trades: string[]; quotes: string[]; bars: string[] } };

// WebSocket state
let ws: WebSocket | null = null;
let reconnectAttempts = 0;
let connectionConfig: { apiKey: string; apiSecret: string; paper: boolean } | null = null;

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

function processQuote(msg: AlpacaStreamQuote): ProcessedQuote {
  return {
    type: 'QUOTE',
    data: {
      symbol: msg.S,
      bid: msg.bp,
      ask: msg.ap,
      bidSize: msg.bs,
      askSize: msg.as,
      timestamp: new Date(msg.t).getTime(),
    },
  };
}

function processTrade(msg: AlpacaStreamTrade): ProcessedTrade {
  return {
    type: 'TRADE',
    data: {
      symbol: msg.S,
      price: msg.p,
      size: msg.s,
      timestamp: new Date(msg.t).getTime(),
    },
  };
}

function processBar(msg: AlpacaStreamBar): ProcessedBar {
  return {
    type: 'BAR',
    data: {
      symbol: msg.S,
      open: msg.o,
      high: msg.h,
      low: msg.l,
      close: msg.c,
      volume: msg.v,
      timestamp: new Date(msg.t).getTime(),
    },
  };
}

function connect(config: { apiKey: string; apiSecret: string; paper: boolean }) {
  connectionConfig = config;
  postToMain({ type: 'STATUS', payload: 'connecting' });

  const baseUrl = config.paper
    ? 'wss://stream.data.sandbox.alpaca.markets/v2/iex'
    : 'wss://stream.data.alpaca.markets/v2/iex';

  try {
    ws = new WebSocket(baseUrl);

    ws.onopen = () => {
      // Authenticate immediately after connection
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            action: 'auth',
            key: config.apiKey,
            secret: config.apiSecret,
          })
        );
      }
      reconnectAttempts = 0;
    };

    ws.onmessage = (event) => {
      try {
        const messages = JSON.parse(event.data) as AlpacaStreamMessage[];

        for (const msg of messages) {
          switch (msg.T) {
            case 'success':
              if (msg.msg === 'authenticated') {
                postToMain({ type: 'STATUS', payload: 'authenticated' });
              }
              postToMain({ type: 'STATUS', payload: 'connected' });
              startBufferFlush();
              break;

            case 'error':
              postToMain({
                type: 'ERROR',
                payload: { code: msg.code, message: msg.msg },
              });
              break;

            case 'subscription':
              postToMain({
                type: 'SUBSCRIPTION',
                payload: {
                  trades: msg.trades,
                  quotes: msg.quotes,
                  bars: msg.bars,
                },
              });
              break;

            case 'q':
              messageBuffer.push(processQuote(msg as AlpacaStreamQuote));
              break;

            case 't':
              messageBuffer.push(processTrade(msg as AlpacaStreamTrade));
              break;

            case 'b':
              messageBuffer.push(processBar(msg as AlpacaStreamBar));
              break;
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = () => {
      postToMain({ type: 'ERROR', payload: { message: 'WebSocket connection error' } });
    };

    ws.onclose = (event) => {
      stopBufferFlush();
      postToMain({ type: 'STATUS', payload: 'disconnected' });

      // Attempt reconnection with exponential backoff
      if (connectionConfig && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        const delay = RECONNECT_DELAY_BASE * Math.pow(2, reconnectAttempts);
        reconnectAttempts++;
        console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts})`);
        setTimeout(() => {
          if (connectionConfig) {
            connect(connectionConfig);
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

function subscribe(symbols: string[], channels: string[]) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.warn('WebSocket not connected, cannot subscribe');
    return;
  }

  const subscription: { action: string; trades?: string[]; quotes?: string[]; bars?: string[] } = {
    action: 'subscribe',
  };

  if (channels.includes('trades')) {
    subscription.trades = symbols;
  }
  if (channels.includes('quotes')) {
    subscription.quotes = symbols;
  }
  if (channels.includes('bars')) {
    subscription.bars = symbols;
  }

  ws.send(JSON.stringify(subscription));
}

function unsubscribe(symbols: string[], channels: string[]) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    return;
  }

  const unsubscription: { action: string; trades?: string[]; quotes?: string[]; bars?: string[] } = {
    action: 'unsubscribe',
  };

  if (channels.includes('trades')) {
    unsubscription.trades = symbols;
  }
  if (channels.includes('quotes')) {
    unsubscription.quotes = symbols;
  }
  if (channels.includes('bars')) {
    unsubscription.bars = symbols;
  }

  ws.send(JSON.stringify(unsubscription));
}

function disconnect() {
  connectionConfig = null;
  reconnectAttempts = MAX_RECONNECT_ATTEMPTS; // Prevent reconnection
  stopBufferFlush();

  if (ws) {
    ws.close();
    ws = null;
  }
}

// Handle messages from main thread
self.onmessage = (event: MessageEvent<IncomingMessage>) => {
  const message = event.data;

  switch (message.type) {
    case 'CONNECT':
      connect(message.payload);
      break;
    case 'SUBSCRIBE':
      subscribe(message.payload.symbols, message.payload.channels);
      break;
    case 'UNSUBSCRIBE':
      unsubscribe(message.payload.symbols, message.payload.channels);
      break;
    case 'DISCONNECT':
      disconnect();
      break;
  }
};

// Export for TypeScript - this file runs in worker context
export {};
