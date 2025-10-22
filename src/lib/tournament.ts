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
 * Generate a tournament schedule with group stage, semi-finals, and finals.
 *
 * Timeline:
 * - Group Stage (3 rounds): 4:40 PM, 4:45 PM, 4:50 PM (3 matches per round, 10 min games)
 * - 5 min break: 5:00-5:05 PM
 * - Semi-Finals (2 matches on 2 fields): 5:05-5:15 PM (Top 4 teams)
 *   - SF1 (Field 1): 1st seed vs 4th seed
 *   - SF2 (Field 2): 2nd seed vs 3rd seed
 * - 5 min break: 5:15-5:20 PM
 * - Final (1 match): 5:20-5:30 PM (SF winners)
 *
 * Qualification for Semi-Finals:
 * - Top 4 teams by points after group stage advance
 * - 1st vs 4th, 2nd vs 3rd (bracket seeding by standings)
 * - Winners advance to Final
 *
 * Group Stage Matchups (each team plays 3 different opponents):
 * Argentina: vs Germany, France, England
 * Brazil: vs Portugal, Germany, France
 * England: vs France, Portugal, Argentina
 * France: vs England, Argentina, Brazil
 * Germany: vs Argentina, Brazil, Portugal
 * Portugal: vs Brazil, England, Germany
 */
export function generateSchedule(): Match[] {
  // Round 1 (4:40 PM)
  const round1: Match[] = [
    {
      id: 'r1-f1',
      round: 'round1',
      field: 1,
      time: '4:40 PM',
      teamA: 'argentina',
      teamB: 'germany',
      completed: false,
    },
    {
      id: 'r1-f2',
      round: 'round1',
      field: 2,
      time: '4:40 PM',
      teamA: 'brazil',
      teamB: 'portugal',
      completed: false,
    },
    {
      id: 'r1-f3',
      round: 'round1',
      field: 3,
      time: '4:40 PM',
      teamA: 'england',
      teamB: 'france',
      completed: false,
    },
  ];

  // Round 2 (4:45 PM) - 5 min break
  const round2: Match[] = [
    {
      id: 'r2-f1',
      round: 'round2',
      field: 1,
      time: '4:45 PM',
      teamA: 'argentina',
      teamB: 'france',
      completed: false,
    },
    {
      id: 'r2-f2',
      round: 'round2',
      field: 2,
      time: '4:45 PM',
      teamA: 'brazil',
      teamB: 'germany',
      completed: false,
    },
    {
      id: 'r2-f3',
      round: 'round2',
      field: 3,
      time: '4:45 PM',
      teamA: 'england',
      teamB: 'portugal',
      completed: false,
    },
  ];

  // Round 3 (4:50 PM) - 5 min break
  const round3: Match[] = [
    {
      id: 'r3-f1',
      round: 'round3',
      field: 1,
      time: '4:50 PM',
      teamA: 'argentina',
      teamB: 'england',
      completed: false,
    },
    {
      id: 'r3-f2',
      round: 'round3',
      field: 2,
      time: '4:50 PM',
      teamA: 'brazil',
      teamB: 'france',
      completed: false,
    },
    {
      id: 'r3-f3',
      round: 'round3',
      field: 3,
      time: '4:50 PM',
      teamA: 'germany',
      teamB: 'portugal',
      completed: false,
    },
  ];

  // Semi-Finals (5:05 PM) - Top 4 teams, 2 fields
  // Bracket: 1st vs 4th (SF1), 2nd vs 3rd (SF2)
  // Teams will be filled in dynamically based on group stage standings
  const semiFinals: Match[] = [
    {
      id: 'sf-f1',
      round: 'semifinals',
      field: 1,
      time: '5:05 PM',
      teamA: 'tbd',
      teamB: 'tbd',
      completed: false,
    },
    {
      id: 'sf-f2',
      round: 'semifinals',
      field: 2,
      time: '5:05 PM',
      teamA: 'tbd',
      teamB: 'tbd',
      completed: false,
    },
  ];

  // Final (5:20 PM) - Winners of semi-finals
  const final: Match[] = [
    {
      id: 'final-f1',
      round: 'finals',
      field: 1,
      time: '5:20 PM',
      teamA: 'tbd',
      teamB: 'tbd',
      completed: false,
    },
  ];

  return [...round1, ...round2, ...round3, ...semiFinals, ...final];
}
