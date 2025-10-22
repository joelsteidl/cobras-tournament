import { Redis } from '@upstash/redis';
import { Match, TournamentState } from '@/types';
import { autoPopulateSemiFinals, autoPopulateFinal, isGroupStageComplete, areSemiFinalsComplete, calculateStandings } from './standings';
import { loadTeams } from './tournament';

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

    // Auto-populate playoffs if conditions are met
    if (isGroupStageComplete(state.matches)) {
      // Load teams to calculate standings
      const teams = await loadTeams();
      const standings = calculateStandings(state.matches, teams);

      // Auto-populate semi-finals
      state.matches = autoPopulateSemiFinals(state.matches, standings);
    }

    // Auto-populate final if semi-finals are complete
    if (areSemiFinalsComplete(state.matches)) {
      state.matches = autoPopulateFinal(state.matches);
    }

    state.lastUpdated = Date.now();

    await redis.set(TOURNAMENT_KEY, state);

    // Update the sync timestamp separately - this is what clients poll
    const LAST_UPDATE_KEY = 'cobras:last-update';
    await redis.set(LAST_UPDATE_KEY, state.lastUpdated);

    console.log('[KV] Updated match and sync timestamp:', state.lastUpdated);
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
