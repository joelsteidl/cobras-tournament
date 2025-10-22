import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import { Team, Match } from '@/types';

export async function loadTeams(): Promise<Team[]> {
  const teamsPath = path.join(process.cwd(), 'public', 'teams.yaml');
  const fileContents = fs.readFileSync(teamsPath, 'utf8');
  const data = yaml.parse(fileContents);
  return data.teams;
}

/**
 * Generate a balanced round-robin schedule where:
 * - 7 teams total (Argentina, Brazil, England, France, Germany, Portugal, Spain)
 * - Each team plays exactly 3 matches
 * - Each round has 3 matches (6 teams playing, 1 team resting)
 * - No team plays against the same opponent twice
 * Round 1: 4:40 PM
 * Round 2: 5:05 PM
 * Round 3: 5:20 PM
 */
export function generateSchedule(): Match[] {
  // Round 1 (4:40 PM) - Spain rests
  const round1: Match[] = [
    {
      id: 'r1-f1',
      round: 'round1',
      field: 1,
      time: '4:40 PM',
      teamA: 'argentina',
      teamB: 'brazil',
      completed: false,
    },
    {
      id: 'r1-f2',
      round: 'round1',
      field: 2,
      time: '4:40 PM',
      teamA: 'england',
      teamB: 'france',
      completed: false,
    },
    {
      id: 'r1-f3',
      round: 'round1',
      field: 3,
      time: '4:40 PM',
      teamA: 'germany',
      teamB: 'portugal',
      completed: false,
    },
  ];

  // Round 2 (5:05 PM) - Portugal rests
  const round2: Match[] = [
    {
      id: 'r2-f1',
      round: 'round2',
      field: 1,
      time: '5:05 PM',
      teamA: 'argentina',
      teamB: 'england',
      completed: false,
    },
    {
      id: 'r2-f2',
      round: 'round2',
      field: 2,
      time: '5:05 PM',
      teamA: 'brazil',
      teamB: 'france',
      completed: false,
    },
    {
      id: 'r2-f3',
      round: 'round2',
      field: 3,
      time: '5:05 PM',
      teamA: 'germany',
      teamB: 'spain',
      completed: false,
    },
  ];

  // Round 3 (5:20 PM) - England rests
  const round3: Match[] = [
    {
      id: 'r3-f1',
      round: 'round3',
      field: 1,
      time: '5:20 PM',
      teamA: 'argentina',
      teamB: 'france',
      completed: false,
    },
    {
      id: 'r3-f2',
      round: 'round3',
      field: 2,
      time: '5:20 PM',
      teamA: 'brazil',
      teamB: 'portugal',
      completed: false,
    },
    {
      id: 'r3-f3',
      round: 'round3',
      field: 3,
      time: '5:20 PM',
      teamA: 'spain',
      teamB: 'germany',
      completed: false,
    },
  ];

  return [...round1, ...round2, ...round3];
}
