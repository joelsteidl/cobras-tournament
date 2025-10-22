import { kv } from '@vercel/kv';
import { Match, TournamentState } from '@/types';

const TOURNAMENT_KEY = 'cobras:tournament:state';

export async function getTournamentState(): Promise<TournamentState> {
  try {
    const state = await kv.get<TournamentState>(TOURNAMENT_KEY);
    if (state) {
      return state;
    }
  } catch (error) {
    console.error('Error fetching tournament state from KV:', error);
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

    await kv.set(TOURNAMENT_KEY, state);
  } catch (error) {
    console.error('Error updating match in KV:', error);
    throw error;
  }
}

export async function resetMatches(): Promise<void> {
  try {
    await kv.del(TOURNAMENT_KEY);
  } catch (error) {
    console.error('Error resetting matches in KV:', error);
    throw error;
  }
}
