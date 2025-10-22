'use client';

import { useState, useEffect } from 'react';
import { Team } from '@/types';
import { useRealTimeSync } from '@/hooks/useRealTimeSync';

export function AdminView() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Load teams on mount
  useEffect(() => {
    loadTeams();
  }, []);

  // Real-time sync
  useRealTimeSync((event) => {
    if (event.type === 'teams_updated') {
      loadTeams();
    }
  });

  const loadTeams = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/teams');
      if (!response.ok) throw new Error('Failed to load teams');
      const data = await response.json();
      setTeams(data);
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
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-bold mb-2">🔧 Admin Panel</h1>
      <p className="text-sm text-gray-600 mb-6">Edit teams and players. Changes sync to all devices in real-time.</p>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          ✅ {success}
        </div>
      )}

      {/* Teams Editor */}
      <div className="space-y-4">
        {teams.map(team => (
          <div key={team.id} className="border rounded-lg p-4 bg-white shadow-sm">
            {/* Team Name */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-600 block mb-1">Team Name</label>
              <input
                type="text"
                value={team.name}
                onChange={(e) => updateTeamName(team.id, e.target.value)}
                className="w-full px-3 py-2 border rounded font-semibold text-lg"
              />
            </div>

            {/* Players */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-600 block">Players</label>
              {team.players.map((player, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={player.name}
                  onChange={(e) => updatePlayerName(team.id, idx, e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm"
                  placeholder={`Player ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <button
        onClick={saveTeams}
        disabled={saving}
        className="w-full mt-6 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-colors"
      >
        {saving ? 'Saving...' : '💾 Save All Changes'}
      </button>

      {/* Reset Button */}
      {!showResetConfirm ? (
        <button
          onClick={() => setShowResetConfirm(true)}
          className="w-full mt-3 py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors"
        >
          🔄 Reset All Matches
        </button>
      ) : (
        <div className="mt-3 p-4 bg-red-50 border border-red-300 rounded-lg">
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
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-700">
        <p className="font-semibold mb-2">ℹ️ How this works:</p>
        <ul className="space-y-1 text-xs">
          <li>• Edit team names and player names above</li>
          <li>• Click &quot;Save All Changes&quot; to update</li>
          <li>• Changes sync to all devices instantly (no refresh needed)</li>
          <li>• Data stored in Vercel KV database</li>
        </ul>
      </div>
    </div>
  );
}
