import { NextResponse } from 'next/server';
import { getWebSocketConfig } from '@/lib/alpaca/client';

export async function GET() {
  try {
    const config = getWebSocketConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching WebSocket credentials:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch credentials' },
      { status: 500 }
    );
  }
}
