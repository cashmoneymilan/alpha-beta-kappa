'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import {
  Link2,
  Link2Off,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

interface BrokerageInfo {
  id: string;
  brokerageName: string;
  brokerageSlug: string;
  logoUrl: string;
  disabled: boolean;
  createdAt: string;
}

interface AccountInfo {
  id: string;
  name: string;
  number: string;
  institutionName: string;
  brokerage: {
    id: string;
    name: string;
    displayName: string;
    logoUrl: string;
    allowsTrading: boolean;
  } | null;
  balance: {
    total: { amount: number; currency: string } | null;
    cash: { amount: number; currency: string } | null;
  };
  createdAt: string;
}

interface AccountsResponse {
  accounts: AccountInfo[];
  authorizations: BrokerageInfo[];
  message?: string;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

// Popular brokerages to show connection buttons for
const POPULAR_BROKERAGES = [
  { slug: 'wealthsimple', name: 'Wealthsimple', color: '#000000' },
  { slug: 'questrade', name: 'Questrade', color: '#00a651' },
  { slug: 'interactive-brokers', name: 'Interactive Brokers', color: '#d52b1e' },
];

export function BrokerConnection() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingBrokerage, setConnectingBrokerage] = useState<string | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);

  const { data, error, isLoading, mutate } = useSWR<AccountsResponse>(
    '/api/snaptrade/accounts',
    fetcher,
    { refreshInterval: 60000 }
  );

  const handleConnect = async (brokerageSlug?: string) => {
    setIsConnecting(true);
    setConnectingBrokerage(brokerageSlug || 'any');

    try {
      const response = await fetch('/api/snaptrade/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brokerageSlug,
          redirectUri: `${window.location.origin}/api/snaptrade/callback`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start connection');
      }

      const { redirectUrl } = await response.json();

      // Redirect to SnapTrade connection portal
      window.location.href = redirectUrl;
    } catch (err) {
      console.error('Connection error:', err);
      setIsConnecting(false);
      setConnectingBrokerage(null);
    }
  };

  const handleDisconnect = async (authorizationId: string) => {
    setDisconnectingId(authorizationId);

    try {
      const response = await fetch('/api/snaptrade/accounts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorizationId }),
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect');
      }

      // Refresh the accounts list
      mutate();
    } catch (err) {
      console.error('Disconnect error:', err);
    } finally {
      setDisconnectingId(null);
    }
  };

  const hasConnections = data?.authorizations && data.authorizations.length > 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-destructive py-4">
        <AlertCircle className="h-5 w-5" />
        <span>Failed to load broker connections</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connected Brokerages Section */}
      {hasConnections && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Connected Brokerages</h4>
          <div className="grid gap-3">
            {data?.authorizations.map((auth) => (
              <Card key={auth.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {auth.logoUrl ? (
                      <img
                        src={auth.logoUrl}
                        alt={auth.brokerageName}
                        className="h-10 w-10 rounded-lg object-contain bg-white p-1"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{auth.brokerageName}</div>
                      <div className="text-xs text-muted-foreground">
                        Connected {new Date(auth.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {auth.disabled ? (
                      <Badge variant="destructive" className="text-xs">
                        Disconnected
                      </Badge>
                    ) : (
                      <Badge variant="bullish" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Link2Off className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Disconnect {auth.brokerageName}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will disconnect your {auth.brokerageName} account from the app.
                            You can reconnect at any time, but any pending orders may be affected.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDisconnect(auth.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {disconnectingId === auth.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            Disconnect
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                {/* Show accounts under this brokerage */}
                {data?.accounts
                  .filter((acc) => acc.brokerage?.id === auth.id.split('_')[0])
                  .map((account) => (
                    <div
                      key={account.id}
                      className="mt-3 pt-3 border-t border-border/50 text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{account.name}</span>
                          <span className="text-muted-foreground ml-2">
                            •••{account.number.slice(-4)}
                          </span>
                        </div>
                        {account.balance?.total && (
                          <span className="font-mono">
                            {account.balance.total.currency}{' '}
                            {account.balance.total.amount.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Connect New Brokerage Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">
          {hasConnections ? 'Connect Another Brokerage' : 'Connect Your Brokerage'}
        </h4>

        <div className="grid gap-2">
          {POPULAR_BROKERAGES.map((brokerage) => {
            const isConnected = data?.authorizations.some(
              (auth) => auth.brokerageSlug === brokerage.slug && !auth.disabled
            );

            return (
              <Button
                key={brokerage.slug}
                variant="outline"
                className={cn(
                  'justify-start h-auto py-3',
                  isConnected && 'opacity-50'
                )}
                onClick={() => handleConnect(brokerage.slug)}
                disabled={isConnecting || isConnected}
              >
                {isConnecting && connectingBrokerage === brokerage.slug ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-3" />
                ) : (
                  <div
                    className="h-6 w-6 rounded mr-3 flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: brokerage.color }}
                  >
                    {brokerage.name[0]}
                  </div>
                )}
                <span className="flex-1 text-left">{brokerage.name}</span>
                {isConnected ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            );
          })}

          {/* Connect any other brokerage */}
          <Button
            variant="ghost"
            className="justify-start h-auto py-3 border border-dashed border-border"
            onClick={() => handleConnect()}
            disabled={isConnecting}
          >
            {isConnecting && connectingBrokerage === 'any' ? (
              <Loader2 className="h-4 w-4 animate-spin mr-3" />
            ) : (
              <Link2 className="h-4 w-4 mr-3" />
            )}
            <span className="flex-1 text-left">Connect Other Brokerage</span>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          Securely connect your brokerage account via SnapTrade to view real holdings and execute
          trades. Your credentials are never stored on our servers.
        </p>
      </div>

      {/* Refresh button */}
      {hasConnections && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => mutate()}
          className="w-full"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Connections
        </Button>
      )}
    </div>
  );
}
