import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, getUser } from '@/lib/supabase/server';

interface UserSettings {
  email_notifications: boolean;
  browser_notifications: boolean;
  notification_email: string | null;
  default_position_size: number;
  risk_warning_threshold: number;
  theme: 'dark' | 'light' | 'system';
  workspace_layout: Record<string, unknown> | null;
}

// GET - Get user settings
export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching settings:', error);
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }

    // Return defaults if no settings exist
    if (!data) {
      return NextResponse.json({
        settings: {
          email_notifications: true,
          browser_notifications: true,
          notification_email: user.email,
          default_position_size: 0.1,
          risk_warning_threshold: 0.25,
          theme: 'dark',
          workspace_layout: null,
        },
      });
    }

    return NextResponse.json({ settings: data });
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update user settings
export async function PUT(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: Partial<UserSettings> = await request.json();

    // Validate theme if provided
    if (body.theme && !['dark', 'light', 'system'].includes(body.theme)) {
      return NextResponse.json(
        { error: 'Invalid theme. Must be one of: dark, light, system' },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Upsert settings
    const { data, error } = await supabase
      .from('user_settings')
      .upsert(
        {
          user_id: user.id,
          ...body,
          updated_at: new Date().toISOString(),
        } as any,
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('Error updating settings:', error);
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }

    return NextResponse.json({ settings: data });
  } catch (error) {
    console.error('Settings PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
