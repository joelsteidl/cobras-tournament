'use client';

import { useEffect, useState } from 'react';
import { useRealTimeSync } from '@/hooks/useRealTimeSync';
import { Team } from '@/types';
import { getTeamFlag } from '@/lib/flags';

export function TeamsView() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/teams');
        if (!response.ok) throw new Error('Failed to fetch teams');
        const data = await response.json();
        setTeams(data);
      } catch (err) {
        console.error('Error fetching teams:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTeams();
  }, []);

  // Real-time sync
  useRealTimeSync((event) => {
    if (event.type === 'teams_updated') {
      const loadTeams = async () => {
        try {
          const response = await fetch('/api/teams');
          if (!response.ok) throw new Error('Failed to fetch teams');
          const data = await response.json();
          setTeams(data);
        } catch (err) {
          console.error('Error fetching teams:', err);
        }
      };
      loadTeams();
    }
  });

  if (loading) {
    return <div className="p-4 text-center">Loading teams...</div>;
  }

  return (
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-bold mb-6">Teams</h1>

      <div className="grid grid-cols-1 gap-4">
        {teams.map(team => (
          <div key={team.id} className="border-2 border-gray-300 rounded-lg p-4 bg-white shadow-md">
            <h2 className="text-xl font-bold mb-3 text-gray-900">{getTeamFlag(team.id)} {team.name}</h2>
            <ul className="space-y-2">
              {team.players.map((player, idx) => (
                <li key={idx} className="text-gray-900 text-sm flex items-center font-medium">
                  <span className="inline-block w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center mr-2">
                    {idx + 1}
                  </span>
                  {player.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
