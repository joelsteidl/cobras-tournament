import { NextResponse } from 'next/server';
import { getTournamentState } from '@/lib/kv';
import { loadTeams } from '@/lib/tournament';
import { calculateStandings } from '@/lib/standings';

export async function GET() {
  try {
    const state = await getTournamentState();
    const teams = await loadTeams();
    const standings = calculateStandings(state.matches, teams);
    return NextResponse.json(standings);
  } catch (error) {
    console.error('Error fetching standings:', error);
    return NextResponse.json({ error: 'Failed to fetch standings' }, { status: 500 });
  }
}
