'use client';

import { Match } from '@/types';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { getTeamFlag } from '@/lib/flags';

interface MatchCardProps {
  match: Match;
  teamNames: { [key: string]: string };
  onUpdateScore: (match: Match) => void;
}

export function MatchCard({ match, teamNames, onUpdateScore }: MatchCardProps) {
  const [goalsA, setGoalsA] = useState(match.goalsA ?? 0);
  const [goalsB, setGoalsB] = useState(match.goalsB ?? 0);

  const handleUpdateScore = () => {
    onUpdateScore({
      ...match,
      goalsA,
      goalsB,
      completed: true,
    });
  };

  const isModified = goalsA !== (match.goalsA ?? 0) || goalsB !== (match.goalsB ?? 0);

  return (
    <div className="border rounded-lg p-4 mb-3 bg-white shadow-sm">
      <div className="mb-3">
        <p className="text-xs text-gray-500 mb-1">Field {match.field} • {match.time}</p>
      </div>

      <div className="flex items-center justify-between gap-4">
        {/* Team A */}
        <div className="flex-1 text-center">
          <p className="font-bold text-sm mb-2 text-gray-900">{getTeamFlag(match.teamA)} {teamNames[match.teamA]}</p>
          <div className="flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setGoalsA(Math.max(0, goalsA - 1))}
              className="border-gray-400 text-gray-900 hover:bg-gray-100"
            >
              −
            </Button>
            <span className="text-3xl font-bold w-14 text-gray-900">{goalsA}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setGoalsA(goalsA + 1)}
              className="border-gray-400 text-gray-900 hover:bg-gray-100"
            >
              +
            </Button>
          </div>
        </div>

        {/* VS */}
        <div className="text-gray-600 font-bold text-lg">vs</div>

        {/* Team B */}
        <div className="flex-1 text-center">
          <p className="font-bold text-sm mb-2 text-gray-900">{getTeamFlag(match.teamB)} {teamNames[match.teamB]}</p>
          <div className="flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setGoalsB(Math.max(0, goalsB - 1))}
              className="border-gray-400 text-gray-900 hover:bg-gray-100"
            >
              −
            </Button>
            <span className="text-3xl font-bold w-14 text-gray-900">{goalsB}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setGoalsB(goalsB + 1)}
              className="border-gray-400 text-gray-900 hover:bg-gray-100"
            >
              +
            </Button>
          </div>
        </div>
      </div>

      {isModified && (
        <button
          onClick={handleUpdateScore}
          className="w-full mt-3 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-sm transition-colors"
        >
          Save Score
        </button>
      )}

      {match.completed && !isModified && (
        <div className="mt-3 text-center text-xs text-green-600 font-medium">
          ✓ Score saved
        </div>
      )}
    </div>
  );
}
