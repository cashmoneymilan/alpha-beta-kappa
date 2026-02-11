import { NextResponse } from 'next/server';
import { getAccount } from '@/lib/alpaca/client';
import { transformAccount } from '@/lib/alpaca/transforms';

export async function GET() {
  try {
    const rawAccount = await getAccount();
    const account = transformAccount(rawAccount);
    return NextResponse.json(account);
  } catch (error) {
    console.error('Error fetching account:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch account' },
      { status: 500 }
    );
  }
}
