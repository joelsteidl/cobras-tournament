'use client';

import { useState, useEffect } from 'react';
import { Team, Match } from '@/types';
import { useRealTimeSync } from '@/hooks/useRealTimeSync';
import { getTeamFlag } from '@/lib/flags';

export function AdminView() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [matchSaving, setMatchSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'teams' | 'matches'>('teams');

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Real-time sync
  useRealTimeSync((event) => {
    if (event.type === 'teams_updated' || event.type === 'matches_updated') {
      loadData();
    }
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [teamsRes, matchesRes] = await Promise.all([
        fetch('/api/teams'),
        fetch('/api/matches'),
      ]);

      if (!teamsRes.ok || !matchesRes.ok) throw new Error('Failed to load data');

      const teamsData = await teamsRes.json();
      const matchesData = await matchesRes.json();

      setTeams(teamsData);
      setMatches(matchesData);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const saveTeams = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': 'cobras2025',
        },
        body: JSON.stringify(teams),
      });

      if (!response.ok) throw new Error('Failed to save teams');
      setSuccess('Teams updated! Changes synced to all devices.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  const saveMatch = async (match: Match) => {
    try {
      setMatchSaving(true);
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': 'cobras2025',
        },
        body: JSON.stringify(match),
      });

      if (!response.ok) throw new Error('Failed to save match');
      setSuccess('Match updated! Changes synced to all devices.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setMatchSaving(false);
    }
  };

  const updateTeamName = (teamId: string, newName: string) => {
    setTeams(teams.map(t =>
      t.id === teamId ? { ...t, name: newName } : t
    ));
  };

  const updatePlayerName = (teamId: string, playerIdx: number, newName: string) => {
    setTeams(teams.map(t =>
      t.id === teamId
        ? {
            ...t,
            players: t.players.map((p, idx) =>
              idx === playerIdx ? { name: newName } : p
            ),
          }
        : t
    ));
  };

  const updateMatch = (matchId: string, updates: Partial<Match>) => {
    setMatches(matches.map(m =>
      m.id === matchId ? { ...m, ...updates } : m
    ));
  };

  if (loading) {
    return <div className="p-4 text-center">Loading admin panel...</div>;
  }

  const resetAllMatches = async () => {
    try {
      setResetting(true);
      setError('');
      const response = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: {
          'x-admin-token': 'cobras2025',
        },
      });

      if (!response.ok) throw new Error('Failed to reset matches');
      setSuccess('✅ All matches reset! Changes synced to all devices.');
      setShowResetConfirm(false);
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset');
    } finally {
      setResetting(false);
    }
  };

  const getTeamName = (teamId: string) => teams.find(t => t.id === teamId)?.name || teamId;

  return (
    <div className="p-4 pb-24">
      <h1 className="text-3xl font-bold mb-2 text-gray-900">🔧 Admin Panel</h1>
      <p className="text-sm text-gray-600 mb-6">Edit teams, players, or matches. Changes sync in real-time.</p>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border-2 border-red-400 text-red-700 rounded font-semibold">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 border-2 border-green-400 text-green-700 rounded font-semibold">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b-2 border-gray-300">
        <button
          onClick={() => setActiveTab('teams')}
          className={`py-2 px-4 font-semibold text-sm transition-colors ${
            activeTab === 'teams'
              ? 'border-b-2 border-blue-600 text-blue-600 -mb-[2px]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          👥 Teams & Players
        </button>
        <button
          onClick={() => setActiveTab('matches')}
          className={`py-2 px-4 font-semibold text-sm transition-colors ${
            activeTab === 'matches'
              ? 'border-b-2 border-blue-600 text-blue-600 -mb-[2px]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          ⚽ Match Schedule
        </button>
      </div>

      {/* Teams Tab */}
      {activeTab === 'teams' && (
        <>
          <div className="space-y-4 mb-6">
            {teams.map(team => (
              <div key={team.id} className="border-2 border-gray-400 rounded-lg p-4 bg-white shadow-md">
                {/* Team Name */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-gray-900 uppercase block mb-1">Team Name</label>
                  <input
                    type="text"
                    value={team.name}
                    onChange={(e) => updateTeamName(team.id, e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded font-semibold text-lg text-gray-900"
                  />
                </div>

                {/* Players */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-900 uppercase block">Players</label>
                  {team.players.map((player, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={player.name}
                      onChange={(e) => updatePlayerName(team.id, idx, e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded text-sm text-gray-900"
                      placeholder={`Player ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={saveTeams}
            disabled={saving || matchSaving}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-colors"
          >
            {saving ? 'Saving...' : '💾 Save Teams & Players'}
          </button>
        </>
      )}

      {/* Matches Tab */}
      {activeTab === 'matches' && (
        <>
          <div className="space-y-4 mb-6">
            {['round1', 'round2', 'round3'].map(round => {
              const roundMatches = matches.filter(m => m.round === round);
              const roundTitles: { [key: string]: string } = {
                round1: 'Round 1 (4:40 PM)',
                round2: 'Round 2 (5:05 PM)',
                round3: 'Round 3 (5:20 PM)',
              };

              return (
                <div key={round}>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{roundTitles[round]}</h3>
                  <div className="space-y-3">
                    {roundMatches.map(match => (
                      <div key={match.id} className="border-2 border-gray-400 rounded-lg p-4 bg-white shadow-md">
                        {/* Field & Time */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="text-xs font-semibold text-gray-900 uppercase block mb-1">Field</label>
                            <input
                              type="number"
                              min="1"
                              value={match.field}
                              onChange={(e) => updateMatch(match.id, { field: parseInt(e.target.value) })}
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded text-gray-900 font-semibold"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-900 uppercase block mb-1">Time</label>
                            <input
                              type="text"
                              value={match.time}
                              onChange={(e) => updateMatch(match.id, { time: e.target.value })}
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded text-gray-900 font-semibold"
                            />
                          </div>
                        </div>

                        {/* Teams */}
                        <div className="grid grid-cols-3 gap-2 mb-3 items-end">
                          <div>
                            <label className="text-xs font-semibold text-gray-900 uppercase block mb-1">Team A</label>
                            <select
                              value={match.teamA}
                              onChange={(e) => updateMatch(match.id, { teamA: e.target.value })}
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded text-gray-900 font-semibold"
                            >
                              {teams.map(team => (
                                <option key={team.id} value={team.id}>
                                  {getTeamFlag(team.id)} {team.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="text-center">
                            <label className="text-xs font-semibold text-gray-900 uppercase block mb-1">Score</label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                min="0"
                                value={match.goalsA ?? 0}
                                onChange={(e) => updateMatch(match.id, { goalsA: parseInt(e.target.value) })}
                                className="w-12 px-2 py-2 border-2 border-gray-300 rounded text-gray-900 font-bold text-center"
                              />
                              <span className="font-bold text-gray-900">-</span>
                              <input
                                type="number"
                                min="0"
                                value={match.goalsB ?? 0}
                                onChange={(e) => updateMatch(match.id, { goalsB: parseInt(e.target.value) })}
                                className="w-12 px-2 py-2 border-2 border-gray-300 rounded text-gray-900 font-bold text-center"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-gray-900 uppercase block mb-1">Team B</label>
                            <select
                              value={match.teamB}
                              onChange={(e) => updateMatch(match.id, { teamB: e.target.value })}
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded text-gray-900 font-semibold"
                            >
                              {teams.map(team => (
                                <option key={team.id} value={team.id}>
                                  {getTeamFlag(team.id)} {team.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Completed Toggle */}
                        <div className="flex items-center gap-3 mb-3">
                          <input
                            type="checkbox"
                            checked={match.completed}
                            onChange={(e) => updateMatch(match.id, { completed: e.target.checked })}
                            className="w-5 h-5 cursor-pointer"
                          />
                          <label className="text-sm font-semibold text-gray-900">Completed</label>
                        </div>

                        {/* Save Button */}
                        <button
                          onClick={() => saveMatch(match)}
                          disabled={matchSaving}
                          className="w-full py-2 px-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold rounded transition-colors text-sm"
                        >
                          {matchSaving ? 'Saving...' : '💾 Save Match'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Reset Button */}
      {!showResetConfirm ? (
        <button
          onClick={() => setShowResetConfirm(true)}
          className="w-full mt-6 py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors"
        >
          🔄 Reset All Match Scores
        </button>
      ) : (
        <div className="mt-6 p-4 bg-red-50 border-2 border-red-400 rounded-lg">
          <p className="text-sm font-semibold text-red-800 mb-3">⚠️ Are you sure? This will clear all match scores.</p>
          <div className="flex gap-2">
            <button
              onClick={resetAllMatches}
              disabled={resetting}
              className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold rounded transition-colors text-sm"
            >
              {resetting ? 'Resetting...' : 'Yes, Reset'}
            </button>
            <button
              onClick={() => setShowResetConfirm(false)}
              className="flex-1 py-2 px-3 bg-gray-400 hover:bg-gray-500 text-white font-bold rounded transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg text-sm text-gray-700">
        <p className="font-semibold mb-2">ℹ️ How this works:</p>
        <ul className="space-y-1 text-xs">
          <li>• <strong>Teams Tab:</strong> Edit team names and player names</li>
          <li>• <strong>Match Schedule Tab:</strong> Edit match pairings, scores, field, time</li>
          <li>• Click &quot;Save&quot; buttons to update</li>
          <li>• Changes sync to all devices instantly (no refresh needed)</li>
        </ul>
      </div>
    </div>
  );
}
