export interface Player {
  name: string;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
}

export interface Match {
  id: string;
  round: 'round1' | 'round2' | 'round3' | 'round4' | 'finals';
  field: number;
  time: string;
  teamA: string;
  teamB: string;
  goalsA?: number;
  goalsB?: number;
  completed: boolean;
}

export interface TournamentState {
  matches: Match[];
  lastUpdated: number;
}

export interface Standings {
  teamId: string;
  teamName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}
