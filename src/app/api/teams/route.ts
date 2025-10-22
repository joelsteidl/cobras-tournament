import { NextRequest, NextResponse } from 'next/server';
import { loadTeams } from '@/lib/tournament';
import { kv } from '@vercel/kv';
import { Team } from '@/types';

const TEAMS_CACHE_KEY = 'cobras:teams';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'cobras2025';

export async function GET() {
  try {
    // Check KV first for overrides
    const teamsFromKV = await kv.get<Team[]>(TEAMS_CACHE_KEY);
    if (teamsFromKV) {
      return NextResponse.json(teamsFromKV);
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
    await kv.set(TEAMS_CACHE_KEY, teams);
    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error updating teams:', error);
    return NextResponse.json({ error: 'Failed to update teams' }, { status: 500 });
  }
}

