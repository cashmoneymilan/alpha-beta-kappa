import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, getUser } from '@/lib/supabase/server';
import { encryptCredentials, decryptCredentials } from '@/lib/crypto';

export type CredentialProvider = 'alpaca' | 'ibkr' | 'resend';

interface CreateCredentialRequest {
  provider: CredentialProvider;
  credentials: Record<string, string>;
  label?: string;
}

// GET - List user's credentials (without decrypted data)
export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('user_credentials')
      .select('id, provider, label, is_active, last_used_at, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching credentials:', error);
      return NextResponse.json({ error: 'Failed to fetch credentials' }, { status: 500 });
    }

    return NextResponse.json({ credentials: data });
  } catch (error) {
    console.error('Credentials GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new credentials
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateCredentialRequest = await request.json();
    const { provider, credentials, label } = body;

    if (!provider || !credentials) {
      return NextResponse.json(
        { error: 'Missing required fields: provider, credentials' },
        { status: 400 }
      );
    }

    // Validate provider
    const validProviders: CredentialProvider[] = ['alpaca', 'ibkr', 'resend'];
    if (!validProviders.includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider. Must be one of: alpaca, ibkr, resend' },
        { status: 400 }
      );
    }

    // Encrypt credentials
    const encryptedData = encryptCredentials(credentials);

    const supabase = await createServerClient();

    // Deactivate any existing credentials for this provider
    await (supabase
      .from('user_credentials') as any)
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('provider', provider);

    // Insert new credentials
    const { data, error } = (await supabase
      .from('user_credentials')
      .insert({
        user_id: user.id,
        provider,
        encrypted_data: encryptedData,
        label: label || `${provider} credentials`,
        is_active: true,
      } as any)
      .select('id, provider, label, is_active, created_at')
      .single()) as any;

    if (error) {
      console.error('Error creating credentials:', error);
      return NextResponse.json({ error: 'Failed to create credentials' }, { status: 500 });
    }

    return NextResponse.json({ credential: data }, { status: 201 });
  } catch (error) {
    console.error('Credentials POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove credentials
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing credential id' }, { status: 400 });
    }

    const supabase = await createServerClient();
    const { error } = await supabase
      .from('user_credentials')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting credentials:', error);
      return NextResponse.json({ error: 'Failed to delete credentials' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Credentials DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Internal function to get decrypted credentials for a provider
export async function getUserCredentials(
  userId: string,
  provider: CredentialProvider
): Promise<Record<string, string> | null> {
  const { createServiceClient } = await import('@/lib/supabase/server');
  const supabase = createServiceClient();

  const { data, error } = (await supabase
    .from('user_credentials')
    .select('encrypted_data')
    .eq('user_id', userId)
    .eq('provider', provider)
    .eq('is_active', true)
    .single()) as any;

  if (error || !data) {
    return null;
  }

  // Update last_used_at
  await (supabase
    .from('user_credentials') as any)
    .update({ last_used_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('provider', provider)
    .eq('is_active', true);

  return decryptCredentials(data.encrypted_data);
}
