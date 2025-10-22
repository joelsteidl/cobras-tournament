import { NextRequest, NextResponse } from 'next/server';
import { getTournamentState, updateMatch } from '@/lib/kv';
import { loadTeams, generateSchedule } from '@/lib/tournament';
import { isGroupStageComplete, autoPopulateSemiFinals, areSemiFinalsComplete, autoPopulateFinal, calculateStandings } from '@/lib/standings';
import { Redis } from '@upstash/redis';
import { Match } from '@/types';

// Initialize Upstash Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function GET() {
  try {
    const initialState = await getTournamentState();
    let wasModified = false;

    // If no matches exist, generate them
    if (initialState.matches.length === 0) {
      await loadTeams(); // Ensure teams can be loaded
      const matches = generateSchedule();
      initialState.matches = matches;
      initialState.lastUpdated = Date.now();

      // Save to Upstash Redis
      await redis.set('cobras:tournament:state', initialState);
      wasModified = true;
    }

    // Auto-populate semi-finals if group stage is complete
    if (isGroupStageComplete(initialState.matches)) {
      const teams = await loadTeams();
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

    // Save updated state back to Redis if playoffs were populated
    initialState.lastUpdated = Date.now();
    await redis.set('cobras:tournament:state', initialState);

    // Broadcast sync event if modified
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
        console.error('Error broadcasting sync event from matches:', syncError);
      }
    }

    return NextResponse.json(initialState.matches);
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
