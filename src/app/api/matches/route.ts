import { NextRequest, NextResponse } from 'next/server';
import { getTournamentState, updateMatch } from '@/lib/kv';
import { loadTeams, generateSchedule } from '@/lib/tournament';
import { Match } from '@/types';

export async function GET() {
  try {
    const state = await getTournamentState();

    // If no matches exist, generate them
    if (state.matches.length === 0) {
      await loadTeams(); // Ensure teams can be loaded
      const matches = generateSchedule();
      state.matches = matches;
      state.lastUpdated = Date.now();

      // Save to KV
      const { kv } = await import('@vercel/kv');
      await kv.set('cobras:tournament:state', state);
    }

    return NextResponse.json(state.matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const match: Match = await request.json();
    await updateMatch(match);
    return NextResponse.json(match);
  } catch (error) {
    console.error('Error updating match:', error);
    return NextResponse.json({ error: 'Failed to update match' }, { status: 500 });
  }
}
