'use client';

import { useState, useEffect, useCallback } from 'react';
import { Match } from '@/types';

const CACHE_KEY = 'cobras:matches';

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/matches');
      if (!response.ok) throw new Error('Failed to fetch matches');
      const data = await response.json();
      setMatches(data);
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const data = JSON.parse(cached);
        setMatches(data);
      } catch (e) {
        console.error('Failed to parse cached matches:', e);
      }
    }

    // Fetch from server
    fetchMatches();
  }, [fetchMatches]);

  const updateMatch = useCallback(async (match: Match) => {
    try {
      // Optimistic update
      const newMatches = matches.map(m => m.id === match.id ? match : m);
      setMatches(newMatches);
      localStorage.setItem(CACHE_KEY, JSON.stringify(newMatches));

      // Send to server
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(match),
      });

      if (!response.ok) throw new Error('Failed to update match');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Refetch to get the correct state
      fetchMatches();
    }
  }, [matches, fetchMatches]);

  return { matches, loading, error, updateMatch, refetch: fetchMatches };
}
