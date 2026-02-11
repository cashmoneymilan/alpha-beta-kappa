import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AlertType = 'price_above' | 'price_below' | 'mention_spike' | 'momentum_shift' | 'key_source' | 'smart_money' | 'compound';

export interface PriceAlert {
  id: string;
  symbol: string;
  type: 'price_above' | 'price_below';
  targetPrice: number;
  createdAt: Date;
  triggered: boolean;
  triggeredAt?: Date;
  acknowledged: boolean;
}

export interface NarrativeAlert {
  id: string;
  type: 'mention_spike' | 'momentum_shift' | 'key_source' | 'smart_money' | 'compound';
  target: string;
  targetType: 'ticker' | 'theme' | 'source';
  explanation: string;
  time: Date;
  acknowledged: boolean;
  // Smart money specific fields
  sourceId?: string;
  sourceHandle?: string;
  sentiment?: 'bullish' | 'bearish' | 'neutral';
  hitRate?: number;
  // Compound alert fields
  ruleId?: string;
  matchedConditions?: string[];
}

export type Alert = PriceAlert | NarrativeAlert;

// Compound condition types
export type ConditionType = 'ticker' | 'sentiment' | 'price' | 'score' | 'source_accuracy' | 'mention_velocity';
export type ConditionOperator = 'equals' | 'above' | 'below' | 'contains';

export interface AlertCondition {
  id: string;
  type: ConditionType;
  operator: ConditionOperator;
  value: string | number;
}

export interface CompoundAlertRule {
  id: string;
  name: string;
  enabled: boolean;
  conditions: AlertCondition[];
  logic: 'AND' | 'OR';
  // Notification settings
  browserNotify: boolean;
  emailNotify: boolean;
  email?: string;
  createdAt: Date;
  lastTriggeredAt?: Date;
  triggerCount: number;
}

// Alert template definition
export interface AlertTemplate {
  id: string;
  name: string;
  description: string;
  conditions: Omit<AlertCondition, 'id'>[];
  logic: 'AND' | 'OR';
}

// Smart money source configuration
export interface SmartMoneySource {
  id: string;
  handle: string;
  name: string;
  minHitRate: number; // Minimum hit rate to trigger (e.g., 60 = 60%)
  enabled: boolean;
  addedAt: Date;
}

// Smart money alert rule
export interface SmartMoneyRule {
  id: string;
  name: string;
  enabled: boolean;
  // Conditions
  minHitRate: number; // e.g., 60 means sources with 60%+ hit rate
  minAlphaScore: number; // e.g., 70 means sources with alpha score 70+
  watchlistOnly: boolean; // Only alert for tickers in watchlist
  sentimentFilter: 'all' | 'bullish' | 'bearish'; // Filter by sentiment
  // Notification settings
  browserNotify: boolean;
  emailNotify: boolean;
  createdAt: Date;
}

interface AlertsState {
  // Price alerts
  priceAlerts: PriceAlert[];

  // Narrative alerts (existing functionality)
  narrativeAlerts: NarrativeAlert[];

  // Smart money configuration
  smartMoneyRules: SmartMoneyRule[];
  watchlist: string[]; // Tickers to watch for smart money alerts

  // Compound alert rules
  compoundRules: CompoundAlertRule[];

  // User email for notifications
  userEmail: string | null;

  // Notification permission
  notificationPermission: NotificationPermission | 'default';

  // Actions - Price Alerts
  addPriceAlert: (symbol: string, type: 'price_above' | 'price_below', targetPrice: number) => void;
  removePriceAlert: (id: string) => void;
  triggerPriceAlert: (id: string) => void;
  acknowledgePriceAlert: (id: string) => void;

  // Actions - Narrative Alerts
  addNarrativeAlert: (alert: Omit<NarrativeAlert, 'id' | 'acknowledged'>) => void;
  acknowledgeNarrativeAlert: (id: string) => void;
  dismissNarrativeAlert: (id: string) => void;

