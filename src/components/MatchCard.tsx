'use client';

import { Match } from '@/types';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useTransition } from 'react';
import { getTeamFlag } from '@/lib/flags';

interface MatchCardProps {
  match: Match;
  teamNames: { [key: string]: string };
  onUpdateScore: (match: Match) => void;
}

export function MatchCard({ match, teamNames, onUpdateScore }: MatchCardProps) {
  const [goalsA, setGoalsA] = useState(match.goalsA ?? 0);
  const [goalsB, setGoalsB] = useState(match.goalsB ?? 0);
  const [scoreSet, setScoreSet] = useState(false);
  const [, startTransition] = useTransition();

  // Update local state when match prop changes (e.g., from real-time sync)
  useEffect(() => {
    startTransition(() => {
      setGoalsA(match.goalsA ?? 0);
      setGoalsB(match.goalsB ?? 0);
      setScoreSet(false);
    });
  }, [match.goalsA, match.goalsB, match.id]);

  const handleUpdateScore = () => {
    onUpdateScore({
      ...match,
      goalsA,
      goalsB,
      completed: true,
    });
    setScoreSet(false);
  };

  const isModified = scoreSet || goalsA !== (match.goalsA ?? 0) || goalsB !== (match.goalsB ?? 0);

  const handleGoalsAChange = (newValue: number) => {
    setGoalsA(newValue);
    setScoreSet(true);
  };

  const handleGoalsBChange = (newValue: number) => {
    setGoalsB(newValue);
    setScoreSet(true);
  };

  return (
    <div className="border-b border-slate-200 py-3 px-2 bg-white hover:bg-slate-50 transition-colors">
      <div className="mb-2">
        <p className="text-xs font-semibold text-slate-700 uppercase mb-1">Field {match.field} • {match.time}</p>
      </div>

      <div className="flex items-center justify-between gap-4">
        {/* Team A */}
        <div className="flex-1 text-center">
          <p className="font-bold text-sm mb-2 text-slate-900">{getTeamFlag(match.teamA)} {teamNames[match.teamA]}</p>
          <div className="flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleGoalsAChange(Math.max(0, goalsA - 1))}
              className="border-slate-300 text-slate-900 hover:bg-slate-100"
            >
              −
            </Button>
            <span className="text-3xl font-bold w-14 text-slate-900">{goalsA}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleGoalsAChange(goalsA + 1)}
              className="border-slate-300 text-slate-900 hover:bg-slate-100"
            >
              +
            </Button>
          </div>
        </div>

        {/* VS */}
        <div className="text-slate-600 font-bold text-lg">vs</div>

        {/* Team B */}
        <div className="flex-1 text-center">
          <p className="font-bold text-sm mb-2 text-slate-900">{getTeamFlag(match.teamB)} {teamNames[match.teamB]}</p>
          <div className="flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleGoalsBChange(Math.max(0, goalsB - 1))}
              className="border-slate-300 text-slate-900 hover:bg-slate-100"
            >
              −
            </Button>
            <span className="text-3xl font-bold w-14 text-slate-900">{goalsB}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleGoalsBChange(goalsB + 1)}
              className="border-slate-300 text-slate-900 hover:bg-slate-100"
            >
              +
            </Button>
          </div>
        </div>
      </div>

      {isModified && (
        <button
          onClick={handleUpdateScore}
          className="w-full mt-3 py-2 px-4 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-md text-sm transition-colors"
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
