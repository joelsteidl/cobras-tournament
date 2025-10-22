'use client';

import { useEffect } from 'react';

interface UpdateEvent {
  type: 'matches_updated' | 'teams_updated' | 'standings_updated';
  timestamp: number;
}

export function useRealTimeSync(callback: (event: UpdateEvent) => void) {
  useEffect(() => {
    // Poll the sync endpoint for updates
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/sync');
        if (!response.ok) return;
        const data = await response.json();
        if (data.event) {
          callback(data.event);
        }
      } catch (error) {
        console.error('Sync error:', error);
      }
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [callback]);
}
