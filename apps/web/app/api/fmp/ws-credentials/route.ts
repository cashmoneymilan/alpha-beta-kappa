import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.FMP_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'FMP API key not configured', apiKey: null },
      { status: 200 }
    );
  }

  // Return the API key for WebSocket connection
  // Note: In production, you might want to add additional security
  // like verifying the user session before returning the key
  return NextResponse.json({ apiKey });
}
