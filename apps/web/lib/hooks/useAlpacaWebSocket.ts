'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useMarketDataStore } from '@/stores/marketDataStore';
import { API_ROUTES } from '@/config/constants';

interface WebSocketCredentials {
  apiKey: string;
  apiSecret: string;
  paper: boolean;
}

interface WorkerMessage {
  type: 'BATCH_UPDATE' | 'STATUS' | 'ERROR' | 'SUBSCRIPTION';
  payload: unknown;
}

interface BatchItem {
  type: 'QUOTE' | 'TRADE' | 'BAR';
  data: {
    symbol: string;
    bid?: number;
    ask?: number;
    bidSize?: number;
    askSize?: number;
    price?: number;
    size?: number;
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    volume?: number;
    timestamp: number;
  };
}

export function useAlpacaWebSocket() {
  const workerRef = useRef<Worker | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    updateQuote,
    addTrade,
    addBar,
    batchUpdateQuotes,
    batchAddTrades,
    setConnectionStatus,
  } = useMarketDataStore();

  // Initialize worker
  useEffect(() => {
    // Create worker
    workerRef.current = new Worker(
      new URL('../../workers/websocket.worker.ts', import.meta.url)
    );

    // Handle messages from worker
    workerRef.current.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const { type, payload } = event.data;

      switch (type) {
        case 'BATCH_UPDATE': {
          const items = payload as BatchItem[];
          const quotes: Parameters<typeof updateQuote>[0][] = [];
          const trades: Parameters<typeof addTrade>[0][] = [];

          for (const item of items) {
            if (item.type === 'QUOTE' && item.data.bid !== undefined) {
              quotes.push({
                symbol: item.data.symbol,
                bid: item.data.bid,
                ask: item.data.ask!,
                bidSize: item.data.bidSize!,
                askSize: item.data.askSize!,
                timestamp: item.data.timestamp,
              });
            } else if (item.type === 'TRADE' && item.data.price !== undefined) {
              trades.push({
                symbol: item.data.symbol,
                price: item.data.price,
                size: item.data.size!,
                timestamp: item.data.timestamp,
              });
            } else if (item.type === 'BAR' && item.data.open !== undefined) {
              addBar({
                symbol: item.data.symbol,
                open: item.data.open,
                high: item.data.high!,
                low: item.data.low!,
                close: item.data.close!,
                volume: item.data.volume!,
                timestamp: item.data.timestamp,
              });
            }
          }

          // Batch update quotes and trades
          if (quotes.length > 0) {
            batchUpdateQuotes(quotes);
          }
          if (trades.length > 0) {
            batchAddTrades(trades);
          }
          break;
        }

        case 'STATUS': {
          const status = payload as string;
          if (status === 'connected' || status === 'authenticated') {
            setIsConnected(true);
            setConnectionStatus('connected');
            setError(null);
          } else if (status === 'disconnected') {
            setIsConnected(false);
            setConnectionStatus('disconnected');
          } else if (status === 'connecting') {
            setConnectionStatus('connecting');
          }
          break;
        }

        case 'ERROR': {
          const err = payload as { code?: number; message: string };
          setError(err.message);
          setConnectionStatus('error');
          break;
        }

        case 'SUBSCRIPTION': {
          // Could track subscribed symbols here if needed
          console.log('Subscription update:', payload);
          break;
        }
      }
    };

    // Fetch credentials and connect
    const connectToWebSocket = async () => {
      try {
        const response = await fetch(API_ROUTES.WS_CREDENTIALS);
        if (!response.ok) {
          throw new Error('Failed to fetch WebSocket credentials');
        }
        const credentials: WebSocketCredentials = await response.json();

        workerRef.current?.postMessage({
          type: 'CONNECT',
          payload: credentials,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to connect');
        setConnectionStatus('error');
      }
    };

    connectToWebSocket();

    // Cleanup on unmount
    return () => {
      workerRef.current?.postMessage({ type: 'DISCONNECT' });
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, [addBar, batchAddTrades, batchUpdateQuotes, setConnectionStatus]);

  // Subscribe to symbols
  const subscribe = useCallback(
    (symbols: string[], channels: string[] = ['quotes', 'trades']) => {
      if (!workerRef.current) return;

      const upperSymbols = symbols.map((s) => s.toUpperCase());
      workerRef.current.postMessage({
        type: 'SUBSCRIBE',
        payload: { symbols: upperSymbols, channels },
      });

      // Also add to store's subscribed symbols
      const { addSymbol } = useMarketDataStore.getState();
      for (const symbol of upperSymbols) {
        addSymbol(symbol);
      }
    },
    []
  );

  // Unsubscribe from symbols
  const unsubscribe = useCallback(
    (symbols: string[], channels: string[] = ['quotes', 'trades']) => {
      if (!workerRef.current) return;

      const upperSymbols = symbols.map((s) => s.toUpperCase());
      workerRef.current.postMessage({
        type: 'UNSUBSCRIBE',
        payload: { symbols: upperSymbols, channels },
      });

      // Also remove from store's subscribed symbols
      const { removeSymbol } = useMarketDataStore.getState();
      for (const symbol of upperSymbols) {
        removeSymbol(symbol);
      }
    },
    []
  );

  // Disconnect
  const disconnect = useCallback(() => {
    workerRef.current?.postMessage({ type: 'DISCONNECT' });
  }, []);

  // Reconnect
  const reconnect = useCallback(async () => {
    try {
      const response = await fetch(API_ROUTES.WS_CREDENTIALS);
      if (!response.ok) {
        throw new Error('Failed to fetch WebSocket credentials');
      }
      const credentials: WebSocketCredentials = await response.json();

      workerRef.current?.postMessage({
        type: 'CONNECT',
        payload: credentials,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reconnect');
    }
  }, []);

  return {
    isConnected,
    error,
    subscribe,
    unsubscribe,
    disconnect,
    reconnect,
  };
}
