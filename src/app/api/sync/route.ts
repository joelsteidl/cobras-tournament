import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const LAST_UPDATE_KEY = 'cobras:last-update';

// Initialize Upstash Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function GET() {
  try {
    // Get the current server update timestamp
    const serverUpdate = await redis.get<number>(LAST_UPDATE_KEY) || 0;
    console.log('[SYNC GET] Current timestamp in Redis:', serverUpdate);

    return NextResponse.json({ lastUpdated: serverUpdate });
  } catch (error) {
    console.error('Error fetching sync state:', error);
    return NextResponse.json({ lastUpdated: Date.now() }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, timestamp } = body as { type: string; timestamp: number };

    if (!type || !timestamp) {
      return NextResponse.json({ error: 'Missing type or timestamp' }, { status: 400 });
    }

    console.log('[SYNC POST] Updating timestamp:', { type, timestamp });

    // Update the timestamp to signal changes
    await redis.set(LAST_UPDATE_KEY, timestamp);
    console.log('[SYNC POST] Timestamp updated successfully');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error posting sync event:', error);
    return NextResponse.json({ error: 'Failed to post sync event' }, { status: 500 });
  }
}
