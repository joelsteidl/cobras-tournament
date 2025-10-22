import { Redis } from '@upstash/redis';
import { Match, TournamentState } from '@/types';

const TOURNAMENT_KEY = 'cobras:tournament:state';

// Initialize Upstash Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function getTournamentState(): Promise<TournamentState> {
  try {
    const state = await redis.get<TournamentState>(TOURNAMENT_KEY);
    if (state) {
      return state;
    }
  } catch (error) {
    console.error('Error fetching tournament state from Redis:', error);
  }

  // Return empty state if not found
  return {
    matches: [],
    lastUpdated: Date.now(),
  };
}

export async function updateMatch(match: Match): Promise<void> {
  try {
    const state = await getTournamentState();

    // Find and update the match
    const existingIndex = state.matches.findIndex(m => m.id === match.id);
    if (existingIndex >= 0) {
      state.matches[existingIndex] = match;
    } else {
      state.matches.push(match);
    }

    state.lastUpdated = Date.now();

    await redis.set(TOURNAMENT_KEY, state);
  } catch (error) {
    console.error('Error updating match in Redis:', error);
    throw error;
  }
}

export async function resetMatches(): Promise<void> {
  try {
    await redis.del(TOURNAMENT_KEY);
  } catch (error) {
    console.error('Error resetting matches in Redis:', error);
    throw error;
  }
}