  // Actions - Smart Money
  addSmartMoneyRule: (rule: Omit<SmartMoneyRule, 'id' | 'createdAt'>) => void;
  updateSmartMoneyRule: (id: string, updates: Partial<SmartMoneyRule>) => void;
  removeSmartMoneyRule: (id: string) => void;
  addToWatchlist: (ticker: string) => void;
  removeFromWatchlist: (ticker: string) => void;
  triggerSmartMoneyAlert: (params: {
    sourceId: string;
    sourceHandle: string;
    sourceName: string;
    ticker: string;
    sentiment: 'bullish' | 'bearish' | 'neutral';
    hitRate: number;
    alphaScore: number;
    content: string;
  }) => void;

  // Actions - Compound Rules
  addCompoundRule: (rule: Omit<CompoundAlertRule, 'id' | 'createdAt' | 'triggerCount'>) => void;
  updateCompoundRule: (id: string, updates: Partial<CompoundAlertRule>) => void;
  removeCompoundRule: (id: string) => void;
  addConditionToRule: (ruleId: string, condition: Omit<AlertCondition, 'id'>) => void;
  removeConditionFromRule: (ruleId: string, conditionId: string) => void;
  createRuleFromTemplate: (template: AlertTemplate, name?: string) => void;
  checkCompoundRules: (data: {
    ticker?: string;
    sentiment?: 'bullish' | 'bearish' | 'neutral';
    price?: number;
    score?: number;
    sourceAccuracy?: number;
    mentionVelocity?: number;
    content?: string;
  }) => void;

  // Actions - Email
  setUserEmail: (email: string | null) => void;
  sendEmailNotification: (ruleId: string, title: string, body: string) => Promise<void>;

  // Actions - Notifications
  requestNotificationPermission: () => Promise<void>;
  sendNotification: (title: string, body: string, options?: { symbol?: string }) => void;

