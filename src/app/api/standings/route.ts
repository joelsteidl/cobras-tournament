import { NextResponse } from 'next/server';
import { getTournamentState } from '@/lib/kv';
import { loadTeams } from '@/lib/tournament';
import { calculateStandings, isGroupStageComplete, autoPopulateSemiFinals, areSemiFinalsComplete, autoPopulateFinal } from '@/lib/standings';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function GET() {
  try {
    const initialState = await getTournamentState();
    const teams = await loadTeams();
    let wasModified = false;

    // Auto-populate semi-finals if group stage is complete
    if (isGroupStageComplete(initialState.matches)) {
      const standings = calculateStandings(initialState.matches, teams);
      const prevMatches = initialState.matches.length;
      initialState.matches = autoPopulateSemiFinals(initialState.matches, standings);
      if (initialState.matches.length > prevMatches) {
        wasModified = true;
      }
    }

    // Auto-populate final if semi-finals are complete
    if (areSemiFinalsComplete(initialState.matches)) {
      const prevMatches = initialState.matches.length;
      initialState.matches = autoPopulateFinal(initialState.matches);
      if (initialState.matches.length > prevMatches) {
        wasModified = true;
      }
    }

    // Save updated state back to Redis if changed
    initialState.lastUpdated = Date.now();
    await redis.set('cobras:tournament:state', initialState);

    // Broadcast sync event if playoffs were populated
    if (wasModified) {
      const syncEventUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/sync`;
      try {
        await fetch(syncEventUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'matches_updated',
            timestamp: initialState.lastUpdated,
          }),
        });
      } catch (syncError) {
        console.error('Error broadcasting sync event from standings:', syncError);
      }
    }

    const standings = calculateStandings(initialState.matches, teams);
    return NextResponse.json(standings);
  } catch (error) {
    console.error('Error fetching standings:', error);
    return NextResponse.json({ error: 'Failed to fetch standings' }, { status: 500 });
  }
}
