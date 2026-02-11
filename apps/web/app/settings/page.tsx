'use client';

import { BrokerConnection } from '@/components/settings/BrokerConnection';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Brokerage Connections</h2>
          <BrokerConnection />
        </Card>
      </div>
    </div>
  );
}
