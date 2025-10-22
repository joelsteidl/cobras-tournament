import { Match, Standings, Team } from '@/types';

/**
 * COBRAS TOURNAMENT PLAYOFF SYSTEM
 *
 * GROUP STAGE (Rounds 1-3):
 * - 6 teams play round-robin (each team plays 3 different opponents, no repeats)
 * - Points: Win = 3, Draw = 1, Loss = 0
 * - Tiebreaker: Points > Goal Difference > Goals For
 *
 * SEMI-FINALS (Top 4 advance):
 * - 1st seed vs 4th seed (SF1 on Field 1) at 5:05 PM
 * - 2nd seed vs 3rd seed (SF2 on Field 2) at 5:05 PM
 * - 10 minute matches
 *
 * FINAL:
 * - Winner of SF1 vs Winner of SF2 at 5:20 PM
 * - 10 minute match for the championship
 *
 * TIMELINE:
 * 4:40 PM - Round 1
 * 4:45 PM - Round 2 (5 min break)
 * 4:50 PM - Round 3 (5 min break)
 * 5:00 PM - Group stage ends
 * 5:05 PM - Semi-Finals start (5 min break)
 * 5:15 PM - Semi-Finals end
 * 5:20 PM - Final starts (5 min break)
 * 5:30 PM - Final ends
 * 5:45 PM - Wrap up
 */

export function calculateStandings(matches: Match[], teams: Team[]): Standings[] {
  const standings: { [key: string]: Standings } = {};

  // Initialize standings for each team
  teams.forEach(team => {
    standings[team.id] = {
      teamId: team.id,
      teamName: team.name,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    };
  });

  // Process completed matches (only group stage rounds 1-3)
  matches.forEach(match => {
    // Only count group stage matches in standings
    if (match.round !== 'round1' && match.round !== 'round2' && match.round !== 'round3') {
      return;
    }

    if (!match.completed || match.goalsA === undefined || match.goalsB === undefined) {
      return;
    }

    const teamA = standings[match.teamA];
    const teamB = standings[match.teamB];

    teamA.played += 1;
    teamB.played += 1;

    teamA.goalsFor += match.goalsA;
    teamA.goalsAgainst += match.goalsB;
    teamB.goalsFor += match.goalsB;
    teamB.goalsAgainst += match.goalsA;

    if (match.goalsA > match.goalsB) {
      teamA.wins += 1;
      teamA.points += 3;
      teamB.losses += 1;
    } else if (match.goalsB > match.goalsA) {
      teamB.wins += 1;
      teamB.points += 3;
      teamA.losses += 1;
    } else {
      teamA.draws += 1;
      teamA.points += 1;
      teamB.draws += 1;
      teamB.points += 1;
    }
  });

  // Calculate goal difference
  Object.values(standings).forEach(s => {
    s.goalDifference = s.goalsFor - s.goalsAgainst;
  });

  // Sort by: Points (desc), Goal Difference (desc), Goals For (desc)
  const sorted = Object.values(standings).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  return sorted;
}

export function getFinalsMatchups(standings: Standings[]): Array<{ rank: number; team: Standings }> {
  // Top 4 teams play in finals
  return standings.slice(0, 4).map((team, index) => ({
    rank: index + 1,
    team,
  }));
}

/**
 * Check if all group stage matches (rounds 1-3) are completed and scored.
 * Returns true only if all 9 group matches have a final score.
 */
export function isGroupStageComplete(matches: Match[]): boolean {
  const groupMatches = matches.filter(m => m.round === 'round1' || m.round === 'round2' || m.round === 'round3');
  return groupMatches.length === 9 && groupMatches.every(m =>
    m.completed && m.goalsA !== undefined && m.goalsB !== undefined
  );
}

/**
 * Auto-populate semi-finals with top 4 teams from group stage standings.
 * Bracket: 1st vs 4th, 2nd vs 3rd
 */
export function autoPopulateSemiFinals(matches: Match[], standings: Standings[]): Match[] {
  const topFour = standings.slice(0, 4);

  return matches.map(match => {
    if (match.round === 'semifinals' && match.teamA === 'tbd' && match.teamB === 'tbd') {
      if (match.id === 'sf-f1') {
        // 1st vs 4th
        return {
          ...match,
          teamA: topFour[0]?.teamId || 'tbd',
          teamB: topFour[3]?.teamId || 'tbd',
        };
      } else if (match.id === 'sf-f2') {
        // 2nd vs 3rd
        return {
          ...match,
          teamA: topFour[1]?.teamId || 'tbd',
          teamB: topFour[2]?.teamId || 'tbd',
        };
      }
    }
    return match;
  });
}

/**
 * Check if both semi-finals are completed and scored.
 */
export function areSemiFinalsComplete(matches: Match[]): boolean {
  const semiMatches = matches.filter(m => m.round === 'semifinals');
  return semiMatches.length === 2 && semiMatches.every(m =>
    m.completed && m.goalsA !== undefined && m.goalsB !== undefined
  );
}

/**
 * Auto-populate final with semi-final winners.
 */
export function autoPopulateFinal(matches: Match[]): Match[] {
  const semiMatches = matches.filter(m => m.round === 'semifinals' && m.completed);

  if (semiMatches.length !== 2) {
    return matches;
  }

  // Determine winners
  const sf1 = semiMatches.find(m => m.id === 'sf-f1');
  const sf2 = semiMatches.find(m => m.id === 'sf-f2');

  if (!sf1 || !sf2 || sf1.goalsA === undefined || sf1.goalsB === undefined ||
      sf2.goalsA === undefined || sf2.goalsB === undefined) {
    return matches;
  }

  const sf1Winner = sf1.goalsA > sf1.goalsB ? sf1.teamA : sf1.teamB;
  const sf2Winner = sf2.goalsA > sf2.goalsB ? sf2.teamA : sf2.teamB;

  return matches.map(match => {
    if (match.round === 'finals' && match.teamA === 'tbd' && match.teamB === 'tbd') {
      return {
        ...match,
        teamA: sf1Winner,
        teamB: sf2Winner,
      };
    }
    return match;
  });
}
