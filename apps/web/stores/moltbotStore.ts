import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  GatewayClient,
  type GatewayStatus,
  type ChatEventPayload,
  type ChatState,
} from '@/lib/moltbot/gateway-client';

// ============================================
// Types
// ============================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  state: ChatState | 'sent';
}

interface MoltbotState {
  // Connection
  status: GatewayStatus;
  client: GatewayClient | null;

  // Chat
  messages: ChatMessage[];
  streamingText: string;
  isThinking: boolean;
  sessionKey: string;

  // Error
  lastError: string | null;

  // Actions
  connect: (url: string, token: string) => void;
  disconnect: () => void;
  sendMessage: (text: string) => Promise<void>;
  abortResponse: () => Promise<void>;
  clearMessages: () => void;
  setSessionKey: (key: string) => void;
}

// ============================================
// Store
// ============================================

export const useMoltbotStore = create<MoltbotState>()(
  subscribeWithSelector(
    (set, get) => ({
      // Initial state
      status: 'disconnected',
      client: null,
      messages: [],
      streamingText: '',
      isThinking: false,
      sessionKey: 'main',
      lastError: null,

      connect: (url, token) => {
        const existing = get().client;
        if (existing) existing.disconnect();

        const client = new GatewayClient(url, token, {
          onStatusChange: (status) => {
            set({ status });
          },

          onChatEvent: (payload: ChatEventPayload) => {
            const state = get();

            if (payload.state === 'delta') {
              // Gateway sends cumulative text in each delta, not incremental
              const text = payload.message?.content?.[0]?.text ?? '';
              set({
                streamingText: text,
                isThinking: false,
              });
              return;
            }

            if (payload.state === 'final') {
              const finalText = payload.message?.content?.[0]?.text ?? state.streamingText;
              const assistantMsg: ChatMessage = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: finalText,
                timestamp: Date.now(),
                state: 'final',
              };
              set({
                messages: [...state.messages, assistantMsg],
                streamingText: '',
                isThinking: false,
              });
              return;
            }

            if (payload.state === 'aborted') {
              // Commit whatever we have so far
              if (state.streamingText) {
                const abortedMsg: ChatMessage = {
                  id: crypto.randomUUID(),
                  role: 'assistant',
                  content: state.streamingText + '\n\n_(aborted)_',
                  timestamp: Date.now(),
                  state: 'aborted',
                };
                set({
                  messages: [...state.messages, abortedMsg],
                  streamingText: '',
                  isThinking: false,
                });
              } else {
                set({ streamingText: '', isThinking: false });
              }
              return;
            }

            if (payload.state === 'error') {
              set({
                lastError: payload.error ?? 'Chat error',
                streamingText: '',
                isThinking: false,
              });
            }
          },

          onError: (error) => {
            set({ lastError: error });
          },
        });

        client.connect();
        set({ client });
      },

      disconnect: () => {
        const { client } = get();
        if (client) client.disconnect();
        set({ client: null, status: 'disconnected' });
      },

      sendMessage: async (text) => {
        const { client, messages, sessionKey } = get();
        if (!client || client.status !== 'connected') return;

        const userMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'user',
          content: text,
          timestamp: Date.now(),
          state: 'sent',
        };

        set({
          messages: [...messages, userMsg],
          streamingText: '',
          isThinking: true,
          lastError: null,
        });

        try {
          await client.sendChat(text, sessionKey);
        } catch (err) {
          set({
            isThinking: false,
            lastError: err instanceof Error ? err.message : 'Failed to send message',
          });
        }
      },

      abortResponse: async () => {
        const { client, sessionKey } = get();
        if (!client) return;
        try {
          await client.abortChat(sessionKey);
        } catch {
          // Ignore abort failures
        }
      },

      clearMessages: () => set({ messages: [], streamingText: '' }),

      setSessionKey: (key) => set({ sessionKey: key }),
    })
  )
);

// ============================================
// Selectors
// ============================================

export const selectMoltbotStatus = (s: MoltbotState) => s.status;
export const selectMoltbotMessages = (s: MoltbotState) => s.messages;
export const selectIsThinking = (s: MoltbotState) => s.isThinking;
export const selectStreamingText = (s: MoltbotState) => s.streamingText;
