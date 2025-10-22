import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const LAST_UPDATE_KEY = 'cobras:last-update';

interface SyncState {
  teamsVersion: number;
  matchesVersion: number;
  lastUpdated: number;
}

export async function GET() {
  try {
    // Get the current state version
    const state = await kv.get<SyncState>(LAST_UPDATE_KEY) || {
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
