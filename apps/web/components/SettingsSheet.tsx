'use client';

import * as React from 'react';
import { useState } from 'react';
import useSWR from 'swr';
import { useTheme } from 'next-themes';
import {
  Settings,
  Palette,
  Brain,
  Database,
  Download,
  Upload,
  Key,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2,
  Sun,
  Moon,
  List,
  Plus,
  Search,
  Rss,
  RefreshCw,
  Trash2,
  ChevronDown,
  ChevronRight,
  X,
  Building2,
} from 'lucide-react';
import { BrokerConnection } from '@/components/settings/BrokerConnection';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settings';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// ===========================================
// Types
// ===========================================
interface ApiStatus {
  supabase: {
    configured: boolean;
    serviceRole: boolean;
  };
  twitter: {
    configured: boolean;
  };
  deepseek: {
    configured: boolean;
  };
  cron: {
    configured: boolean;
  };
}

interface Source {
  id: string;
  handle: string;
  name: string;
  type: 'twitter' | 'rss' | 'news';
  weight: number;
  url: string | null;
  enabled: boolean;
  last_fetched_at: string | null;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// ===========================================
// X/Twitter Logo
// ===========================================
function XLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// ===========================================
// Appearance Section
// ===========================================
function AppearanceSection() {
  const { theme: colorMode, setTheme: setColorMode } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  return (
    <div className="flex items-center justify-between gap-4">
      <Label className="text-xs text-muted-foreground shrink-0">Color Mode</Label>
      <ToggleGroup
        type="single"
        value={mounted ? colorMode : 'dark'}
        onValueChange={(value) => value && setColorMode(value)}
        size="sm"
      >
        <ToggleGroupItem value="dark" className="gap-1 px-2 h-7 text-xs">
          <Moon className="h-3 w-3" />
          Dark
        </ToggleGroupItem>
        <ToggleGroupItem value="light" className="gap-1 px-2 h-7 text-xs">
          <Sun className="h-3 w-3" />
          Light
        </ToggleGroupItem>
        <ToggleGroupItem value="system" className="px-2 h-7 text-xs">
          System
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}

// ===========================================
// AI Section
// ===========================================
function AISection() {
  const aiMode = useSettingsStore((s) => s.aiMode);
  const setAIMode = useSettingsStore((s) => s.setAIMode);
  const maxItemsForAI = useSettingsStore((s) => s.maxItemsForAI);
  const setMaxItemsForAI = useSettingsStore((s) => s.setMaxItemsForAI);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <Label className="text-xs text-muted-foreground shrink-0">Clustering</Label>
        <ToggleGroup
          type="single"
          value={aiMode}
          onValueChange={(value) => value && setAIMode(value as typeof aiMode)}
          size="sm"
        >
          <ToggleGroupItem value="off" className="px-2 h-7 text-xs">
            Off
          </ToggleGroupItem>
          <ToggleGroupItem value="manual" className="px-2 h-7 text-xs">
            Manual
          </ToggleGroupItem>
          <ToggleGroupItem value="scheduled" className="px-2 h-7 text-xs">
            Scheduled
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="flex items-center gap-3">
        <Label className="text-xs text-muted-foreground shrink-0">
          Max items: <span className="text-foreground font-medium">{maxItemsForAI}</span>
        </Label>
        <Slider
          min={10}
          max={100}
          step={10}
          value={[maxItemsForAI]}
          onValueChange={(value) => setMaxItemsForAI(value[0] ?? maxItemsForAI)}
          className="flex-1"
        />
      </div>
    </div>
  );
}

// ===========================================
// Data Section
// ===========================================
function DataSection() {
  const [isExporting, setIsExporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExport = () => {
    setIsExporting(true);
    try {
      // Gather all localStorage data
      const exportData: Record<string, unknown> = {};

      // Get settings
      const settingsData = localStorage.getItem('narrative-terminal-settings');
      if (settingsData) {
        exportData.settings = JSON.parse(settingsData);
      }

      // Get workspace data
      const workspaceData = localStorage.getItem('narrative-terminal-workspace-v4');
      if (workspaceData) {
        exportData.workspace = JSON.parse(workspaceData);
      }

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `narrative-terminal-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export settings');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        // Restore settings
        if (data.settings) {
          localStorage.setItem('narrative-terminal-settings', JSON.stringify(data.settings));
        }

        // Restore workspace
        if (data.workspace) {
          localStorage.setItem('narrative-terminal-workspace-v4', JSON.stringify(data.workspace));
        }

        alert('Settings imported successfully! The page will now reload.');
        window.location.reload();
      } catch (err) {
        console.error('Import failed:', err);
        alert('Failed to import settings. Please check the file format.');
      }
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearData = async () => {
    if (!confirm('Are you sure you want to clear all local data? This cannot be undone.')) {
      return;
    }

    setIsClearing(true);
    try {
      // Clear localStorage
      localStorage.removeItem('narrative-terminal-settings');
      localStorage.removeItem('narrative-terminal-workspace-v4');

      alert('All local data cleared. The page will now reload.');
      window.location.reload();
    } catch (err) {
      console.error('Clear failed:', err);
      alert('Failed to clear data');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Import/Export */}
      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Backup & Restore</Label>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5 mr-1.5" />
            )}
            Export
          </Button>
        </div>
      </div>

      {/* Clear Data */}
      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Danger Zone</Label>
        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={handleClearData}
          disabled={isClearing}
        >
          {isClearing ? (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
          )}
          Clear All Local Data
        </Button>
      </div>
    </div>
  );
}

// ===========================================
// Sources Section
// ===========================================
function SourcesSection() {
  const [tab, setTab] = useState<'all' | 'twitter' | 'rss'>('all');
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);

  const { data, error, isLoading, mutate } = useSWR<{ sources: Source[] }>(
    '/api/sources',
    fetcher
  );

  const sources = data?.sources || [];

  const filteredSources = React.useMemo(() => {
    return sources.filter((source) => {
      if (tab !== 'all' && source.type !== tab) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          source.handle.toLowerCase().includes(q) ||
          source.name.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [sources, tab, search]);

  const updateWeight = async (id: string, weight: number) => {
    await fetch(`/api/sources/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weight }),
    });
    mutate();
  };

  const toggleEnabled = async (id: string, enabled: boolean) => {
    await fetch(`/api/sources/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    });
    mutate();
  };

  const deleteSource = async (id: string) => {
    if (!confirm('Delete this source?')) return;
    await fetch(`/api/sources/${id}`, { method: 'DELETE' });
    mutate();
  };

  const triggerIngestion = async (type: 'rss' | 'twitter') => {
    setIsIngesting(true);
    try {
      const res = await fetch(`/api/ingest/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manual: true }),
      });
      const result = await res.json();
      alert(
        `Ingested ${result.itemsIngested || 0} items from ${result.sourcesProcessed || 0} sources`
      );
    } catch (err) {
      alert('Ingestion failed');
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{sources.length} sources</span>
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => triggerIngestion('rss')}
                  disabled={isIngesting}
                  className="h-7 w-7"
                >
                  {isIngesting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ingest RSS now</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            variant={showAddForm ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setShowAddForm(!showAddForm)}
            className="h-7 w-7"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Add Source Form */}
      {showAddForm && (
        <AddSourceForm
          onClose={() => setShowAddForm(false)}
          onAdded={() => {
            mutate();
            setShowAddForm(false);
          }}
        />
      )}

      {/* Tabs */}
      <div className="flex gap-1">
        {(['all', 'rss', 'twitter'] as const).map((t) => (
          <Button
            key={t}
            variant={tab === t ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 h-7 text-xs capitalize',
              tab === t && 'bg-primary/20 text-primary hover:bg-primary/30'
            )}
          >
            {t === 'all' ? 'All' : t === 'rss' ? 'RSS' : 'Twitter'}
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search sources..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-7 h-8 text-xs"
        />
      </div>

      {/* Sources List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded" />
            ))}
          </div>
        ) : filteredSources.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-xs">
            No sources found
          </div>
        ) : (
          filteredSources.map((source) => (
            <SourceCard
              key={source.id}
              source={source}
              onUpdateWeight={(w) => updateWeight(source.id, w)}
              onToggleEnabled={(e) => toggleEnabled(source.id, e)}
              onDelete={() => deleteSource(source.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Source Card Component
function SourceCard({
  source,
  onUpdateWeight,
  onToggleEnabled,
  onDelete,
}: {
  source: Source;
  onUpdateWeight: (weight: number) => void;
  onToggleEnabled: (enabled: boolean) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={cn(
        'rounded-lg border transition-all',
        source.enabled ? 'border-border bg-card' : 'border-border/50 bg-card/50 opacity-60'
      )}
    >
      <div
        className="flex items-center gap-2 px-3 py-2 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground">
          {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </Button>

        {source.type === 'twitter' ? (
          <XLogo className="h-4 w-4 text-[#1DA1F2]" />
        ) : (
          <Rss className="h-4 w-4 text-orange-400" />
        )}

        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium truncate block">{source.name}</span>
          <span className="text-[10px] text-muted-foreground truncate block">{source.handle}</span>
        </div>

        <span
          className={cn(
            'text-xs font-mono px-1.5 py-0.5 rounded',
            source.weight >= 8
              ? 'bg-primary/20 text-primary'
              : source.weight >= 5
                ? 'bg-accent/20 text-accent'
                : 'bg-muted text-muted-foreground'
          )}
        >
          {source.weight}
        </span>
      </div>

      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-border/50 space-y-3">
          <div className="flex items-center gap-3">
            <Label className="text-xs text-muted-foreground w-12">Weight</Label>
            <Slider
              min={0}
              max={10}
              step={1}
              value={[source.weight]}
              onValueChange={(value) => onUpdateWeight(value[0] ?? source.weight)}
              className="flex-1"
            />
            <span className="text-xs font-mono w-6 text-center">{source.weight}</span>
          </div>

          <div className="flex items-center gap-3">
            <Label className="text-xs text-muted-foreground w-12">Active</Label>
            <Switch checked={source.enabled} onCheckedChange={onToggleEnabled} />
            <span className="text-xs text-muted-foreground">
              {source.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            {source.url && (
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-3 w-3" />
                Open
              </a>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="h-6 text-destructive/70 hover:text-destructive ml-auto"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Add Source Form
function AddSourceForm({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: () => void;
}) {
  const [type, setType] = useState<'rss' | 'twitter'>('rss');
  const [handle, setHandle] = useState('');
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [weight, setWeight] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle,
          name,
          type,
          url: type === 'rss' ? url : undefined,
          weight,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add source');
      }

      onAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add source');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border border-border rounded-lg bg-muted/20 space-y-3">
      <div className="flex gap-2">
        <Button
          type="button"
          variant={type === 'rss' ? 'default' : 'ghost'}
          onClick={() => setType('rss')}
          size="sm"
          className={cn(
            'flex-1',
            type === 'rss' && 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
          )}
        >
          <Rss className="h-3.5 w-3.5 mr-1.5" />
          RSS
        </Button>
        <Button
          type="button"
          variant={type === 'twitter' ? 'default' : 'ghost'}
          onClick={() => setType('twitter')}
          size="sm"
          className={cn(
            'flex-1',
            type === 'twitter' && 'bg-[#1DA1F2]/20 text-[#1DA1F2] hover:bg-[#1DA1F2]/30'
          )}
        >
          <XLogo className="h-3.5 w-3.5 mr-1.5" />
          Twitter
        </Button>
      </div>

      <Input
        type="text"
        placeholder={type === 'twitter' ? '@username' : 'feed-identifier'}
        value={handle}
        onChange={(e) => setHandle(e.target.value)}
        className="h-8 text-sm"
        required
      />
      <Input
        type="text"
        placeholder="Display Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="h-8 text-sm"
        required
      />
      {type === 'rss' && (
        <Input
          type="url"
          placeholder="https://example.com/feed.xml"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="h-8 text-sm"
          required
        />
      )}
      <div className="flex items-center gap-3">
        <Label className="text-xs text-muted-foreground">Weight:</Label>
        <Slider
          min={1}
          max={10}
          step={1}
          value={[weight]}
          onValueChange={(value) => setWeight(value[0] ?? weight)}
          className="flex-1"
        />
        <span className="text-xs font-mono w-6">{weight}</span>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onClose} size="sm" className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} size="sm" className="flex-1">
          {isSubmitting ? 'Adding...' : 'Add Source'}
        </Button>
      </div>
    </form>
  );
}

// ===========================================
// API Status Section
// ===========================================
function ApiStatusSection() {
  const { data: apiStatus, isLoading: statusLoading } = useSWR<ApiStatus>('/api/status', fetcher);

  return (
    <div className="space-y-4">
      {statusLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-2">
          <StatusRow
            name="Supabase"
            configured={apiStatus?.supabase.configured ?? false}
            required
          />
          <StatusRow
            name="Twitter (Direct Auth)"
            configured={apiStatus?.twitter.configured ?? false}
          />
          <StatusRow name="DeepSeek (AI)" configured={apiStatus?.deepseek.configured ?? false} />
          <StatusRow name="Cron Secret" configured={apiStatus?.cron.configured ?? false} />
        </div>
      )}

      {!apiStatus?.twitter.configured && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <p className="text-[10px] text-amber-400 mb-1.5 font-medium">Twitter Ingestion Setup</p>
          <ol className="text-[10px] text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Create a dedicated X/Twitter account</li>
            <li>Add TWITTER_USERNAME to .env.local</li>
            <li>Add TWITTER_PASSWORD to .env.local</li>
            <li>Add TWITTER_EMAIL to .env.local</li>
          </ol>
        </div>
      )}
    </div>
  );
}

function StatusRow({
  name,
  configured,
  required = false,
}: {
  name: string;
  configured: boolean;
  required?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 px-2 rounded bg-muted/30">
      <div className="flex items-center gap-2">
        {configured ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
        ) : (
          <XCircle className={cn('h-3.5 w-3.5', required ? 'text-destructive' : 'text-amber-500')} />
        )}
        <span className="text-xs">{name}</span>
      </div>
      <span
        className={cn(
          'text-[10px] px-1.5 py-0.5 rounded',
          configured
            ? 'bg-green-500/20 text-green-500'
            : required
              ? 'bg-destructive/20 text-destructive'
              : 'bg-amber-500/20 text-amber-500'
        )}
      >
        {configured ? 'Connected' : required ? 'Not configured' : 'Optional'}
      </span>
    </div>
  );
}

// ===========================================
// Main SettingsSheet Component
// ===========================================
interface SettingsSheetProps {
  trigger?: React.ReactNode;
}

export function SettingsSheet({ trigger }: SettingsSheetProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className="max-w-2xl w-full max-h-[85vh] p-0 flex flex-col overflow-hidden"
        style={{ backgroundColor: 'hsl(var(--card))' }}
      >
        <DialogHeader className="px-6 py-4 border-b border-border shrink-0" style={{ backgroundColor: 'hsl(var(--muted))' }}>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5" />
            Settings
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-auto">
          <div className="p-6">
            <Accordion
              type="multiple"
              defaultValue={['appearance', 'ai', 'sources', 'api']}
              className="space-y-2"
            >
              {/* Appearance */}
              <AccordionItem value="appearance" className="border rounded-lg px-4" style={{ backgroundColor: 'hsl(var(--card))' }}>
                <AccordionTrigger className="text-sm py-3">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-primary" />
                    Appearance
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <AppearanceSection />
                </AccordionContent>
              </AccordionItem>

              {/* AI Settings */}
              <AccordionItem value="ai" className="border rounded-lg px-4" style={{ backgroundColor: 'hsl(var(--card))' }}>
                <AccordionTrigger className="text-sm py-3">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" />
                    AI Settings
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <AISection />
                </AccordionContent>
              </AccordionItem>

              {/* Brokerage Connections */}
              <AccordionItem value="brokers" className="border rounded-lg px-4" style={{ backgroundColor: 'hsl(var(--card))' }}>
                <AccordionTrigger className="text-sm py-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    Brokerage Connections
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <BrokerConnection />
                </AccordionContent>
              </AccordionItem>

              {/* Data Sources */}
              <AccordionItem value="sources" className="border rounded-lg px-4" style={{ backgroundColor: 'hsl(var(--card))' }}>
                <AccordionTrigger className="text-sm py-3">
                  <div className="flex items-center gap-2">
                    <List className="h-4 w-4 text-primary" />
                    Data Sources
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <SourcesSection />
                </AccordionContent>
              </AccordionItem>

              {/* Data Settings */}
              <AccordionItem value="data" className="border rounded-lg px-4" style={{ backgroundColor: 'hsl(var(--card))' }}>
                <AccordionTrigger className="text-sm py-3">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-primary" />
                    Data Settings
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <DataSection />
                </AccordionContent>
              </AccordionItem>

              {/* API Status */}
              <AccordionItem value="api" className="border rounded-lg px-4" style={{ backgroundColor: 'hsl(var(--card))' }}>
                <AccordionTrigger className="text-sm py-3">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-primary" />
                    API Status
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <ApiStatusSection />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
