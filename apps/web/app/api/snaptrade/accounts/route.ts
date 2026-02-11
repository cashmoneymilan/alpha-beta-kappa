import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getAccounts, getAuthorizations, deleteAuthorization } from '@/lib/snaptrade/client';
import type { UserBrokerPartial } from '@/lib/snaptrade/db-types';

/**
 * GET /api/snaptrade/accounts
 * Get all connected brokerage accounts for the current user
 */
export async function GET() {
  try {
    const supabase = await createServerClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's SnapTrade credentials
    const { data: userBroker } = await supabase
      .from('user_brokers' as any)
      .select('snaptrade_user_id, snaptrade_user_secret')
      .eq('user_id', user.id)
      .single() as { data: UserBrokerPartial | null };

    if (!userBroker?.snaptrade_user_id || !userBroker?.snaptrade_user_secret) {
      return NextResponse.json({
        accounts: [],
        authorizations: [],
        message: 'No brokerage connected',
      });
    }

    // Get accounts and authorizations
    const [accounts, authorizations] = await Promise.all([
      getAccounts(userBroker.snaptrade_user_id, userBroker.snaptrade_user_secret),
      getAuthorizations(userBroker.snaptrade_user_id, userBroker.snaptrade_user_secret),
    ]);

    // Transform accounts with brokerage info
    const enrichedAccounts = accounts.map((account: any) => {
      const auth = authorizations.find((a: any) => a.id === account.brokerage_authorization);
      return {
        id: account.id,
        name: account.name,
        number: account.number,
        institutionName: account.institution_name,
        brokerage: auth?.brokerage ? {
          id: auth.brokerage.id,
          name: auth.brokerage.name,
          displayName: auth.brokerage.display_name,
          logoUrl: auth.brokerage.aws_s3_logo_url,
          allowsTrading: auth.brokerage.allows_trading_through_snaptrade_api,
        } : null,
        balance: account.balance,
        syncStatus: account.sync_status,
        createdAt: account.created_date,
      };
    });

    return NextResponse.json({
      accounts: enrichedAccounts,
      authorizations: authorizations.map((auth: any) => ({
        id: auth.id,
        brokerageName: auth.brokerage?.display_name,
        brokerageSlug: auth.brokerage?.slug,
        logoUrl: auth.brokerage?.aws_s3_logo_url,
        disabled: auth.disabled,
        createdAt: auth.created_date,
      })),
    });
  } catch (error) {
    console.error('SnapTrade accounts error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/snaptrade/accounts
 * Disconnect a brokerage authorization
 *
 * Body:
 * - authorizationId: The authorization ID to disconnect
 */
export async function DELETE(request: Request) {
  try {
    const supabase = await createServerClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { authorizationId } = body;

    if (!authorizationId) {
      return NextResponse.json(
        { error: 'Missing authorizationId' },
        { status: 400 }
      );
    }

    // Get user's SnapTrade credentials
    const { data: userBroker } = await supabase
      .from('user_brokers' as any)
      .select('snaptrade_user_id, snaptrade_user_secret')
      .eq('user_id', user.id)
      .single() as { data: UserBrokerPartial | null };

    if (!userBroker?.snaptrade_user_id || !userBroker?.snaptrade_user_secret) {
      return NextResponse.json(
        { error: 'No SnapTrade user found' },
        { status: 404 }
      );
    }

    // Delete the authorization in SnapTrade
    await deleteAuthorization(
      userBroker.snaptrade_user_id,
      userBroker.snaptrade_user_secret,
      authorizationId
    );

    // Mark accounts as inactive in our database (table type not generated yet)
    await (supabase as any)
      .from('broker_accounts')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('authorization_id', authorizationId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('SnapTrade disconnect error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to disconnect' },
      { status: 500 }
    );
  }
}
