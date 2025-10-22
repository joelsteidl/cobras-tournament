'use client';

import { useState, useEffect, useCallback } from 'react';
import { Standings } from '@/types';

const CACHE_KEY = 'cobras:standings';

export function useStandings() {
  const [standings, setStandings] = useState<Standings[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStandings = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      const response = await fetch('/api/standings');
      if (!response.ok) throw new Error('Failed to fetch standings');
      const data = await response.json();
      setStandings(data);
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('Error fetching standings:', err);
      // Try to use cached
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          setStandings(JSON.parse(cached));
        } catch (e) {
          console.error('Failed to parse cached standings:', e);
        }
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchStandings();
  }, [fetchStandings]);

  return { standings, loading, refetch: fetchStandings };
}
