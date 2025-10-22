'use client';

import { useState, useEffect } from 'react';
import { HomeView } from '@/components/views/HomeView';
import { TeamsView } from '@/components/views/TeamsView';
import { TableView } from '@/components/views/TableView';
import { AdminView } from '@/components/views/AdminView';
import { Play, Trophy, Users, Settings } from 'lucide-react';

type View = 'matches' | 'standings' | 'teams' | 'admin';

export default function Home() {
  const [view, setView] = useState<View>('matches');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check URL for admin token
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'cobras2025') {
      setIsAdmin(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          <button
            onClick={() => setView('matches')}
            className={`flex-1 py-3 px-4 flex flex-col items-center gap-1 transition-colors border-b-2 ${
              view === 'matches'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Play size={20} strokeWidth={2} />
            <span className="text-xs">Matches</span>
          </button>

          <button
            onClick={() => setView('standings')}
            className={`flex-1 py-3 px-4 flex flex-col items-center gap-1 transition-colors border-b-2 ${
              view === 'standings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Trophy size={20} strokeWidth={2} />
            <span className="text-xs">Standings</span>
          </button>

          <button
            onClick={() => setView('teams')}
            className={`flex-1 py-3 px-4 flex flex-col items-center gap-1 transition-colors border-b-2 ${
              view === 'teams'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users size={20} strokeWidth={2} />
            <span className="text-xs">Teams</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setView('admin')}
              className={`flex-1 py-3 px-4 flex flex-col items-center gap-1 transition-colors border-b-2 ${
                view === 'admin'
                  ? 'border-yellow-600 text-yellow-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Settings size={20} strokeWidth={2} />
              <span className="text-xs">Admin</span>
            </button>
          )}
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 overflow-y-auto max-w-lg mx-auto w-full">
        {view === 'matches' && <HomeView />}
        {view === 'standings' && <TableView />}
        {view === 'teams' && <TeamsView />}
        {view === 'admin' && isAdmin && <AdminView />}
      </main>
    </div>
  );
}
