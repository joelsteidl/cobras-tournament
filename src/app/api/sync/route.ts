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
    const serverUpdate = await redis.get<number>(LAST_UPDATE_KEY);
    console.log('[SYNC GET] Retrieved timestamp from Redis:', serverUpdate);

    return NextResponse.json({ lastUpdated: serverUpdate || 0 });
  } catch (error) {
    console.error('[SYNC GET] Error fetching sync state:', error);
    // Return current time as fallback
    return NextResponse.json({ lastUpdated: Date.now() }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { timestamp } = body as { timestamp: number };

    if (!timestamp) {
      console.warn('[SYNC POST] Missing timestamp in request');
      return NextResponse.json({ error: 'Missing timestamp' }, { status: 400 });
    }

    console.log('[SYNC POST] Setting timestamp in Redis:', timestamp);
    
    // Update the timestamp to signal changes
    await redis.set(LAST_UPDATE_KEY, timestamp);
    console.log('[SYNC POST] Timestamp set successfully');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[SYNC POST] Error posting sync event:', error);
    return NextResponse.json({ error: 'Failed to post sync event' }, { status: 500 });
  }
}