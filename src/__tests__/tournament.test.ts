import { describe, it, expect } from 'vitest';
import { generateSchedule } from '@/lib/tournament';

describe('Tournament Schedule', () => {
  describe('generateSchedule()', () => {
    it('should generate exactly 12 matches: 9 group + 2 semi-finals + 1 final', () => {
      const schedule = generateSchedule();
      expect(schedule).toHaveLength(12);
    });

    it('should have correct distribution: 3 rounds of 3 matches', () => {
      const schedule = generateSchedule();

      const round1 = schedule.filter(m => m.round === 'round1');
      const round2 = schedule.filter(m => m.round === 'round2');
      const round3 = schedule.filter(m => m.round === 'round3');

      expect(round1).toHaveLength(3);
      expect(round2).toHaveLength(3);
      expect(round3).toHaveLength(3);
    });

    it('should have correct playoff structure: 2 semi-finals + 1 final', () => {
      const schedule = generateSchedule();

      const semiFinals = schedule.filter(m => m.round === 'semifinals');
      const finals = schedule.filter(m => m.round === 'finals');

      expect(semiFinals).toHaveLength(2);
      expect(finals).toHaveLength(1);
    });

    it('should have correct times for group stage matches', () => {
      const schedule = generateSchedule();

      const round1 = schedule.filter(m => m.round === 'round1');
      const round2 = schedule.filter(m => m.round === 'round2');
      const round3 = schedule.filter(m => m.round === 'round3');

      // All round 1 matches at 4:40 PM
      expect(round1.every(m => m.time === '4:40 PM')).toBe(true);
      // All round 2 matches at 4:45 PM
      expect(round2.every(m => m.time === '4:45 PM')).toBe(true);
      // All round 3 matches at 4:50 PM
      expect(round3.every(m => m.time === '4:50 PM')).toBe(true);
    });

    it('should have correct times for playoffs', () => {
      const schedule = generateSchedule();

      const semiFinals = schedule.filter(m => m.round === 'semifinals');
      const finals = schedule.filter(m => m.round === 'finals');

      // All semi-final matches at 5:05 PM
      expect(semiFinals.every(m => m.time === '5:05 PM')).toBe(true);
      // Final at 5:20 PM
      expect(finals.every(m => m.time === '5:20 PM')).toBe(true);
    });

    it('should have all matches marked as not completed initially', () => {
      const schedule = generateSchedule();
      expect(schedule.every(m => m.completed === false)).toBe(true);
    });

    it('should have unique match IDs', () => {
      const schedule = generateSchedule();
      const ids = schedule.map(m => m.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(12);
    });

    it('should have correct fields (1-3 for group stage, 1-2 for semis, 1 for final)', () => {
      const schedule = generateSchedule();

      const groupMatches = schedule.filter(m => ['round1', 'round2', 'round3'].includes(m.round));
      const semiMatches = schedule.filter(m => m.round === 'semifinals');
      const finalMatches = schedule.filter(m => m.round === 'finals');

      // Group stage on fields 1-3
      expect(groupMatches.every(m => m.field >= 1 && m.field <= 3)).toBe(true);
      // Semi-finals on fields 1-2
      expect(semiMatches.every(m => m.field >= 1 && m.field <= 2)).toBe(true);
      // Final on field 1
      expect(finalMatches.every(m => m.field === 1)).toBe(true);
    });

    it('should initialize playoff teams as TBD', () => {
      const schedule = generateSchedule();

      const semiFinals = schedule.filter(m => m.round === 'semifinals');
      const finals = schedule.filter(m => m.round === 'finals');

      expect(semiFinals.every(m => m.teamA === 'tbd' && m.teamB === 'tbd')).toBe(true);
      expect(finals.every(m => m.teamA === 'tbd' && m.teamB === 'tbd')).toBe(true);
    });

    it('should not have duplicate matchups in group stage', () => {
      const schedule = generateSchedule();
      const groupMatches = schedule.filter(m => ['round1', 'round2', 'round3'].includes(m.round));

      const matchups = groupMatches.map(m => {
        // Normalize matchup to avoid counting (A vs B) and (B vs A) as different
        const teams = [m.teamA, m.teamB].sort();
        return `${teams[0]}-${teams[1]}`;
      });

      const uniqueMatchups = new Set(matchups);
      expect(uniqueMatchups.size).toBe(matchups.length); // All unique
    });

    it('should have each team play 3 opponents in group stage', () => {
      const schedule = generateSchedule();
      const groupMatches = schedule.filter(m => ['round1', 'round2', 'round3'].includes(m.round));

      const teams = ['argentina', 'brazil', 'england', 'france', 'germany', 'portugal'];

      teams.forEach(teamId => {
        const teamMatches = groupMatches.filter(m => m.teamA === teamId || m.teamB === teamId);
        expect(teamMatches).toHaveLength(3);

        // Get opponents
        const opponents = new Set<string>();
        teamMatches.forEach(m => {
          if (m.teamA === teamId) opponents.add(m.teamB);
          else opponents.add(m.teamA);
        });

        // Each team should play 3 different opponents (no repeats)
        expect(opponents.size).toBe(3);
      });
    });

    it('should have no team playing itself', () => {
      const schedule = generateSchedule();
      const groupMatches = schedule.filter(m => ['round1', 'round2', 'round3'].includes(m.round));
      const invalidMatches = groupMatches.filter(m => m.teamA === m.teamB);
      expect(invalidMatches).toHaveLength(0);
    });

    it('should have semi-finals on 2 different fields', () => {
      const schedule = generateSchedule();
      const semiFinals = schedule.filter(m => m.round === 'semifinals');

      const fields = new Set(semiFinals.map(m => m.field));
      expect(fields.size).toBe(2);
      expect(Array.from(fields)).toEqual([1, 2]);
    });
  });
});
