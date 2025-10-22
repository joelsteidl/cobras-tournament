import { NextRequest, NextResponse } from 'next/server';
import { resetMatches } from '@/lib/kv';
import { generateSchedule, loadTeams } from '@/lib/tournament';
import { Redis } from '@upstash/redis';
import { TournamentState } from '@/types';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'cobras2025';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('x-admin-token');

    if (token !== ADMIN_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Reset the tournament
    await resetMatches();

    // Initialize with a fresh schedule
    await loadTeams();
    const matches = generateSchedule();
    const initialState: TournamentState = {
      matches,
      lastUpdated: Date.now(),
    };
    await redis.set('cobras:tournament:state', initialState);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resetting matches:', error);
    return NextResponse.json({ error: 'Failed to reset matches' }, { status: 500 });
  }
}
