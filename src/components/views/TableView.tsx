'use client';

import { useState, useEffect } from 'react';
import { useStandings } from '@/hooks/useStandings';
import { useRealTimeSync } from '@/hooks/useRealTimeSync';
import { useMatches } from '@/hooks/useMatches';
import { getTeamFlag } from '@/lib/flags';

export function TableView() {
  const { standings, loading, refetch } = useStandings();
  const { matches, refetch: refetchMatches } = useMatches();
  const [champion, setChampion] = useState<{ teamId: string; teamName: string } | null>(null);

  // Check for finals match completion
  useEffect(() => {
    const finalsMatch = matches.find(m => m.round === 'finals');
    if (finalsMatch && finalsMatch.completed && finalsMatch.goalsA !== undefined && finalsMatch.goalsB !== undefined) {
      const winner = finalsMatch.goalsA > finalsMatch.goalsB ? finalsMatch.teamA : finalsMatch.teamB;
      const winnerTeam = standings.find(s => s.teamId === winner);
      if (winnerTeam) {
        setChampion({ teamId: winnerTeam.teamId, teamName: winnerTeam.teamName });
      }
    } else {
      setChampion(null);
    }
  }, [matches, standings]);

  // Get semi-finals and finals data
  const semiFinals = matches.filter(m => m.round === 'semifinals');
  const finalsMatch = matches.find(m => m.round === 'finals');

  // Get semi-final winners
  const sf1Winner = semiFinals.length > 0 && semiFinals[0] && semiFinals[0]?.completed && semiFinals[0]?.goalsA !== undefined && semiFinals[0]?.goalsB !== undefined
    ? (semiFinals[0].goalsA > semiFinals[0].goalsB ? semiFinals[0].teamA : semiFinals[0].teamB)
    : null;
  const sf2Winner = semiFinals.length > 1 && semiFinals[1] && semiFinals[1]?.completed && semiFinals[1]?.goalsA !== undefined && semiFinals[1]?.goalsB !== undefined
    ? (semiFinals[1].goalsA > semiFinals[1].goalsB ? semiFinals[1].teamA : semiFinals[1].teamB)
    : null;

  // Get finals loser
  const finalsLoser = finalsMatch && finalsMatch.completed && finalsMatch.goalsA !== undefined && finalsMatch.goalsB !== undefined
    ? (finalsMatch.goalsA > finalsMatch.goalsB ? finalsMatch.teamB : finalsMatch.teamA)
    : null;

  // Helper to get team name from ID
  const getTeamName = (teamId: string | undefined) => {
    if (!teamId || teamId === 'tbd') return 'TBD';
    return standings.find(s => s.teamId === teamId)?.teamName || teamId;
  };

  // Real-time sync
  useRealTimeSync((event) => {
    if (event.type === 'matches_updated') {
      // Silently refetch both standings and matches to avoid UI flash
      refetch(true);
      refetchMatches(true);
    }
  });

  if (loading) {
    return <div className="p-4 text-center">Loading standings...</div>;
  }

  const top4 = standings.slice(0, 4);

  return (
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-black text-slate-950 mb-6">Standings</h1>

      {/* Champion Banner */}
      {champion && (
        <div className="mb-6 p-4 bg-gradient-to-r from-amber-300 to-amber-100 border-3 border-amber-600 rounded-lg shadow-lg text-center">
          <p className="text-sm font-semibold text-amber-950 mb-2">🏆 CHAMPION 🏆</p>
          <p className="text-3xl font-black text-amber-950">{getTeamFlag(champion.teamId)} {champion.teamName}</p>
        </div>
      )}

      {/* Standings Table */}
      <div className="mb-8 bg-white border border-slate-300 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 border-b border-slate-300">
            <tr>
              <th className="px-2 py-3 text-left font-bold text-xs text-white">Rank</th>
              <th className="px-2 py-3 text-left font-bold text-xs text-white">Team</th>
              <th className="px-2 py-3 text-center font-bold text-xs text-white">W</th>
              <th className="px-2 py-3 text-center font-bold text-xs text-white">D</th>
              <th className="px-2 py-3 text-center font-bold text-xs text-white">L</th>
              <th className="px-2 py-3 text-center font-bold text-xs text-white">Pts</th>
              <th className="px-2 py-3 text-center font-bold text-xs text-white">GD</th>
              <th className="px-2 py-3 text-center font-bold text-xs text-white">GF</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((team, idx) => (
              <tr key={team.teamId} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50 border-y border-slate-200'}>
                <td className="px-2 py-3 font-bold text-slate-900">
                  <div className="flex items-center justify-center w-8 h-8 bg-slate-800 text-white rounded-full font-bold text-sm">
                    {idx + 1}
                  </div>
                </td>
                <td className="px-2 py-3 font-bold text-slate-900 whitespace-nowrap">{getTeamFlag(team.teamId)} {team.teamName}</td>
                <td className="px-2 py-3 text-center text-slate-900 font-semibold">{team.wins}</td>
                <td className="px-2 py-3 text-center text-slate-900 font-semibold">{team.draws}</td>
                <td className="px-2 py-3 text-center text-slate-900 font-semibold">{team.losses}</td>
                <td className="px-2 py-3 text-center font-bold text-amber-600">{team.points}</td>
                <td className="px-2 py-3 text-center text-slate-900 font-semibold">{team.goalDifference > 0 ? '+' : ''}{team.goalDifference}</td>
                <td className="px-2 py-3 text-center text-slate-900 font-semibold">{team.goalsFor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Finals Matchups / Semi-Finals Bracket */}
      <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-6">
        <h2 className="font-bold text-lg mb-4 text-slate-900">🏆 Playoffs Structure</h2>

        {top4.length >= 4 ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-800 mb-3">Semi-Finals (5:05 PM - 2 Fields)</p>
              <div className="space-y-2">
                {/* SF1 */}
                <div className="flex items-center justify-between p-3 bg-white border border-slate-300 rounded font-semibold text-slate-900">
                  <span className={sf1Winner && semiFinals[0]?.teamA !== sf1Winner ? 'line-through text-slate-500' : ''}>
                    SF1: {getTeamFlag(semiFinals[0]?.teamA)} {getTeamName(semiFinals[0]?.teamA)}
                  </span>
                  <span className="text-slate-600">vs</span>
                  <span className={sf1Winner && semiFinals[0]?.teamB !== sf1Winner ? 'line-through text-slate-500' : ''}>
                    {getTeamFlag(semiFinals[0]?.teamB)} {getTeamName(semiFinals[0]?.teamB)}
                  </span>
                </div>
                {/* SF2 */}
                <div className="flex items-center justify-between p-3 bg-white border border-slate-300 rounded font-semibold text-slate-900">
                  <span className={sf2Winner && semiFinals[1]?.teamA !== sf2Winner ? 'line-through text-slate-500' : ''}>
                    SF2: {getTeamFlag(semiFinals[1]?.teamA)} {getTeamName(semiFinals[1]?.teamA)}
                  </span>
                  <span className="text-slate-600">vs</span>
                  <span className={sf2Winner && semiFinals[1]?.teamB !== sf2Winner ? 'line-through text-slate-500' : ''}>
                    {getTeamFlag(semiFinals[1]?.teamB)} {getTeamName(semiFinals[1]?.teamB)}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-300 pt-4">
              <p className="text-sm font-semibold text-slate-800 mb-3">Final (5:20 PM)</p>
              {sf1Winner && sf2Winner ? (
                <div className="p-3 bg-gradient-to-r from-amber-100 to-amber-50 border border-amber-400 rounded font-semibold text-slate-900 text-center">
                  <span className={finalsLoser === sf1Winner ? 'line-through text-slate-500' : ''}>
                    {getTeamFlag(sf1Winner)} {getTeamName(sf1Winner)}
                  </span>
                  <span className="mx-3">vs</span>
                  <span className={finalsLoser === sf2Winner ? 'line-through text-slate-500' : ''}>
                    {getTeamFlag(sf2Winner)} {getTeamName(sf2Winner)}
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-gradient-to-r from-amber-100 to-amber-50 border border-amber-400 rounded font-semibold text-slate-900 text-center">
                  Winners of SF1 vs Winners of SF2
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-slate-900 text-sm font-medium">Complete group stage to generate semi-finals bracket</p>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 text-sm text-slate-900 space-y-1 font-medium">
        <p>W = Wins • D = Draws • L = Losses • Pts = Points (Win: 3, Draw: 1, Loss: 0)</p>
        <p>GD = Goal Difference • GF = Goals For</p>
      </div>
    </div>
  );
}
