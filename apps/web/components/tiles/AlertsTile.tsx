"use client";

import * as React from "react";
import useSWR from "swr";
import {
  TrendingUp,
  Zap,
  User,
  Check,
  X,
  Settings,
  Plus,
  DollarSign,
  BellRing,
  Trash2,
  ArrowUp,
  ArrowDown,
  Crown,
  Target,
  Eye,
  EyeOff,
  RefreshCw,
  Loader2,
  Layers,
  Mail,
  Copy,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Tile } from "@/stores/workspace";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useAlertsStore,
  selectUnacknowledgedCount,
  type PriceAlert,
  type NarrativeAlert,
  type SmartMoneyRule,
  type CompoundAlertRule,
  type AlertCondition,
  type ConditionType,
  type ConditionOperator,
  ALERT_TEMPLATES,
} from "@/stores/alertsStore";
import type { SmartMoneyActivity } from "@/app/api/smart-money/route";

const fetcher = (url: string) => fetch(url).then(res => res.json());

type Tab = "active" | "price" | "smart" | "builder" | "rules";

const alertConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
  mention_spike: { icon: TrendingUp, label: "Spike", color: "text-green-400" },
  momentum_shift: { icon: Zap, label: "Momentum", color: "text-accent" },
  key_source: { icon: User, label: "Source", color: "text-blue-400" },
  smart_money: { icon: Crown, label: "Smart Money", color: "text-yellow-400" },
  compound: { icon: Layers, label: "Compound", color: "text-purple-400" },
  price_above: { icon: ArrowUp, label: "Price Above", color: "text-green-400" },
  price_below: { icon: ArrowDown, label: "Price Below", color: "text-red-400" },
};

const conditionTypeLabels: Record<ConditionType, string> = {
  ticker: 'Ticker',
  sentiment: 'Sentiment',
  price: 'Price',
  score: 'Score',
  source_accuracy: 'Source Accuracy',
  mention_velocity: 'Mention Velocity',
};

const operatorLabels: Record<ConditionOperator, string> = {
  equals: '=',
  above: '>',
  below: '<',
  contains: 'contains',
};