  // Clear all acknowledged
  clearAcknowledged: () => void;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Default smart money rule
const defaultSmartMoneyRule: SmartMoneyRule = {
  id: 'default-rule',
  name: 'High Accuracy Sources',
  enabled: true,
  minHitRate: 60, // 60%+ hit rate
  minAlphaScore: 65, // 65+ alpha score
  watchlistOnly: false,
  sentimentFilter: 'all',
  browserNotify: true,
  emailNotify: false,
  createdAt: new Date(),
};

// Pre-built alert templates
export const ALERT_TEMPLATES: AlertTemplate[] = [
  {
    id: 'high-accuracy-bullish',
    name: 'High Accuracy Source + Bullish',
    description: 'Alert when a high-accuracy source (60%+) posts bullish sentiment',
    conditions: [
      { type: 'source_accuracy', operator: 'above', value: 60 },
      { type: 'sentiment', operator: 'equals', value: 'bullish' },
    ],
    logic: 'AND',
  },
  {
    id: 'ticker-spike',
    name: 'Ticker Mention Spike',
    description: 'Alert when a specific ticker has high mention velocity',
    conditions: [
      { type: 'ticker', operator: 'equals', value: '' }, // User fills in
      { type: 'mention_velocity', operator: 'above', value: 100 },
    ],
    logic: 'AND',
  },
  {
    id: 'high-score-alert',
    name: 'High Score Signal',
    description: 'Alert when any signal has a score above 80',
    conditions: [
      { type: 'score', operator: 'above', value: 80 },
    ],
    logic: 'AND',
  },
  {
    id: 'contrarian-setup',
    name: 'Contrarian Setup',
    description: 'High accuracy source with bearish sentiment (potential contrarian play)',
    conditions: [
      { type: 'source_accuracy', operator: 'above', value: 65 },
      { type: 'sentiment', operator: 'equals', value: 'bearish' },
      { type: 'score', operator: 'above', value: 70 },
    ],
    logic: 'AND',
  },
];

export const useAlertsStore = create<AlertsState>()(
  persist(
    (set, get) => ({
      priceAlerts: [],
      narrativeAlerts: [],
      smartMoneyRules: [defaultSmartMoneyRule],
      compoundRules: [],
      watchlist: ['AAPL', 'NVDA', 'TSLA', 'SPY', 'QQQ'], // Default watchlist
      userEmail: null,
      notificationPermission: typeof window !== 'undefined' ? Notification.permission : 'default',

      addPriceAlert: (symbol, type, targetPrice) => {
        const alert: PriceAlert = {
          id: generateId(),
          symbol: symbol.toUpperCase(),
          type,
          targetPrice,
          createdAt: new Date(),
          triggered: false,
          acknowledged: false,
        };
        set((state) => ({
          priceAlerts: [...state.priceAlerts, alert],
        }));
      },

      removePriceAlert: (id) => {
        set((state) => ({
          priceAlerts: state.priceAlerts.filter((a) => a.id !== id),
        }));
      },

      triggerPriceAlert: (id) => {
        const state = get();
        const alert = state.priceAlerts.find((a) => a.id === id);

        if (alert && !alert.triggered) {
          // Send browser notification
          const direction = alert.type === 'price_above' ? 'above' : 'below';
          state.sendNotification(
            `${alert.symbol} Price Alert`,
            `${alert.symbol} is now ${direction} $${alert.targetPrice.toFixed(2)}`,
            { symbol: alert.symbol }
          );

          set((state) => ({
            priceAlerts: state.priceAlerts.map((a) =>
              a.id === id ? { ...a, triggered: true, triggeredAt: new Date() } : a
            ),
          }));
        }
      },

      acknowledgePriceAlert: (id) => {
        set((state) => ({
          priceAlerts: state.priceAlerts.map((a) =>
            a.id === id ? { ...a, acknowledged: true } : a
          ),
        }));
      },

      addNarrativeAlert: (alertData) => {
        const alert: NarrativeAlert = {
          ...alertData,
          id: generateId(),
          acknowledged: false,
        };

        // Send browser notification
        const state = get();
        state.sendNotification(
          `${alert.target} Alert`,
          alert.explanation,
          { symbol: alert.targetType === 'ticker' ? alert.target : undefined }
        );

        set((state) => ({
          narrativeAlerts: [alert, ...state.narrativeAlerts].slice(0, 50), // Keep last 50
        }));
      },

      acknowledgeNarrativeAlert: (id) => {
        set((state) => ({
          narrativeAlerts: state.narrativeAlerts.map((a) =>
            a.id === id ? { ...a, acknowledged: true } : a
          ),
        }));
      },

      dismissNarrativeAlert: (id) => {
        set((state) => ({
          narrativeAlerts: state.narrativeAlerts.filter((a) => a.id !== id),
        }));
      },

      requestNotificationPermission: async () => {
        if (typeof window === 'undefined' || !('Notification' in window)) {
          return;
        }

        const permission = await Notification.requestPermission();
        set({ notificationPermission: permission });
      },

      sendNotification: (title, body, options) => {
        const state = get();

        if (typeof window === 'undefined' || !('Notification' in window)) {
          return;
        }

        if (state.notificationPermission !== 'granted') {
          return;
        }

        try {
          const notification = new Notification(title, {
            body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: options?.symbol || 'alert',
            requireInteraction: true,
          });

          // Auto-close after 10 seconds
          setTimeout(() => notification.close(), 10000);

          // Focus window on click
          notification.onclick = () => {
            window.focus();
            notification.close();
          };
        } catch (error) {
          console.error('Failed to send notification:', error);
        }
      },

      clearAcknowledged: () => {
        set((state) => ({
          priceAlerts: state.priceAlerts.filter((a) => !a.acknowledged || !a.triggered),
          narrativeAlerts: state.narrativeAlerts.filter((a) => !a.acknowledged),
        }));
      },

      // Smart Money Actions
      addSmartMoneyRule: (ruleData) => {
        const rule: SmartMoneyRule = {
          ...ruleData,
          id: generateId(),
          createdAt: new Date(),
        };
        set((state) => ({
          smartMoneyRules: [...state.smartMoneyRules, rule],
        }));
      },

      updateSmartMoneyRule: (id, updates) => {
        set((state) => ({
          smartMoneyRules: state.smartMoneyRules.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        }));
      },

      removeSmartMoneyRule: (id) => {
        set((state) => ({
          smartMoneyRules: state.smartMoneyRules.filter((r) => r.id !== id),
        }));
      },

      addToWatchlist: (ticker) => {
        const normalized = ticker.toUpperCase();
        set((state) => ({
          watchlist: state.watchlist.includes(normalized)
            ? state.watchlist
            : [...state.watchlist, normalized],
        }));
      },

      removeFromWatchlist: (ticker) => {
        const normalized = ticker.toUpperCase();
        set((state) => ({
          watchlist: state.watchlist.filter((t) => t !== normalized),
        }));
      },

      triggerSmartMoneyAlert: (params) => {
        const state = get();
        const {
          sourceId,
          sourceHandle,
          sourceName,
          ticker,
          sentiment,
          hitRate,
          alphaScore,
          content
        } = params;

        // Check if any rule matches
        const matchingRule = state.smartMoneyRules.find((rule) => {
          if (!rule.enabled) return false;
          if (hitRate < rule.minHitRate) return false;
          if (alphaScore < rule.minAlphaScore) return false;
          if (rule.watchlistOnly && !state.watchlist.includes(ticker.toUpperCase())) return false;
          if (rule.sentimentFilter !== 'all' && sentiment !== rule.sentimentFilter) return false;
          return true;
        });

        if (!matchingRule) return;

        // Create the alert
        const sentimentEmoji = sentiment === 'bullish' ? '🟢' : sentiment === 'bearish' ? '🔴' : '⚪';
        const explanation = `${sentimentEmoji} @${sourceHandle} (${hitRate.toFixed(0)}% hit rate) posted ${sentiment} on $${ticker}: "${content.slice(0, 100)}${content.length > 100 ? '...' : ''}"`;

        const alert: NarrativeAlert = {
          id: generateId(),
          type: 'smart_money',
          target: ticker,
          targetType: 'source',
          explanation,
          time: new Date(),
          acknowledged: false,
          sourceId,
          sourceHandle,
          sentiment,
          hitRate,
        };

        // Send browser notification if enabled
        if (matchingRule.browserNotify) {
          state.sendNotification(
            `Smart Money Alert: $${ticker}`,
            `@${sourceHandle} (${hitRate.toFixed(0)}% accuracy) is ${sentiment} on $${ticker}`,
            { symbol: ticker }
          );
        }

        set((state) => ({
          narrativeAlerts: [alert, ...state.narrativeAlerts].slice(0, 50),
        }));
      },

      // Compound Rule Actions
      addCompoundRule: (ruleData) => {
        const rule: CompoundAlertRule = {
          ...ruleData,
          id: generateId(),
          createdAt: new Date(),
          triggerCount: 0,
        };
        set((state) => ({
          compoundRules: [...state.compoundRules, rule],
        }));
      },

      updateCompoundRule: (id, updates) => {
        set((state) => ({
          compoundRules: state.compoundRules.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        }));
      },

      removeCompoundRule: (id) => {
        set((state) => ({
          compoundRules: state.compoundRules.filter((r) => r.id !== id),
        }));
      },

      addConditionToRule: (ruleId, condition) => {
        const newCondition: AlertCondition = {
          ...condition,
          id: generateId(),
        };
        set((state) => ({
          compoundRules: state.compoundRules.map((r) =>
            r.id === ruleId
              ? { ...r, conditions: [...r.conditions, newCondition] }
              : r
          ),
        }));
      },

      removeConditionFromRule: (ruleId, conditionId) => {
        set((state) => ({
          compoundRules: state.compoundRules.map((r) =>
            r.id === ruleId
              ? { ...r, conditions: r.conditions.filter((c) => c.id !== conditionId) }
              : r
          ),
        }));
      },

      createRuleFromTemplate: (template, name) => {
        const rule: CompoundAlertRule = {
          id: generateId(),
          name: name || template.name,
          enabled: true,
          conditions: template.conditions.map((c) => ({ ...c, id: generateId() })),
          logic: template.logic,
          browserNotify: true,
          emailNotify: false,
          createdAt: new Date(),
          triggerCount: 0,
        };
        set((state) => ({
          compoundRules: [...state.compoundRules, rule],
        }));
      },

      checkCompoundRules: (data) => {
        const state = get();
        const { ticker, sentiment, price, score, sourceAccuracy, mentionVelocity, content } = data;

        for (const rule of state.compoundRules) {
          if (!rule.enabled) continue;

          const matchedConditions: string[] = [];
          let allMatch = true;
          let anyMatch = false;

          for (const condition of rule.conditions) {
            let matches = false;

            switch (condition.type) {
              case 'ticker':
                if (ticker) {
                  matches = condition.operator === 'equals'
                    ? ticker.toUpperCase() === String(condition.value).toUpperCase()
                    : ticker.toUpperCase().includes(String(condition.value).toUpperCase());
                }
                break;
              case 'sentiment':
                if (sentiment) {
                  matches = sentiment === condition.value;
                }
                break;
              case 'price':
                if (price !== undefined) {
                  const targetPrice = Number(condition.value);
                  matches = condition.operator === 'above' ? price > targetPrice : price < targetPrice;
                }
                break;
              case 'score':
                if (score !== undefined) {
                  const targetScore = Number(condition.value);
                  matches = condition.operator === 'above' ? score > targetScore : score < targetScore;
                }
                break;
              case 'source_accuracy':
                if (sourceAccuracy !== undefined) {
                  const targetAccuracy = Number(condition.value);
                  matches = condition.operator === 'above' ? sourceAccuracy > targetAccuracy : sourceAccuracy < targetAccuracy;
                }
                break;
              case 'mention_velocity':
                if (mentionVelocity !== undefined) {
                  const targetVelocity = Number(condition.value);
                  matches = condition.operator === 'above' ? mentionVelocity > targetVelocity : mentionVelocity < targetVelocity;
                }
                break;
            }

            if (matches) {
              matchedConditions.push(`${condition.type} ${condition.operator} ${condition.value}`);
              anyMatch = true;
            } else {
              allMatch = false;
            }
          }

          const shouldTrigger = rule.logic === 'AND' ? allMatch : anyMatch;

          if (shouldTrigger && matchedConditions.length > 0) {
            // Create the alert
            const explanation = `Rule "${rule.name}" triggered: ${matchedConditions.join(', ')}${content ? ` - "${content.slice(0, 80)}..."` : ''}`;

            const alert: NarrativeAlert = {
              id: generateId(),
              type: 'compound',
              target: ticker || 'MARKET',
              targetType: ticker ? 'ticker' : 'theme',
              explanation,
              time: new Date(),
              acknowledged: false,
              ruleId: rule.id,
              matchedConditions,
              sentiment,
            };

            // Send browser notification if enabled
            if (rule.browserNotify) {
              state.sendNotification(
                `Alert: ${rule.name}`,
                explanation,
                { symbol: ticker }
              );
            }

            // Send email notification if enabled
            if (rule.emailNotify && rule.email) {
              state.sendEmailNotification(rule.id, `Alert: ${rule.name}`, explanation);
            }

            // Update rule stats
            set((s) => ({
              narrativeAlerts: [alert, ...s.narrativeAlerts].slice(0, 50),
              compoundRules: s.compoundRules.map((r) =>
                r.id === rule.id
                  ? { ...r, lastTriggeredAt: new Date(), triggerCount: r.triggerCount + 1 }
                  : r
              ),
            }));
          }
        }
      },

      // Email Actions
      setUserEmail: (email) => {
        set({ userEmail: email });
      },

      sendEmailNotification: async (ruleId, title, body) => {
        const state = get();
        const rule = state.compoundRules.find((r) => r.id === ruleId);
        const email = rule?.email || state.userEmail;

        if (!email) {
          console.warn('No email configured for notification');
          return;
        }

        try {
          await fetch('/api/notifications/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: email, subject: title, body }),
          });
        } catch (error) {
          console.error('Failed to send email notification:', error);
        }
      },
    }),
    {
      name: 'narrative-terminal-alerts-v2',
      partialize: (state) => ({
        priceAlerts: state.priceAlerts,
        smartMoneyRules: state.smartMoneyRules,
        compoundRules: state.compoundRules,
        watchlist: state.watchlist,
        userEmail: state.userEmail,
        // Don't persist narrative alerts - they come from the backend
      }),
    }
  )
);

// Selector for unacknowledged count
export const selectUnacknowledgedCount = (state: AlertsState) =>
  state.priceAlerts.filter((a) => a.triggered && !a.acknowledged).length +
  state.narrativeAlerts.filter((a) => !a.acknowledged).length;
