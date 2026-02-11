import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { registerUser, getLoginLink } from '@/lib/snaptrade/client';
import type { UserBrokerPartial } from '@/lib/snaptrade/db-types';

/**
 * POST /api/snaptrade/auth
 * Start the SnapTrade OAuth flow to connect a brokerage
 *
 * Body:
 * - brokerageSlug: (optional) specific brokerage to connect (e.g., 'wealthsimple')
 * - redirectUri: (optional) custom redirect URI after auth
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json().catch(() => ({}));
    const { brokerageSlug, redirectUri } = body;

    // Check if user already has a SnapTrade registration
    const { data: existingBroker } = await supabase
      .from('user_brokers' as any)
      .select('snaptrade_user_id, snaptrade_user_secret')
      .eq('user_id', user.id)
      .single() as { data: UserBrokerPartial | null };

    let snapTradeUserId: string;
    let snapTradeUserSecret: string;

    if (existingBroker?.snaptrade_user_id && existingBroker?.snaptrade_user_secret) {
      // Use existing SnapTrade user
      snapTradeUserId = existingBroker.snaptrade_user_id;
      snapTradeUserSecret = existingBroker.snaptrade_user_secret;
    } else {
      // Register new SnapTrade user
      const registration = await registerUser(user.id);
      snapTradeUserId = registration.userId || '';
      snapTradeUserSecret = registration.userSecret || '';

      // Store in database
      await supabase
        .from('user_brokers' as any)
        .upsert({
          user_id: user.id,
          snaptrade_user_id: snapTradeUserId,
          snaptrade_user_secret: snapTradeUserSecret,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any);
    }

    // Get login link for brokerage connection
    const loginLink = await getLoginLink(
      snapTradeUserId,
      snapTradeUserSecret,
      brokerageSlug,
      redirectUri || `${process.env.NEXT_PUBLIC_APP_URL}/api/snaptrade/callback`
    );

    return NextResponse.json({
      redirectUrl: (loginLink as any).redirectURI || (loginLink as any).redirect_uri || loginLink,
      sessionId: (loginLink as any).sessionId || (loginLink as any).session_id,
    });
  } catch (error) {
    console.error('SnapTrade auth error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start authentication' },
      { status: 500 }
    );
  }
}
