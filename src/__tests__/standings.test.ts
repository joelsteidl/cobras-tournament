import { describe, it, expect, beforeEach } from 'vitest';
import { calculateStandings, getFinalsMatchups, isGroupStageComplete, autoPopulateSemiFinals, areSemiFinalsComplete, autoPopulateFinal } from '@/lib/standings';
import { Match, Team } from '@/types';

describe('Tournament Standings & Playoffs', () => {
  let mockTeams: Team[];

  beforeEach(() => {
    mockTeams = [
      { id: 'argentina', name: 'Argentina', players: [{ name: 'Player 1' }, { name: 'Player 2' }, { name: 'Player 3' }] },
      { id: 'brazil', name: 'Brazil', players: [{ name: 'Player 1' }, { name: 'Player 2' }, { name: 'Player 3' }] },
      { id: 'england', name: 'England', players: [{ name: 'Player 1' }, { name: 'Player 2' }, { name: 'Player 3' }] },
      { id: 'france', name: 'France', players: [{ name: 'Player 1' }, { name: 'Player 2' }, { name: 'Player 3' }] },
      { id: 'germany', name: 'Germany', players: [{ name: 'Player 1' }, { name: 'Player 2' }, { name: 'Player 3' }] },
      { id: 'portugal', name: 'Portugal', players: [{ name: 'Player 1' }, { name: 'Player 2' }, { name: 'Player 3' }] },
    ];
  });

  describe('calculateStandings()', () => {
    it('should calculate correct standings with wins, draws, and losses', () => {
      const matches: Match[] = [
        { id: 'match1', round: 'round1', field: 1, time: '4:40 PM', teamA: 'argentina', teamB: 'brazil', goalsA: 2, goalsB: 1, completed: true },
        { id: 'match2', round: 'round1', field: 2, time: '4:40 PM', teamA: 'england', teamB: 'france', goalsA: 1, goalsB: 1, completed: true },
        { id: 'match3', round: 'round1', field: 3, time: '4:40 PM', teamA: 'germany', teamB: 'portugal', goalsA: 1, goalsB: 0, completed: true },
      ];

      const standings = calculateStandings(matches, mockTeams);

      // Argentina won (2-1), Germany won (1-0), England drew (1-1)
      // Argentina has 3 points with +1 goal diff
      // Germany has 3 points with +1 goal diff
      // But Argentina scored 2 goals vs Germany's 1 goal, so Argentina ranks higher
      expect(standings[0].teamId).toBe('argentina');
      expect(standings[0].points).toBe(3);
      expect(standings[0].wins).toBe(1);
      expect(standings[0].losses).toBe(0);
      expect(standings[0].goalsFor).toBe(2);

      const england = standings.find(s => s.teamId === 'england');
      const france = standings.find(s => s.teamId === 'france');
      expect(england?.points).toBe(1);
      expect(england?.draws).toBe(1);
      expect(france?.points).toBe(1);
      expect(france?.draws).toBe(1);

      const brazil = standings.find(s => s.teamId === 'brazil');
      expect(brazil?.points).toBe(0);
      expect(brazil?.losses).toBe(1);

      const germany = standings.find(s => s.teamId === 'germany');
      expect(germany?.points).toBe(3);
      expect(germany?.goalsFor).toBe(1);
    });

    it('should sort by points descending', () => {
      const matches: Match[] = [
        { id: 'm1', round: 'round1', field: 1, time: '4:40 PM', teamA: 'argentina', teamB: 'brazil', goalsA: 1, goalsB: 0, completed: true },
        { id: 'm2', round: 'round1', field: 2, time: '4:40 PM', teamA: 'england', teamB: 'france', goalsA: 0, goalsB: 0, completed: true },
        { id: 'm3', round: 'round1', field: 3, time: '4:40 PM', teamA: 'germany', teamB: 'portugal', goalsA: 2, goalsB: 1, completed: true },
      ];

      const standings = calculateStandings(matches, mockTeams);

      expect(standings[0].points).toBe(3);
      expect(standings[1].points).toBe(3);
      expect(standings[2].points).toBe(1);
    });

    it('should use goal difference as tiebreaker', () => {
      const matches: Match[] = [
        { id: 'm1', round: 'round1', field: 1, time: '4:40 PM', teamA: 'argentina', teamB: 'brazil', goalsA: 5, goalsB: 0, completed: true },
        { id: 'm2', round: 'round1', field: 2, time: '4:40 PM', teamA: 'england', teamB: 'france', goalsA: 1, goalsB: 0, completed: true },
        { id: 'm3', round: 'round1', field: 3, time: '4:40 PM', teamA: 'germany', teamB: 'portugal', goalsA: 0, goalsB: 0, completed: true },
      ];

      const standings = calculateStandings(matches, mockTeams);

      expect(standings[0].teamId).toBe('argentina');
      expect(standings[0].goalDifference).toBe(5);
      expect(standings[1].teamId).toBe('england');
      expect(standings[1].goalDifference).toBe(1);
    });

    it('should use goals for as secondary tiebreaker', () => {
      const matches: Match[] = [
        { id: 'm1', round: 'round1', field: 1, time: '4:40 PM', teamA: 'argentina', teamB: 'brazil', goalsA: 3, goalsB: 1, completed: true },
        { id: 'm2', round: 'round1', field: 2, time: '4:40 PM', teamA: 'england', teamB: 'france', goalsA: 2, goalsB: 0, completed: true },
        { id: 'm3', round: 'round1', field: 3, time: '4:40 PM', teamA: 'germany', teamB: 'portugal', goalsA: 0, goalsB: 0, completed: true },
      ];

      const standings = calculateStandings(matches, mockTeams);

      expect(standings[0].teamId).toBe('argentina');
      expect(standings[0].goalsFor).toBe(3);
      expect(standings[1].teamId).toBe('england');
      expect(standings[1].goalsFor).toBe(2);
    });

    it('should handle 0-0 draws correctly', () => {
      const matches: Match[] = [
        { id: 'm1', round: 'round1', field: 1, time: '4:40 PM', teamA: 'argentina', teamB: 'brazil', goalsA: 0, goalsB: 0, completed: true },
      ];

      const standings = calculateStandings(matches, mockTeams);

      const argentina = standings.find(s => s.teamId === 'argentina');
      const brazil = standings.find(s => s.teamId === 'brazil');

      expect(argentina?.points).toBe(1);
      expect(argentina?.draws).toBe(1);
      expect(argentina?.goalDifference).toBe(0);
      expect(brazil?.points).toBe(1);
      expect(brazil?.draws).toBe(1);
    });

    it('should not count incomplete matches in standings', () => {
      const matches: Match[] = [
        { id: 'm1', round: 'round1', field: 1, time: '4:40 PM', teamA: 'argentina', teamB: 'brazil', goalsA: 2, goalsB: 1, completed: true },
        { id: 'm2', round: 'round1', field: 2, time: '4:40 PM', teamA: 'england', teamB: 'france', goalsA: 1, goalsB: 1, completed: false },
        { id: 'm3', round: 'round1', field: 3, time: '4:40 PM', teamA: 'germany', teamB: 'portugal', completed: false },
      ];

      const standings = calculateStandings(matches, mockTeams);

      const england = standings.find(s => s.teamId === 'england');
      const france = standings.find(s => s.teamId === 'france');
      const germany = standings.find(s => s.teamId === 'germany');
      const portugal = standings.find(s => s.teamId === 'portugal');

      expect(england?.played).toBe(0);
      expect(france?.played).toBe(0);
      expect(germany?.played).toBe(0);
      expect(portugal?.played).toBe(0);
    });
  });

  describe('getFinalsMatchups()', () => {
    it('should return top 4 teams for finals', () => {
      const standings = [
        { teamId: 'argentina', teamName: 'Argentina', played: 3, wins: 3, draws: 0, losses: 0, goalsFor: 9, goalsAgainst: 0, goalDifference: 9, points: 9 },
        { teamId: 'brazil', teamName: 'Brazil', played: 3, wins: 2, draws: 0, losses: 1, goalsFor: 6, goalsAgainst: 2, goalDifference: 4, points: 6 },
        { teamId: 'england', teamName: 'England', played: 3, wins: 2, draws: 0, losses: 1, goalsFor: 5, goalsAgainst: 3, goalDifference: 2, points: 6 },
        { teamId: 'france', teamName: 'France', played: 3, wins: 1, draws: 0, losses: 2, goalsFor: 4, goalsAgainst: 6, goalDifference: -2, points: 3 },
        { teamId: 'germany', teamName: 'Germany', played: 3, wins: 0, draws: 2, losses: 1, goalsFor: 2, goalsAgainst: 7, goalDifference: -5, points: 2 },
        { teamId: 'portugal', teamName: 'Portugal', played: 3, wins: 0, draws: 0, losses: 3, goalsFor: 1, goalsAgainst: 9, goalDifference: -8, points: 0 },
      ];

      const matchups = getFinalsMatchups(standings);

      expect(matchups).toHaveLength(4);
      expect(matchups[0].rank).toBe(1);
      expect(matchups[0].team.teamId).toBe('argentina');
      expect(matchups[3].rank).toBe(4);
      expect(matchups[3].team.teamId).toBe('france');
    });
  });

  describe('isGroupStageComplete()', () => {
    it('should return true when all 9 group matches are completed with scores', () => {
      const rounds: Array<'round1' | 'round2' | 'round3'> = ['round1', 'round1', 'round1', 'round2', 'round2', 'round2', 'round3', 'round3', 'round3'];
      const matches: Match[] = Array.from({ length: 9 }, (_, i) => ({
        id: `match${i}`,
        round: rounds[i],
        field: (i % 3) + 1,
        time: '4:40 PM',
        teamA: mockTeams[i % 6].id,
        teamB: mockTeams[(i + 1) % 6].id,
        goalsA: 1,
        goalsB: 0,
        completed: true,
      }));

      expect(isGroupStageComplete(matches)).toBe(true);
    });

    it('should return false if any group match is not completed', () => {
      const rounds: Array<'round1' | 'round2' | 'round3'> = ['round1', 'round1', 'round1', 'round2', 'round2', 'round2', 'round3', 'round3', 'round3'];
      const matches: Match[] = Array.from({ length: 9 }, (_, i) => ({
        id: `match${i}`,
        round: rounds[i],
        field: (i % 3) + 1,
        time: '4:40 PM',
        teamA: mockTeams[i % 6].id,
        teamB: mockTeams[(i + 1) % 6].id,
        goalsA: i === 5 ? undefined : 1,
        goalsB: i === 5 ? undefined : 0,
        completed: i !== 5,
      }));

      expect(isGroupStageComplete(matches)).toBe(false);
    });

    it('should return false if fewer than 9 matches exist', () => {
      const matches: Match[] = Array.from({ length: 8 }, (_, i) => ({
        id: `match${i}`,
        round: 'round1' as const,
        field: (i % 3) + 1,
        time: '4:40 PM',
        teamA: mockTeams[i % 6].id,
        teamB: mockTeams[(i + 1) % 6].id,
        goalsA: 1,
        goalsB: 0,
        completed: true,
      }));

      expect(isGroupStageComplete(matches)).toBe(false);
    });
  });

  describe('autoPopulateSemiFinals()', () => {
    it('should populate semi-finals with correct seeding (1v4, 2v3)', () => {
      const standings = [
        { teamId: 'argentina', teamName: 'Argentina', played: 3, wins: 3, draws: 0, losses: 0, goalsFor: 9, goalsAgainst: 0, goalDifference: 9, points: 9 },
        { teamId: 'brazil', teamName: 'Brazil', played: 3, wins: 2, draws: 0, losses: 1, goalsFor: 6, goalsAgainst: 2, goalDifference: 4, points: 6 },
        { teamId: 'england', teamName: 'England', played: 3, wins: 2, draws: 0, losses: 1, goalsFor: 5, goalsAgainst: 3, goalDifference: 2, points: 6 },
        { teamId: 'france', teamName: 'France', played: 3, wins: 1, draws: 0, losses: 2, goalsFor: 4, goalsAgainst: 6, goalDifference: -2, points: 3 },
      ];

      const rounds: Array<'round1' | 'round2' | 'round3'> = ['round1', 'round1', 'round1', 'round2', 'round2', 'round2', 'round3', 'round3', 'round3'];
      const matches: Match[] = [
        ...Array.from({ length: 9 }, (_, i) => ({
          id: `group${i}`,
          round: rounds[i],
          field: (i % 3) + 1,
          time: '4:40 PM',
          teamA: mockTeams[i % 6].id,
          teamB: mockTeams[(i + 1) % 6].id,
          goalsA: 1,
          goalsB: 0,
          completed: true,
        })),
        { id: 'sf-f1', round: 'semifinals', field: 1, time: '5:05 PM', teamA: 'tbd', teamB: 'tbd', completed: false },
        { id: 'sf-f2', round: 'semifinals', field: 2, time: '5:05 PM', teamA: 'tbd', teamB: 'tbd', completed: false },
        { id: 'final-f1', round: 'finals', field: 1, time: '5:20 PM', teamA: 'tbd', teamB: 'tbd', completed: false },
      ];

      const populated = autoPopulateSemiFinals(matches, standings);

      const sf1 = populated.find(m => m.id === 'sf-f1');
      const sf2 = populated.find(m => m.id === 'sf-f2');

      expect(sf1?.teamA).toBe('argentina');
      expect(sf1?.teamB).toBe('france');
      expect(sf2?.teamA).toBe('brazil');
      expect(sf2?.teamB).toBe('england');
    });

    it('should not modify non-TBD semi-finals', () => {
      const standings = [
        { teamId: 'argentina', teamName: 'Argentina', played: 3, wins: 3, draws: 0, losses: 0, goalsFor: 9, goalsAgainst: 0, goalDifference: 9, points: 9 },
        { teamId: 'brazil', teamName: 'Brazil', played: 3, wins: 2, draws: 0, losses: 1, goalsFor: 6, goalsAgainst: 2, goalDifference: 4, points: 6 },
        { teamId: 'england', teamName: 'England', played: 3, wins: 2, draws: 0, losses: 1, goalsFor: 5, goalsAgainst: 3, goalDifference: 2, points: 6 },
        { teamId: 'france', teamName: 'France', played: 3, wins: 1, draws: 0, losses: 2, goalsFor: 4, goalsAgainst: 6, goalDifference: -2, points: 3 },
      ];

      const matches: Match[] = [
        { id: 'sf-f1', round: 'semifinals', field: 1, time: '5:05 PM', teamA: 'argentina', teamB: 'france', completed: false },
        { id: 'sf-f2', round: 'semifinals', field: 2, time: '5:05 PM', teamA: 'brazil', teamB: 'england', completed: false },
      ];

      const populated = autoPopulateSemiFinals(matches, standings);

      expect(populated[0].teamA).toBe('argentina');
      expect(populated[0].teamB).toBe('france');
    });
  });

  describe('areSemiFinalsComplete()', () => {
    it('should return true when both semi-finals are completed with scores', () => {
      const matches: Match[] = [
        { id: 'sf-f1', round: 'semifinals', field: 1, time: '5:05 PM', teamA: 'argentina', teamB: 'france', goalsA: 2, goalsB: 1, completed: true },
        { id: 'sf-f2', round: 'semifinals', field: 2, time: '5:05 PM', teamA: 'brazil', teamB: 'england', goalsA: 1, goalsB: 0, completed: true },
      ];

      expect(areSemiFinalsComplete(matches)).toBe(true);
    });

    it('should return false if only one semi-final is complete', () => {
      const matches: Match[] = [
        { id: 'sf-f1', round: 'semifinals', field: 1, time: '5:05 PM', teamA: 'argentina', teamB: 'france', goalsA: 2, goalsB: 1, completed: true },
        { id: 'sf-f2', round: 'semifinals', field: 2, time: '5:05 PM', teamA: 'brazil', teamB: 'england', completed: false },
      ];

      expect(areSemiFinalsComplete(matches)).toBe(false);
    });

    it('should return false if semi-final has no score', () => {
      const matches: Match[] = [
        { id: 'sf-f1', round: 'semifinals', field: 1, time: '5:05 PM', teamA: 'argentina', teamB: 'france', goalsA: 2, goalsB: 1, completed: true },
        { id: 'sf-f2', round: 'semifinals', field: 2, time: '5:05 PM', teamA: 'brazil', teamB: 'england', completed: true },
      ];

      expect(areSemiFinalsComplete(matches)).toBe(false);
    });
  });

  describe('autoPopulateFinal()', () => {
    it('should populate final with semi-final winners', () => {
      const matches: Match[] = [
        { id: 'sf-f1', round: 'semifinals', field: 1, time: '5:05 PM', teamA: 'argentina', teamB: 'france', goalsA: 2, goalsB: 1, completed: true },
        { id: 'sf-f2', round: 'semifinals', field: 2, time: '5:05 PM', teamA: 'brazil', teamB: 'england', goalsA: 1, goalsB: 0, completed: true },
        { id: 'final-f1', round: 'finals', field: 1, time: '5:20 PM', teamA: 'tbd', teamB: 'tbd', completed: false },
      ];

      const populated = autoPopulateFinal(matches);
      const final = populated.find(m => m.id === 'final-f1');

      expect(final?.teamA).toBe('argentina');
      expect(final?.teamB).toBe('brazil');
    });

    it('should handle draws in semi-finals by taking teamB as winner', () => {
      const matches: Match[] = [
        { id: 'sf-f1', round: 'semifinals', field: 1, time: '5:05 PM', teamA: 'argentina', teamB: 'france', goalsA: 1, goalsB: 1, completed: true },
        { id: 'sf-f2', round: 'semifinals', field: 2, time: '5:05 PM', teamA: 'brazil', teamB: 'england', goalsA: 2, goalsB: 0, completed: true },
        { id: 'final-f1', round: 'finals', field: 1, time: '5:20 PM', teamA: 'tbd', teamB: 'tbd', completed: false },
      ];

      const populated = autoPopulateFinal(matches);
      const final = populated.find(m => m.id === 'final-f1');

      expect(final?.teamA).toBe('france');
      expect(final?.teamB).toBe('brazil');
    });

    it('should not modify final if semi-finals not complete', () => {
      const matches: Match[] = [
        { id: 'sf-f1', round: 'semifinals', field: 1, time: '5:05 PM', teamA: 'argentina', teamB: 'france', completed: false },
        { id: 'sf-f2', round: 'semifinals', field: 2, time: '5:05 PM', teamA: 'brazil', teamB: 'england', completed: false },
        { id: 'final-f1', round: 'finals', field: 1, time: '5:20 PM', teamA: 'tbd', teamB: 'tbd', completed: false },
      ];

      const populated = autoPopulateFinal(matches);
      const final = populated.find(m => m.id === 'final-f1');

      expect(final?.teamA).toBe('tbd');
      expect(final?.teamB).toBe('tbd');
    });
  });
});
