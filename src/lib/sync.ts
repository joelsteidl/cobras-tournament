// Broadcast system for real-time updates without WebSocket
interface UpdateEvent {
  type: 'matches_updated' | 'teams_updated' | 'standings_updated';
  timestamp: number;
}

type UpdateListener = (data: UpdateEvent) => void;

const listeners: Set<UpdateListener> = new Set();

export function subscribe(listener: UpdateListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function broadcast(data: UpdateEvent) {
  listeners.forEach(listener => listener(data));
}

export function notifyMatchesUpdated() {
  broadcast({ type: 'matches_updated', timestamp: Date.now() });
}

export function notifyTeamsUpdated() {
  broadcast({ type: 'teams_updated', timestamp: Date.now() });
}

export function notifyStandingsUpdated() {
  broadcast({ type: 'standings_updated', timestamp: Date.now() });
}
