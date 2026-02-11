import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getAccounts, getAuthorizations } from '@/lib/snaptrade/client';
import type { UserBrokerPartial } from '@/lib/snaptrade/db-types';

/**
 * GET /api/snaptrade/callback
 * OAuth callback handler after brokerage connection
 * SnapTrade redirects here after successful connection
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const authorizationId = searchParams.get('authorizationId');
    const brokerage = searchParams.get('brokerage');
    const errorMessage = searchParams.get('errorMessage');

    const supabase = await createServerClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      // Redirect to login with error
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/auth/login?error=unauthorized`
      );
    }

    if (status === 'ERROR' || errorMessage) {
      // Redirect to settings with error
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/settings?broker_error=${encodeURIComponent(errorMessage || 'Connection failed')}`
      );
    }

    if (status === 'SUCCESS' && authorizationId) {
      // Get user's SnapTrade credentials
      const { data: userBroker } = await supabase
        .from('user_brokers' as any)
        .select('snaptrade_user_id, snaptrade_user_secret')
        .eq('user_id', user.id)
        .single() as { data: UserBrokerPartial | null };

      if (!userBroker?.snaptrade_user_id || !userBroker?.snaptrade_user_secret) {
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/settings?broker_error=missing_credentials`
        );
      }

      // Get accounts from the new authorization
      const accounts = await getAccounts(
        userBroker.snaptrade_user_id,
        userBroker.snaptrade_user_secret
      );

      // Get authorization details
      const authorizations = await getAuthorizations(
        userBroker.snaptrade_user_id,
        userBroker.snaptrade_user_secret
      );

      const authorization = authorizations.find(a => a.id === authorizationId);

      // Store connected accounts
      for (const account of accounts) {
        await supabase
          .from('broker_accounts' as any)
          .upsert({
            user_id: user.id,
            snaptrade_account_id: account.id,
            authorization_id: authorizationId,
            brokerage_name: authorization?.brokerage?.name || brokerage || 'Unknown',
            account_name: account.name,
            account_number: account.number,
            institution_name: account.institution_name,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as any, {
            onConflict: 'snaptrade_account_id',
          });
      }

      // Update user_brokers with latest sync (table type not generated yet)
      await (supabase as any)
        .from('user_brokers')
        .update({
          last_sync: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      // Redirect to settings with success
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/settings?broker_connected=${brokerage || 'brokerage'}`
      );
    }

    // Unknown status
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings?broker_error=unknown_status`
    );
  } catch (error) {
    console.error('SnapTrade callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings?broker_error=${encodeURIComponent(error instanceof Error ? error.message : 'Callback failed')}`
    );
  }
}
