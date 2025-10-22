import { NextRequest, NextResponse } from 'next/server';
import { resetMatches } from '@/lib/kv';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'cobras2025';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('x-admin-token');

    if (token !== ADMIN_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await resetMatches();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resetting matches:', error);
    return NextResponse.json({ error: 'Failed to reset matches' }, { status: 500 });
  }
}
