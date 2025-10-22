'use client';

import { useState } from 'react';
import { useStandings } from '@/hooks/useStandings';
import { useRealTimeSync } from '@/hooks/useRealTimeSync';
import { getTeamFlag } from '@/lib/flags';

export function TableView() {
  const { standings, loading, refetch } = useStandings();
  const [refreshing, setRefreshing] = useState(false);

  // Real-time sync
  useRealTimeSync((event) => {
    if (event.type === 'matches_updated') {
      refetch();
    }
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (loading) {
    return <div className="p-4 text-center">Loading standings...</div>;
  }

  const top4 = standings.slice(0, 4);

  return (
    <div className="p-4 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Standings</h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 disabled:opacity-50 rounded transition-colors"
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Standings Table */}
      <div className="mb-8 bg-white border-2 border-gray-300 rounded-lg overflow-hidden shadow-md">
        <table className="w-full">
          <thead className="bg-blue-600 border-b-2 border-gray-300">
            <tr>
              <th className="px-4 py-3 text-left font-bold text-sm text-white">Rank</th>
              <th className="px-4 py-3 text-left font-bold text-sm text-white">Team</th>
              <th className="px-4 py-3 text-center font-bold text-sm text-white">P</th>
              <th className="px-4 py-3 text-center font-bold text-sm text-white">Pts</th>
              <th className="px-4 py-3 text-center font-bold text-sm text-white">GD</th>
              <th className="px-4 py-3 text-center font-bold text-sm text-white">GF</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((team, idx) => (
              <tr key={team.teamId} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-100 border-y border-gray-200'}>
                <td className="px-4 py-3 font-bold text-lg text-gray-900">{idx + 1}</td>
                <td className="px-4 py-3 font-bold text-gray-900">{getTeamFlag(team.teamId)} {team.teamName}</td>
                <td className="px-4 py-3 text-center text-gray-900 font-semibold">{team.played}</td>
                <td className="px-4 py-3 text-center font-bold text-lg text-blue-700">{team.points}</td>
                <td className="px-4 py-3 text-center text-gray-900 font-semibold">{team.goalDifference > 0 ? '+' : ''}{team.goalDifference}</td>
                <td className="px-4 py-3 text-center text-gray-900 font-semibold">{team.goalsFor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Finals Matchups */}
      <div className="bg-amber-100 border-2 border-amber-400 rounded-lg p-4">
        <h2 className="font-bold text-lg mb-4 text-gray-900">🏆 Finals (5:35 PM)</h2>

        {top4.length >= 4 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white border-2 border-gray-300 rounded font-semibold text-gray-900">
              <span>{getTeamFlag(top4[0]?.teamId)} {top4[0]?.teamName}</span>
              <span className="text-gray-600">vs</span>
              <span>{getTeamFlag(top4[1]?.teamId)} {top4[1]?.teamName}</span>
              <span className="text-xs text-gray-700 ml-2 font-normal">Field 1</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white border-2 border-gray-300 rounded font-semibold text-gray-900">
              <span>{getTeamFlag(top4[2]?.teamId)} {top4[2]?.teamName}</span>
              <span className="text-gray-600">vs</span>
              <span>{getTeamFlag(top4[3]?.teamId)} {top4[3]?.teamName}</span>
              <span className="text-xs text-gray-700 ml-2 font-normal">Field 2</span>
            </div>
          </div>
        ) : (
          <p className="text-gray-900 text-sm font-medium">Complete matches to generate finals matchups</p>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 text-sm text-gray-900 space-y-1 font-medium">
        <p>P = Played • Pts = Points (Win: 3, Draw: 1, Loss: 0)</p>
        <p>GD = Goal Difference • GF = Goals For</p>
      </div>
    </div>
  );
}
