/**
 * Browser-native WebSocket client for the Moltbot Gateway.
 * Protocol version 3 — request/response + event streaming.
 */

// ============================================
// Protocol Types
// ============================================

export interface RequestFrame {
  type: "req";
  id: string;
  method: string;
  params?: Record<string, unknown>;
}

export interface ResponseFrame {
  type: "res";
  id: string;
  ok: boolean;
  payload?: unknown;
  error?: { code: string; message: string };
}

export interface EventFrame {
  type: "event";
  event: string;
  payload: Record<string, unknown>;
  seq: number;
}

type Frame = RequestFrame | ResponseFrame | EventFrame;

export interface ConnectParams {
  minProtocol: number;
  maxProtocol: number;
  client: {
    id: string;
    version: string;
    platform: string;
    mode: string;
  };
  caps: string[];
  auth: { token: string };
  role: string;
  scopes: string[];
}

// ============================================
// Chat Types
// ============================================

export type ChatState = "delta" | "final" | "aborted" | "error";

export interface ChatEventPayload {
  sessionKey: string;
  state: ChatState;
  message?: {
    role: string;
    content: Array<{ type: string; text?: string }>;
  };
  error?: string;
}

// ============================================
// Client Events
// ============================================

export type GatewayStatus = "disconnected" | "connecting" | "connected" | "error";

export interface GatewayClientEvents {
  onStatusChange: (status: GatewayStatus) => void;
  onChatEvent: (payload: ChatEventPayload) => void;
  onError: (error: string) => void;
}

// ============================================
// Gateway Client
// ============================================

const PROTOCOL_VERSION = 3;
const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30000;
const HEARTBEAT_INTERVAL_MS = 30000;

export class GatewayClient {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string;
  private events: GatewayClientEvents;
  private pendingRequests = new Map<string, {
    resolve: (payload: unknown) => void;
    reject: (error: Error) => void;
    timer: ReturnType<typeof setTimeout>;
  }>();
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private intentionalClose = false;
  private _status: GatewayStatus = "disconnected";
  private reqCounter = 0;
  private activeSessionKey = "main";

  constructor(url: string, token: string, events: GatewayClientEvents) {
    this.url = url;
    this.token = token;
    this.events = events;
  }

  get status(): GatewayStatus {
    return this._status;
  }

  // ---- Public API ----

  connect(): void {
    if (this.ws) return;
    this.intentionalClose = false;
    this.setStatus("connecting");

    try {
      this.ws = new WebSocket(this.url);
    } catch {
      this.setStatus("error");
      this.events.onError("Failed to create WebSocket connection");
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.handshake();
    };

    this.ws.onmessage = (ev) => {
      try {
        const frame: Frame = JSON.parse(ev.data as string);
        this.handleFrame(frame);
      } catch {
        // Ignore malformed frames
      }
    };

    this.ws.onerror = () => {
      this.events.onError("WebSocket error");
    };

    this.ws.onclose = () => {
      this.cleanup();
      if (!this.intentionalClose) {
        this.setStatus("disconnected");
        this.scheduleReconnect();
      } else {
        this.setStatus("disconnected");
      }
    };
  }

  disconnect(): void {
    this.intentionalClose = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.cleanup();
    this.setStatus("disconnected");
  }

  /** Send a chat message and return the request ACK. */
  async sendChat(message: string, sessionKey = "main"): Promise<unknown> {
    this.activeSessionKey = sessionKey;
    return this.request("chat.send", {
      sessionKey,
      message,
      idempotencyKey: crypto.randomUUID(),
    });
  }

  /** Set the active session key for filtering incoming events. */
  setSessionKey(key: string): void {
    this.activeSessionKey = key;
  }

  /** Abort an in-progress chat response. */
  async abortChat(sessionKey = "main"): Promise<unknown> {
    return this.request("chat.abort", { sessionKey });
  }

  /** Fetch chat history for a session. */
  async chatHistory(sessionKey = "main"): Promise<unknown> {
    return this.request("chat.history", { sessionKey });
  }

  // ---- Internals ----

  private async handshake(): Promise<void> {
    const params: ConnectParams = {
      minProtocol: PROTOCOL_VERSION,
      maxProtocol: PROTOCOL_VERSION,
      client: {
        id: "webchat-ui",
        version: "dev",
        platform: "web",
        mode: "webchat",
      },
      caps: [],
      auth: { token: this.token },
      role: "operator",
      scopes: ["operator.admin"],
    };

    try {
      await this.request("connect", params as unknown as Record<string, unknown>);
      this.setStatus("connected");
      this.startHeartbeat();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Handshake failed";
      this.events.onError(msg);
      this.setStatus("error");
      this.ws?.close();
    }
  }

  private request(method: string, params?: Record<string, unknown>, timeoutMs = 10000): Promise<unknown> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error("Not connected"));
        return;
      }

      const id = `r-${++this.reqCounter}-${Date.now()}`;
      const timer = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request ${method} timed out`));
      }, timeoutMs);

      this.pendingRequests.set(id, { resolve, reject, timer });

      const frame: RequestFrame = { type: "req", id, method };
      if (params) frame.params = params;

      this.ws.send(JSON.stringify(frame));
    });
  }

  private handleFrame(frame: Frame): void {
    if (frame.type === "res") {
      const pending = this.pendingRequests.get(frame.id);
      if (pending) {
        clearTimeout(pending.timer);
        this.pendingRequests.delete(frame.id);
        if (frame.ok) {
          pending.resolve(frame.payload);
        } else {
          pending.reject(new Error(frame.error?.message ?? "Request failed"));
        }
      }
      return;
    }

    if (frame.type === "event") {
      if (frame.event === "chat") {
        const chatPayload = frame.payload as unknown as ChatEventPayload;
        // Only surface events for our session — ignore Telegram/Signal/other channels
        if (chatPayload.sessionKey && chatPayload.sessionKey !== this.activeSessionKey) {
          return;
        }
        this.events.onChatEvent(chatPayload);
      }
      return;
    }
  }

  private setStatus(status: GatewayStatus): void {
    if (this._status === status) return;
    this._status = status;
    this.events.onStatusChange(status);
  }

  private scheduleReconnect(): void {
    if (this.intentionalClose) return;
    const delay = Math.min(
      RECONNECT_BASE_MS * Math.pow(2, this.reconnectAttempts),
      RECONNECT_MAX_MS
    );
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.ws = null;
      this.connect();
    }, delay);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      this.request("ping", {}).catch(() => {
        // Heartbeat failed — socket will close and trigger reconnect
      });
    }, HEARTBEAT_INTERVAL_MS);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private cleanup(): void {
    this.stopHeartbeat();
    // Reject all pending requests
    for (const [id, pending] of this.pendingRequests) {
      clearTimeout(pending.timer);
      pending.reject(new Error("Connection closed"));
    }
    this.pendingRequests.clear();
    this.ws = null;
  }
}
