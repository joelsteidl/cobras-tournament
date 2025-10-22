import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const LAST_UPDATE_KEY = 'cobras:last-update';

interface SyncState {
  teamsVersion: number;
  matchesVersion: number;
  lastUpdated: number;
}

// Initialize Upstash Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function GET() {
  try {
    // Get the current state version
    const state = await redis.get<SyncState>(LAST_UPDATE_KEY) || {
      teamsVersion: 0,
      matchesVersion: 0,
      lastUpdated: Date.now(),
    };

    return NextResponse.json(state);
  } catch (error) {
    console.error('Error fetching sync state:', error);
    return NextResponse.json({ error: 'Failed to fetch sync state' }, { status: 500 });
  }
}