function ConditionBuilder({
  onAdd,
}: {
  onAdd: (condition: Omit<AlertCondition, 'id'>) => void;
}) {
  const [type, setType] = React.useState<ConditionType>('ticker');
  const [operator, setOperator] = React.useState<ConditionOperator>('equals');
  const [value, setValue] = React.useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onAdd({ type, operator, value: type === 'sentiment' ? value : (isNaN(Number(value)) ? value : Number(value)) });
    setValue('');
  };

  const getOperatorsForType = (t: ConditionType): ConditionOperator[] => {
    switch (t) {
      case 'ticker':
        return ['equals', 'contains'];
      case 'sentiment':
        return ['equals'];
      default:
        return ['above', 'below', 'equals'];
    }
  };

  const getInputForType = () => {
    if (type === 'sentiment') {
      return (
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger className="flex-1 h-7 text-xs">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bullish">Bullish</SelectItem>
            <SelectItem value="bearish">Bearish</SelectItem>
            <SelectItem value="neutral">Neutral</SelectItem>
          </SelectContent>
        </Select>
      );
    }

    return (
      <Input
        type={type === 'ticker' ? 'text' : 'number'}
        placeholder={type === 'ticker' ? 'e.g. AAPL' : 'Value'}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1 h-7 text-xs"
      />
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-1.5">
        <Select
          value={type}
          onValueChange={(v) => {
            setType(v as ConditionType);
            setOperator(getOperatorsForType(v as ConditionType)[0]!);
            setValue('');
          }}
        >
          <SelectTrigger className="w-[110px] h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(conditionTypeLabels).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={operator} onValueChange={(v) => setOperator(v as ConditionOperator)}>
          <SelectTrigger className="w-14 h-7 text-xs text-center">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {getOperatorsForType(type).map((op) => (
              <SelectItem key={op} value={op}>{operatorLabels[op]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {getInputForType()}
      </div>
      <Button
        type="submit"
        disabled={!value.trim()}
        size="sm"
        className="w-full bg-purple-500 hover:bg-purple-600 text-white"
      >
        <Plus className="h-3 w-3" />
        Add Condition
      </Button>
    </form>
  );
}

function CompoundRuleCard({
  rule,
  expanded,
  onToggleExpand,
}: {
  rule: CompoundAlertRule;
  expanded: boolean;
  onToggleExpand: () => void;
}) {
  const updateCompoundRule = useAlertsStore((s) => s.updateCompoundRule);
  const removeCompoundRule = useAlertsStore((s) => s.removeCompoundRule);
  const removeConditionFromRule = useAlertsStore((s) => s.removeConditionFromRule);
  const addConditionToRule = useAlertsStore((s) => s.addConditionToRule);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div
        className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/50"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-purple-400" />
          <span className="text-sm font-medium">{rule.name}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            {rule.conditions.length} conditions
          </span>
          {rule.triggerCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">
              {rule.triggerCount} triggers
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              updateCompoundRule(rule.id, { enabled: !rule.enabled });
            }}
            className={cn(
              "h-7 w-7",
              rule.enabled ? "text-green-400" : "text-muted-foreground"
            )}
          >
            {rule.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border p-3 space-y-3">
          {/* Logic Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Match Logic</span>
            <div className="flex gap-1">
              <Button
                variant={rule.logic === 'AND' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => updateCompoundRule(rule.id, { logic: 'AND' })}
                className={cn(
                  "h-6 px-2 text-[10px]",
                  rule.logic === 'AND' && "bg-purple-500 hover:bg-purple-600"
                )}
              >
                ALL (AND)
              </Button>
              <Button
                variant={rule.logic === 'OR' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => updateCompoundRule(rule.id, { logic: 'OR' })}
                className={cn(
                  "h-6 px-2 text-[10px]",
                  rule.logic === 'OR' && "bg-purple-500 hover:bg-purple-600"
                )}
              >
                ANY (OR)
              </Button>
            </div>
          </div>

          {/* Conditions */}
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Conditions</span>
            {rule.conditions.map((condition, idx) => (
              <div
                key={condition.id}
                className="flex items-center justify-between p-2 bg-muted/50 rounded text-xs"
              >
                <div className="flex items-center gap-2">
                  {idx > 0 && (
                    <span className="text-[10px] text-purple-400 font-medium">
                      {rule.logic}
                    </span>
                  )}
                  <span className="font-medium">{conditionTypeLabels[condition.type]}</span>
                  <span className="text-muted-foreground">{operatorLabels[condition.operator]}</span>
                  <span className="text-purple-400">{String(condition.value)}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeConditionFromRule(rule.id, condition.id)}
                  className="h-5 w-5 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add Condition */}
          <ConditionBuilder
            onAdd={(condition) => addConditionToRule(rule.id, condition)}
          />

          {/* Notification Settings */}
          <div className="pt-2 border-t border-border space-y-2">
            <Label className="text-xs text-muted-foreground">Notifications</Label>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs">
                <Checkbox
                  id={`browser-${rule.id}`}
                  checked={rule.browserNotify}
                  onCheckedChange={(checked) => updateCompoundRule(rule.id, { browserNotify: checked === true })}
                />
                <Label htmlFor={`browser-${rule.id}`} className="flex items-center gap-1 text-xs cursor-pointer">
                  <BellRing className="h-3 w-3" />
                  Browser
                </Label>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Checkbox
                  id={`email-${rule.id}`}
                  checked={rule.emailNotify}
                  onCheckedChange={(checked) => updateCompoundRule(rule.id, { emailNotify: checked === true })}
                />
                <Label htmlFor={`email-${rule.id}`} className="flex items-center gap-1 text-xs cursor-pointer">
                  <Mail className="h-3 w-3" />
                  Email
                </Label>
              </div>
            </div>
            {rule.emailNotify && (
              <Input
                type="email"
                placeholder="Email address"
                value={rule.email || ''}
                onChange={(e) => updateCompoundRule(rule.id, { email: e.target.value })}
                className="w-full h-7 text-xs"
              />
            )}
          </div>

          {/* Delete Rule */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => removeCompoundRule(rule.id)}
            className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            <Trash2 className="h-3 w-3" />
            Delete Rule
          </Button>
        </div>
      )}
    </div>
  );
}

export function AlertsTile({ tile }: { tile: Tile }) {
  const [tab, setTab] = React.useState<Tab>("active");
  const [newSymbol, setNewSymbol] = React.useState("");
  const [newPrice, setNewPrice] = React.useState("");
  const [newType, setNewType] = React.useState<"price_above" | "price_below">("price_above");
  const [newWatchlistTicker, setNewWatchlistTicker] = React.useState("");
  const [expandedRuleId, setExpandedRuleId] = React.useState<string | null>(null);
  const [newRuleName, setNewRuleName] = React.useState("");

  // Store state
  const priceAlerts = useAlertsStore((s) => s.priceAlerts);
  const narrativeAlerts = useAlertsStore((s) => s.narrativeAlerts);
  const smartMoneyRules = useAlertsStore((s) => s.smartMoneyRules);
  const compoundRules = useAlertsStore((s) => s.compoundRules);
  const watchlist = useAlertsStore((s) => s.watchlist);
  const notificationPermission = useAlertsStore((s) => s.notificationPermission);
  const unacknowledgedCount = useAlertsStore(selectUnacknowledgedCount);

  // Store actions
  const addPriceAlert = useAlertsStore((s) => s.addPriceAlert);
  const removePriceAlert = useAlertsStore((s) => s.removePriceAlert);
  const acknowledgePriceAlert = useAlertsStore((s) => s.acknowledgePriceAlert);
  const acknowledgeNarrativeAlert = useAlertsStore((s) => s.acknowledgeNarrativeAlert);
  const dismissNarrativeAlert = useAlertsStore((s) => s.dismissNarrativeAlert);
  const requestNotificationPermission = useAlertsStore((s) => s.requestNotificationPermission);
  const clearAcknowledged = useAlertsStore((s) => s.clearAcknowledged);
  const updateSmartMoneyRule = useAlertsStore((s) => s.updateSmartMoneyRule);
  const addToWatchlist = useAlertsStore((s) => s.addToWatchlist);
  const removeFromWatchlist = useAlertsStore((s) => s.removeFromWatchlist);
  const triggerSmartMoneyAlert = useAlertsStore((s) => s.triggerSmartMoneyAlert);
  const addCompoundRule = useAlertsStore((s) => s.addCompoundRule);
  const createRuleFromTemplate = useAlertsStore((s) => s.createRuleFromTemplate);

  // Fetch smart money activity
  const activeRule = smartMoneyRules.find(r => r.enabled);
  const watchlistParam = activeRule?.watchlistOnly ? `&watchlist=${watchlist.join(',')}` : '';
  const { data: smartMoneyData, isLoading: smartMoneyLoading, mutate: refreshSmartMoney } = useSWR<{
    activities: SmartMoneyActivity[];
  }>(
    activeRule
      ? `/api/smart-money?minHitRate=${activeRule.minHitRate}&minAlphaScore=${activeRule.minAlphaScore}&sinceMinutes=60${watchlistParam}`
      : null,
    fetcher,
    { refreshInterval: 60000 }
  );

  // Track seen activities to avoid duplicate alerts
  const seenActivities = React.useRef(new Set<string>());

  // Trigger alerts for new smart money activities
  React.useEffect(() => {
    if (!smartMoneyData?.activities || !activeRule?.browserNotify) return;

    for (const activity of smartMoneyData.activities) {
      if (seenActivities.current.has(activity.id)) continue;
      seenActivities.current.add(activity.id);

      const activityTime = new Date(activity.publishedAt).getTime();
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      if (activityTime > fiveMinutesAgo) {
        triggerSmartMoneyAlert({
          sourceId: activity.sourceId,
          sourceHandle: activity.sourceHandle,
          sourceName: activity.sourceName,
          ticker: activity.ticker,
          sentiment: activity.sentiment,
          hitRate: activity.hitRate,
          alphaScore: activity.alphaScore,
          content: activity.content,
        });
      }
    }
  }, [smartMoneyData?.activities, activeRule, triggerSmartMoneyAlert]);

  // Request notification permission on mount
  React.useEffect(() => {
    if (notificationPermission === "default") {
      // Will be requested when user adds first alert
    }
  }, [notificationPermission]);

  const handleAddPriceAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol.trim() || !newPrice.trim()) return;

    const price = parseFloat(newPrice);
    if (isNaN(price) || price <= 0) return;

    if (notificationPermission === "default") {
      requestNotificationPermission();
    }

    addPriceAlert(newSymbol.trim(), newType, price);
    setNewSymbol("");
    setNewPrice("");
  };

  const handleCreateEmptyRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim()) return;

    addCompoundRule({
      name: newRuleName.trim(),
      enabled: true,
      conditions: [],
      logic: 'AND',
      browserNotify: true,
      emailNotify: false,
    });
    setNewRuleName("");
  };

  // Triggered price alerts (for the active tab)
  const triggeredPriceAlerts = priceAlerts.filter((a) => a.triggered && !a.acknowledged);
  const pendingPriceAlerts = priceAlerts.filter((a) => !a.triggered);
  const unacknowledgedNarrativeAlerts = narrativeAlerts.filter((a) => !a.acknowledged);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className="border-b border-zinc-800/50 px-2 py-1.5">
        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
          <TabsList className="w-full h-8 grid grid-cols-4">
            <TabsTrigger value="active" className="text-xs h-7 relative">
              Active
              {unacknowledgedCount > 0 && (
                <Badge variant="default" className="ml-1 px-1 py-0 text-[10px] h-4">
                  {unacknowledgedCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="price" className="text-xs h-7">
              Price
            </TabsTrigger>
            <TabsTrigger value="smart" className="text-xs h-7 gap-1">
              <Crown className="h-3 w-3" />
              Smart
            </TabsTrigger>
            <TabsTrigger value="builder" className="text-xs h-7 gap-1">
              <Layers className="h-3 w-3" />
              Builder
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="flex-1">
        {tab === "active" ? (
          <div className="p-2 space-y-2">
            {triggeredPriceAlerts.length === 0 && unacknowledgedNarrativeAlerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No active alerts
              </div>
            ) : (
              <>
                {/* Triggered Price Alerts */}
                {triggeredPriceAlerts.map((alert) => {
                  const config = alertConfig[alert.type] ?? alertConfig.price_above;
                  const Icon = config!.icon;
                  return (
                    <div
                      key={alert.id}
                      className="p-2 rounded border border-primary/30 bg-primary/5"
                    >
                      <div className="flex items-start gap-2">
                        <Icon className={cn("h-4 w-4 mt-0.5", config!.color)} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-accent/20 text-accent">
                              ${alert.symbol}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {alert.triggeredAt && formatRelativeTime(new Date(alert.triggeredAt))}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Price {alert.type === "price_above" ? "crossed above" : "dropped below"} ${alert.targetPrice.toFixed(2)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => acknowledgePriceAlert(alert.id)}
                          className="h-6 w-6 text-muted-foreground hover:text-primary"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {/* Narrative Alerts (including smart money and compound) */}
                {unacknowledgedNarrativeAlerts.map((alert) => {
                  const config = alertConfig[alert.type] ?? alertConfig.key_source;
                  const Icon = config!.icon;
                  const isSmartMoney = alert.type === 'smart_money';
                  const isCompound = alert.type === 'compound';
                  return (
                    <div
                      key={alert.id}
                      className={cn(
                        "p-2 rounded border",
                        isSmartMoney
                          ? "border-yellow-500/30 bg-yellow-500/5"
                          : isCompound
                          ? "border-purple-500/30 bg-purple-500/5"
                          : "border-primary/30 bg-primary/5"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <Icon className={cn("h-4 w-4 mt-0.5", config!.color)} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={cn(
                                "text-xs font-medium px-1.5 py-0.5 rounded",
                                alert.targetType === "ticker"
                                  ? "bg-accent/20 text-accent"
                                  : alert.targetType === "source"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : isCompound
                                  ? "bg-purple-500/20 text-purple-400"
                                  : "bg-primary/20 text-primary"
                              )}
                            >
                              ${alert.target}
                            </span>
                            {isSmartMoney && alert.sourceHandle && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                @{alert.sourceHandle}
                              </span>
                            )}
                            {isSmartMoney && alert.hitRate && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
                                {alert.hitRate.toFixed(0)}% accuracy
                              </span>
                            )}
                            {isCompound && alert.matchedConditions && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">
                                {alert.matchedConditions.length} conditions matched
                              </span>
                            )}
                            <span className="text-[10px] text-muted-foreground">
                              {formatRelativeTime(new Date(alert.time))}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {alert.explanation}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => acknowledgeNarrativeAlert(alert.id)}
                            className="h-6 w-6 text-muted-foreground hover:text-primary"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => dismissNarrativeAlert(alert.id)}
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        ) : tab === "price" ? (
          <div className="p-3 space-y-3">
            {/* Add Price Alert Form */}
            <form onSubmit={handleAddPriceAlert} className="p-3 rounded border border-border">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">New Price Alert</span>
              </div>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Symbol"
                    value={newSymbol}
                    onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                    className="flex-1 h-8 text-xs"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-24 h-8 text-xs"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={newType === "price_above" ? "buy" : "outline"}
                    size="sm"
                    onClick={() => setNewType("price_above")}
                    className="flex-1"
                  >
                    <ArrowUp className="h-3 w-3" />
                    Above
                  </Button>
                  <Button
                    type="button"
                    variant={newType === "price_below" ? "sell" : "outline"}
                    size="sm"
                    onClick={() => setNewType("price_below")}
                    className="flex-1"
                  >
                    <ArrowDown className="h-3 w-3" />
                    Below
                  </Button>
                </div>
                <Button
                  type="submit"
                  disabled={!newSymbol.trim() || !newPrice.trim()}
                  size="sm"
                  className="w-full"
                >
                  <Plus className="h-3 w-3" />
                  Add Alert
                </Button>
              </div>
            </form>

            {/* Pending Price Alerts */}
            {pendingPriceAlerts.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground font-medium px-1">
                  Pending Alerts ({pendingPriceAlerts.length})
                </div>
                {pendingPriceAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-2 rounded border border-border flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {alert.type === "price_above" ? (
                        <ArrowUp className="h-3 w-3 text-green-400" />
                      ) : (
                        <ArrowDown className="h-3 w-3 text-red-400" />
                      )}
                      <span className="text-xs font-medium">{alert.symbol}</span>
                      <span className="text-xs text-muted-foreground">
                        {alert.type === "price_above" ? ">" : "<"} ${alert.targetPrice.toFixed(2)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removePriceAlert(alert.id)}
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Notification Status */}
            <div className="p-2 rounded bg-muted/30 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <BellRing className="h-3 w-3" />
                <span>
                  Browser notifications:{" "}
                  <span
                    className={cn(
                      "font-medium",
                      notificationPermission === "granted"
                        ? "text-green-400"
                        : notificationPermission === "denied"
                        ? "text-red-400"
                        : "text-amber-400"
                    )}
                  >
                    {notificationPermission === "granted"
                      ? "Enabled"
                      : notificationPermission === "denied"
                      ? "Blocked"
                      : "Not enabled"}
                  </span>
                </span>
              </div>
            </div>
          </div>
        ) : tab === "smart" ? (
          <div className="p-3 space-y-3">
            {/* Smart Money Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium">Smart Money Tracking</span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => refreshSmartMoney()}
                      disabled={smartMoneyLoading}
                      className="h-7 w-7"
                    >
                      {smartMoneyLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Refresh smart money data</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Rule Configuration */}
            {activeRule && (
              <div className="p-3 rounded border border-yellow-500/30 bg-yellow-500/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{activeRule.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => updateSmartMoneyRule(activeRule.id, { enabled: !activeRule.enabled })}
                    className={cn(
                      "h-6 w-6",
                      activeRule.enabled ? "text-green-400" : "text-muted-foreground"
                    )}
                  >
                    {activeRule.enabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </Button>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Min Hit Rate */}
                  <div className="flex items-center justify-between">
                    <Label className="text-muted-foreground">Min Hit Rate</Label>
                    <div className="flex items-center gap-2">
                      <Slider
                        min={50}
                        max={80}
                        step={5}
                        value={[activeRule.minHitRate]}
                        onValueChange={(value) => updateSmartMoneyRule(activeRule.id, { minHitRate: value[0] })}
                        className="w-20"
                      />
                      <span className="w-8 text-right">{activeRule.minHitRate}%</span>
                    </div>
                  </div>

                  {/* Min Alpha Score */}
                  <div className="flex items-center justify-between">
                    <Label className="text-muted-foreground">Min Alpha Score</Label>
                    <div className="flex items-center gap-2">
                      <Slider
                        min={50}
                        max={90}
                        step={5}
                        value={[activeRule.minAlphaScore]}
                        onValueChange={(value) => updateSmartMoneyRule(activeRule.id, { minAlphaScore: value[0] })}
                        className="w-20"
                      />
                      <span className="w-8 text-right">{activeRule.minAlphaScore}</span>
                    </div>
                  </div>

                  {/* Watchlist Only */}
                  <div className="flex items-center justify-between">
                    <Label className="text-muted-foreground">Watchlist Only</Label>
                    <Switch
                      checked={activeRule.watchlistOnly}
                      onCheckedChange={(checked) => updateSmartMoneyRule(activeRule.id, { watchlistOnly: checked })}
                    />
                  </div>

                  {/* Sentiment Filter */}
                  <div className="flex items-center justify-between">
                    <Label className="text-muted-foreground">Sentiment</Label>
                    <Select
                      value={activeRule.sentimentFilter}
                      onValueChange={(v) => updateSmartMoneyRule(activeRule.id, { sentimentFilter: v as 'all' | 'bullish' | 'bearish' })}
                    >
                      <SelectTrigger className="w-[100px] h-6 text-[10px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="bullish">Bullish Only</SelectItem>
                        <SelectItem value="bearish">Bearish Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Watchlist */}
            <div className="p-3 rounded border border-border space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium">Watchlist</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {watchlist.map((ticker) => (
                  <Badge
                    key={ticker}
                    variant="default"
                    className="text-[10px] px-1.5 py-0.5 flex items-center gap-1"
                  >
                    ${ticker}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromWatchlist(ticker)}
                      className="h-3 w-3 p-0 hover:text-destructive"
                    >
                      <X className="h-2.5 w-2.5" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newWatchlistTicker.trim()) {
                    addToWatchlist(newWatchlistTicker.trim());
                    setNewWatchlistTicker("");
                  }
                }}
                className="flex gap-1"
              >
                <Input
                  type="text"
                  placeholder="Add ticker..."
                  value={newWatchlistTicker}
                  onChange={(e) => setNewWatchlistTicker(e.target.value.toUpperCase())}
                  className="flex-1 h-7 text-[10px]"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-7 w-7"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </form>
            </div>

            {/* Recent Smart Money Activity */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">Recent Activity</span>
              {smartMoneyLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : smartMoneyData?.activities && smartMoneyData.activities.length > 0 ? (
                <ScrollArea className="max-h-40">
                  <div className="space-y-1">
                    {smartMoneyData.activities.slice(0, 5).map((activity) => (
                      <div
                        key={activity.id}
                        className="p-2 rounded border border-border text-xs"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            "text-[10px] px-1 py-0.5 rounded",
                            activity.sentiment === 'bullish' ? "bg-green-500/20 text-green-400" :
                            activity.sentiment === 'bearish' ? "bg-red-500/20 text-red-400" :
                            "bg-muted text-muted-foreground"
                          )}>
                            {activity.sentiment === 'bullish' ? '🟢' : activity.sentiment === 'bearish' ? '🔴' : '⚪'} {activity.sentiment}
                          </span>
                          <span className="font-medium">${activity.ticker}</span>
                          <span className="text-muted-foreground">@{activity.sourceHandle}</span>
                          <span className="text-green-400 text-[10px]">{activity.hitRate.toFixed(0)}%</span>
                        </div>
                        <p className="text-muted-foreground line-clamp-2">{activity.content}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-xs">
                  No recent activity from high-accuracy sources
                </div>
              )}
            </div>
          </div>
        ) : tab === "builder" ? (
          <div className="p-3 space-y-3">
            {/* Builder Header */}
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium">Compound Alert Builder</span>
            </div>

            {/* Templates */}
            <div className="space-y-2">
              <span className="text-xs text-muted-foreground">Quick Start Templates</span>
              <div className="grid gap-2">
                {ALERT_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => createRuleFromTemplate(template)}
                    className="p-2 text-left rounded border border-border hover:border-purple-500/50 hover:bg-purple-500/5 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{template.name}</span>
                      <Copy className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {template.description}
                    </p>
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {template.conditions.map((c, i) => (
                        <span
                          key={i}
                          className="text-[9px] px-1 py-0.5 rounded bg-purple-500/10 text-purple-400"
                        >
                          {conditionTypeLabels[c.type]} {operatorLabels[c.operator]} {String(c.value) || '?'}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Create Empty Rule */}
            <form onSubmit={handleCreateEmptyRule} className="space-y-2">
              <span className="text-xs text-muted-foreground">Or Create Custom Rule</span>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Rule name..."
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  className="flex-1 h-8 text-xs"
                />
                <Button
                  type="submit"
                  disabled={!newRuleName.trim()}
                  size="sm"
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                >
                  <Plus className="h-3 w-3" />
                  Create
                </Button>
              </div>
            </form>

            {/* Existing Rules */}
            {compoundRules.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  Your Rules ({compoundRules.length})
                </span>
                {compoundRules.map((rule) => (
                  <CompoundRuleCard
                    key={rule.id}
                    rule={rule}
                    expanded={expandedRuleId === rule.id}
                    onToggleExpand={() =>
                      setExpandedRuleId(expandedRuleId === rule.id ? null : rule.id)
                    }
                  />
                ))}
              </div>
            )}

            {/* Clear Acknowledged */}
            <Button
              variant="outline"
              size="sm"
              onClick={clearAcknowledged}
              className="w-full"
            >
              Clear Acknowledged Alerts
            </Button>
          </div>
        ) : null}
      </ScrollArea>
    </div>
  );
}
