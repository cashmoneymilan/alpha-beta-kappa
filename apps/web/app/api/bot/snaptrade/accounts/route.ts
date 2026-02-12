import { NextResponse } from 'next/server';
import { checkAuth, getSnapTradeCredentials, missingCredsResponse } from '@/app/api/snaptrade/helpers';
import { getAccounts, getAuthorizations } from '@/lib/snaptrade/client';

/**
 * GET /api/bot/snaptrade/accounts
 * Bot-friendly endpoint — auth via X-API-Key header, creds from env vars.
 */
export async function GET(req: Request) {
  const denied = checkAuth(req);
  if (denied) return denied;

  const creds = getSnapTradeCredentials();
  if (!creds) return missingCredsResponse();

  try {
    const [accounts, authorizations] = await Promise.all([
      getAccounts(creds.userId, creds.userSecret),
      getAuthorizations(creds.userId, creds.userSecret),
    ]);

    const enriched = (accounts as any[]).map((a: any) => {
      const auth = (authorizations as any[]).find((x: any) => x.id === a.brokerage_authorization);
      return {
        id: a.id,
        name: a.name,
        number: a.number,
        institutionName: a.institution_name,
        brokerage: auth?.brokerage?.display_name ?? null,
        balance: a.balance,
        syncStatus: a.sync_status,
      };
    });

    return NextResponse.json({ accounts: enriched });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}
