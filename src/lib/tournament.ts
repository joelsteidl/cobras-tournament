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
 * Generate a balanced 4-round tournament schedule where:
 * - 7 teams total (Argentina, Brazil, England, France, Germany, Portugal, Spain)
 * - Each team plays exactly 3 matches (10 min each)
 * - Each round has 3 matches (6 teams playing, 1 team resting)
 * - Each team rests exactly once across 4 rounds
 * - Schedule fits in 50 minutes (4:40 PM - 5:29 PM) with 15 min buffer for finals
 * - 3 minute changeovers between rounds
 *
 * Round 1 (4:40-4:50 PM) - Spain rests
 * Round 2 (4:53-5:03 PM) - England rests
 * Round 3 (5:06-5:16 PM) - Portugal rests
 * Round 4 (5:19-5:29 PM) - Brazil rests
 * Finals (5:30-5:45 PM) - Top 4 teams
 */
export function generateSchedule(): Match[] {
  // Round 1 (4:40-4:50 PM) - Spain rests
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

  // Round 2 (4:53-5:03 PM) - England rests
  const round2: Match[] = [
    {
      id: 'r2-f1',
      round: 'round2',
      field: 1,
      time: '4:53 PM',
      teamA: 'argentina',
      teamB: 'france',
      completed: false,
    },
    {
      id: 'r2-f2',
      round: 'round2',
      field: 2,
      time: '4:53 PM',
      teamA: 'brazil',
      teamB: 'portugal',
      completed: false,
    },
    {
      id: 'r2-f3',
      round: 'round2',
      field: 3,
      time: '4:53 PM',
      teamA: 'germany',
      teamB: 'spain',
      completed: false,
    },
  ];

  // Round 3 (5:06-5:16 PM) - Portugal rests
  const round3: Match[] = [
    {
      id: 'r3-f1',
      round: 'round3',
      field: 1,
      time: '5:06 PM',
      teamA: 'argentina',
      teamB: 'spain',
      completed: false,
    },
    {
      id: 'r3-f2',
      round: 'round3',
      field: 2,
      time: '5:06 PM',
      teamA: 'brazil',
      teamB: 'france',
      completed: false,
    },
    {
      id: 'r3-f3',
      round: 'round3',
      field: 3,
      time: '5:06 PM',
      teamA: 'england',
      teamB: 'germany',
      completed: false,
    },
  ];

  // Round 4 (5:19-5:29 PM) - Brazil rests
  const round4: Match[] = [
    {
      id: 'r4-f1',
      round: 'round4',
      field: 1,
      time: '5:19 PM',
      teamA: 'argentina',
      teamB: 'england',
      completed: false,
    },
    {
      id: 'r4-f2',
      round: 'round4',
      field: 2,
      time: '5:19 PM',
      teamA: 'france',
      teamB: 'spain',
      completed: false,
    },
    {
      id: 'r4-f3',
      round: 'round4',
      field: 3,
      time: '5:19 PM',
      teamA: 'germany',
      teamB: 'portugal',
      completed: false,
    },
  ];

  return [...round1, ...round2, ...round3, ...round4];
}
