import { useEffect, useState } from 'react';
import { useMatches } from '@/hooks/useMatches';
import { useRealTimeSync } from '@/hooks/useRealTimeSync';
import { Team, Match } from '@/types';
import { MatchCard } from '@/components/MatchCard';
import { AccordionItem } from '@/components/Accordion';
import { getTeamFlag } from '@/lib/flags';

interface RestingTeamsBadgeProps {
  teams: string[];
  teamNames: { [key: string]: string };
}

function RestingTeamsBadge({ teams, teamNames }: RestingTeamsBadgeProps) {
  return (
    <div className="bg-gray-100 text-gray-700 rounded-lg p-2 mb-4 border border-gray-300">
      <p className="text-xs font-semibold mb-1 text-gray-600">Resting: {teams.map(team => `${getTeamFlag(team)} ${teamNames[team] || team}`).join(', ')}</p>
    </div>
  );
}

function getRestingTeams(matches: Match[], round: 'round1' | 'round2' | 'round3'): string[] {
  const allTeams = ['argentina', 'brazil', 'england', 'france', 'germany', 'portugal', 'spain'];
  
  const roundMatches = matches.filter(m => m.round === round);
  
  // Get all teams playing in this round
  const playingTeams = new Set<string>();
  roundMatches.forEach(match => {
    playingTeams.add(match.teamA);
    playingTeams.add(match.teamB);
  });
  
  // Return teams not playing
  return allTeams.filter(team => !playingTeams.has(team));
}

export function HomeView() {
  const { matches, loading, updateMatch, refetch } = useMatches();
  const [teamNames, setTeamNames] = useState<{ [key: string]: string }>({});

  // Load team names on mount
  useEffect(() => {
    const loadTeamNames = async () => {
      try {
        const response = await fetch('/api/teams');
        const teams: Team[] = await response.json();
        const names: { [key: string]: string } = {};
        teams.forEach((t: Team) => {
          names[t.id] = t.name;
        });
        setTeamNames(names);
      } catch (error) {
        console.error('Error loading team names:', error);
      }
    };

    loadTeamNames();
  }, []);

  // Real-time sync
  useRealTimeSync((event) => {
    if (event.type === 'matches_updated') {
      refetch();
    } else if (event.type === 'teams_updated') {
      const loadTeamNames = async () => {
        try {
          const response = await fetch('/api/teams');
          const teams: Team[] = await response.json();
          const names: { [key: string]: string } = {};
          teams.forEach((t: Team) => {
            names[t.id] = t.name;
          });
          setTeamNames(names);
        } catch (error) {
          console.error('Error loading team names:', error);
        }
      };
      loadTeamNames();
    }
  });

  if (loading) {
    return <div className="p-4 text-center">Loading matches...</div>;
  }

  if (!matches.length) {
    return <div className="p-4 text-center">No matches found</div>;
  }

  const round1 = matches.filter(m => m.round === 'round1');
  const round2 = matches.filter(m => m.round === 'round2');
  const round3 = matches.filter(m => m.round === 'round3');

  const restingRound1 = getRestingTeams(matches, 'round1');
  const restingRound2 = getRestingTeams(matches, 'round2');
  const restingRound3 = getRestingTeams(matches, 'round3');

  return (
    <div className="p-4 pb-24">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Cobras Tournament</h1>

      <AccordionItem title="Round 1 (4:40 PM)" defaultOpen={true}>
        {restingRound1.length > 0 && <RestingTeamsBadge teams={restingRound1} teamNames={teamNames} />}
        <div className="space-y-3">
          {round1.map(match => (
            <MatchCard
              key={match.id}
              match={match}
              teamNames={teamNames}
              onUpdateScore={updateMatch}
            />
          ))}
        </div>
      </AccordionItem>

      <AccordionItem title="Round 2 (5:05 PM)">
        {restingRound2.length > 0 && <RestingTeamsBadge teams={restingRound2} teamNames={teamNames} />}
        <div className="space-y-3">
          {round2.map(match => (
            <MatchCard
              key={match.id}
              match={match}
              teamNames={teamNames}
              onUpdateScore={updateMatch}
            />
          ))}
        </div>
      </AccordionItem>

      <AccordionItem title="Round 3 (5:20 PM)">
        {restingRound3.length > 0 && <RestingTeamsBadge teams={restingRound3} teamNames={teamNames} />}
        <div className="space-y-3">
          {round3.map(match => (
            <MatchCard
              key={match.id}
              match={match}
              teamNames={teamNames}
              onUpdateScore={updateMatch}
            />
          ))}
        </div>
      </AccordionItem>
    </div>
  );
}
