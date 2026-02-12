import { NextResponse } from 'next/server';

const API_KEY = process.env.SNAPTRADE_PROXY_KEY || process.env.CRON_SECRET || '';

export function checkAuth(req: Request): NextResponse | null {
  const key = req.headers.get('x-api-key') || '';
  if (!API_KEY || key !== API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export function getSnapTradeCredentials(): {
  clientId: string;
  consumerKey: string;
  userId: string;
  userSecret: string;
} | null {
  const clientId = process.env.SNAPTRADE_CLIENT_ID;
  const consumerKey = process.env.SNAPTRADE_CONSUMER_KEY;
  const userId = process.env.SNAPTRADE_USER_ID;
  const userSecret = process.env.SNAPTRADE_USER_SECRET;

  if (!clientId || !consumerKey || !userId || !userSecret) {
    return null;
  }

  return { clientId, consumerKey, userId, userSecret };
}

export function missingCredsResponse() {
  return NextResponse.json(
    {
      error: 'SnapTrade not configured',
      missing: [
        !process.env.SNAPTRADE_CLIENT_ID && 'SNAPTRADE_CLIENT_ID',
        !process.env.SNAPTRADE_CONSUMER_KEY && 'SNAPTRADE_CONSUMER_KEY',
        !process.env.SNAPTRADE_USER_ID && 'SNAPTRADE_USER_ID',
        !process.env.SNAPTRADE_USER_SECRET && 'SNAPTRADE_USER_SECRET',
      ].filter(Boolean),
    },
    { status: 503 }
  );
}
