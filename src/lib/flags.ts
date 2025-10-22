// Country flag emojis for each team
export const TEAM_FLAGS: { [key: string]: string } = {
  argentina: '🇦🇷',
  brazil: '🇧🇷',
  england: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  france: '🇫🇷',
  germany: '🇩🇪',
  portugal: '🇵🇹',
};

export function getTeamFlag(teamId: string): string {
  return TEAM_FLAGS[teamId.toLowerCase()] || '⚽';
}

export function getTeamDisplay(teamId: string, teamName: string): string {
  const flag = getTeamFlag(teamId);
  return `${flag} ${teamName}`;
}
