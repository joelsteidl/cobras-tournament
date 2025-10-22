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
        if (!response.ok) return;
        const data = await response.json();

        // If we have a new timestamp, trigger the callback
        if (data.lastUpdated && data.lastUpdated > lastSeenTimestamp.current) {
          console.log('[SYNC] Detected update:', { old: lastSeenTimestamp.current, new: data.lastUpdated });
          lastSeenTimestamp.current = data.lastUpdated;
          // Assume any update is a matches_updated event (could be extended to track type)
          console.log('[SYNC] Calling callback with matches_updated');
          callbackRef.current({
            type: 'matches_updated',
            timestamp: data.lastUpdated,
          });
        }
      } catch (error) {
        console.error('Sync error:', error);
      }
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, []);
}
