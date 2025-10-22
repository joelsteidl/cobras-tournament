import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
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

  // Handle real-time sync events
  const handleSyncEvent = useCallback((event: { type: string; timestamp: number }) => {
    console.log('[HomeView] Sync event received:', event);
    if (event.type === 'matches_updated') {
      console.log('[HomeView] Calling refetch(true)');
      // Refetch matches silently to avoid loading flash
      refetch(true);
    } else if (event.type === 'teams_updated') {
      console.log('[HomeView] Refetching teams');
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
  }, [refetch]);

  // Real-time sync
  useRealTimeSync(handleSyncEvent);

  if (loading) {
    return <div className="p-4 text-center">Loading matches...</div>;
  }

  if (!matches.length) {
    return <div className="p-4 text-center">No matches found</div>;
  }

  const round1 = matches.filter(m => m.round === 'round1');
  const round2 = matches.filter(m => m.round === 'round2');
  const round3 = matches.filter(m => m.round === 'round3');
  const semiFinals = matches.filter(m => m.round === 'semifinals');
  const finals = matches.filter(m => m.round === 'finals');

  // Check if group stage is complete for auto-expanding semi-finals
  const groupMatches = matches.filter(m => m.round === 'round1' || m.round === 'round2' || m.round === 'round3');
  const isGroupStageComplete = groupMatches.length === 9 && groupMatches.every(m =>
    m.completed && m.goalsA !== undefined && m.goalsB !== undefined
  );
  const areSemiFinalsPopulated = semiFinals.some(m => m.teamA !== 'tbd' || m.teamB !== 'tbd');
  const shouldOpenSemiFinals = isGroupStageComplete && areSemiFinalsPopulated;

  // Check if semi-finals are complete for auto-expanding finals
  const areSemiFinalsComplete = semiFinals.length === 2 && semiFinals.every(m =>
    m.completed && m.goalsA !== undefined && m.goalsB !== undefined
  );
  const areFinalsPopulated = finals.some(m => m.teamA !== 'tbd' || m.teamB !== 'tbd');
  const shouldOpenFinals = areSemiFinalsComplete && areFinalsPopulated;

  return (
    <div className="p-4 pb-24">
      <div className="flex justify-center mb-4">
        <Image src="/logo.png" alt="Cobras Logo" width={180} height={180} />
      </div>

      <AccordionItem title="Round 1 (4:40 PM)" defaultOpen={true}>
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

      <AccordionItem title="Round 2 (4:45 PM)">
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

      <AccordionItem title="Round 3 (4:50 PM)">
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

      <AccordionItem title="Semi-Finals (5:05 PM)" defaultOpen={shouldOpenSemiFinals}>
        <div className="space-y-3">
          {semiFinals.length > 0 ? (
            semiFinals.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                teamNames={teamNames}
                onUpdateScore={updateMatch}
              />
            ))
          ) : (
            <p className="text-sm text-gray-600">Complete group stage to populate semi-finals</p>
          )}
        </div>
      </AccordionItem>

      <AccordionItem title="Final (5:20 PM)" defaultOpen={shouldOpenFinals}>
        <div className="space-y-3">
          {finals.length > 0 ? (
            finals.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                teamNames={teamNames}
                onUpdateScore={updateMatch}
              />
            ))
          ) : (
            <p className="text-sm text-gray-600">Complete semi-finals to populate final</p>
          )}
        </div>
      </AccordionItem>
    </div>
  );
}
