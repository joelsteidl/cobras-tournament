import { useEffect, useState } from 'react';
import { useMatches } from '@/hooks/useMatches';
import { useRealTimeSync } from '@/hooks/useRealTimeSync';
import { Team } from '@/types';
import { MatchCard } from '@/components/MatchCard';
import { AccordionItem } from '@/components/Accordion';

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

  return (
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-bold mb-6">Cobras Tournament</h1>

      <AccordionItem title="Round 1 (4:40 PM)" defaultOpen={true}>
        <div className="space-y-2">
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
        <div className="space-y-2">
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
        <div className="space-y-2">
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
