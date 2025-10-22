import { NextRequest, NextResponse } from 'next/server';
import { loadTeams } from '@/lib/tournament';
import { Redis } from '@upstash/redis';
import { Team } from '@/types';

const TEAMS_CACHE_KEY = 'cobras:teams';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'cobras2025';

// Initialize Upstash Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function GET() {
  try {
    // Check Upstash Redis first for overrides
    const teamsFromRedis = await redis.get<Team[]>(TEAMS_CACHE_KEY);
    if (teamsFromRedis) {
      return NextResponse.json(teamsFromRedis);
    }

    // Fall back to YAML
    const teams = await loadTeams();
    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('x-admin-token');
    if (token !== ADMIN_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teams: Team[] = await request.json();
    await redis.set(TEAMS_CACHE_KEY, teams);
    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error updating teams:', error);
    return NextResponse.json({ error: 'Failed to update teams' }, { status: 500 });
  }
}

