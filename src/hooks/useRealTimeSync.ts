'use client';

import { useEffect, useRef } from 'react';

interface UpdateEvent {
  type: 'matches_updated' | 'teams_updated' | 'standings_updated';
  timestamp: number;
}

export function useRealTimeSync(callback: (event: UpdateEvent) => void) {
  const lastSeenTimestamp = useRef<number>(0);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    // Poll the sync endpoint for updates
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/sync');
        if (!response.ok) {
          console.warn('[SYNC POLL] Non-OK response:', response.status);
          return;
        }
        const data = await response.json();
        
        if (!data.lastUpdated) {
          console.warn('[SYNC POLL] No lastUpdated in response');
          return;
        }

        // If we have a new timestamp, trigger the callback
        if (data.lastUpdated > lastSeenTimestamp.current) {
          console.log('[SYNC POLL] Detected update:', { 
            old: lastSeenTimestamp.current, 
            new: data.lastUpdated,
            diff: data.lastUpdated - lastSeenTimestamp.current
          });
          lastSeenTimestamp.current = data.lastUpdated;
          console.log('[SYNC POLL] Calling callback');
          callbackRef.current({
            type: 'matches_updated',
            timestamp: data.lastUpdated,
          });
        }
      } catch (error) {
        console.error('[SYNC POLL] Error:', error);
      }
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, []);
}
