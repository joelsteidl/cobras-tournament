import { Match, Standings, Team } from '@/types';

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

  // Process completed matches
  matches.forEach(match => {
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
