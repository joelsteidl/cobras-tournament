'use client';

import { useState, useEffect } from 'react';
import { HomeView } from '@/components/views/HomeView';
import { TeamsView } from '@/components/views/TeamsView';
import { TableView } from '@/components/views/TableView';
import { AdminView } from '@/components/views/AdminView';

type View = 'home' | 'teams' | 'table' | 'admin';

export default function Home() {
  const [view, setView] = useState<View>('home');
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
            onClick={() => setView('home')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors border-b-2 text-sm ${
              view === 'home'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            🏠 Home
          </button>

          <button
            onClick={() => setView('teams')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors border-b-2 text-sm ${
              view === 'teams'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            👥 Teams
          </button>

          <button
            onClick={() => setView('table')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors border-b-2 text-sm ${
              view === 'table'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 Table
          </button>

          {isAdmin && (
            <button
              onClick={() => setView('admin')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors border-b-2 text-sm ${
                view === 'admin'
                  ? 'border-yellow-600 text-yellow-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              ⚙️ Admin
            </button>
          )}
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 overflow-y-auto max-w-lg mx-auto w-full">
        {view === 'home' && <HomeView />}
        {view === 'teams' && <TeamsView />}
        {view === 'table' && <TableView />}
        {view === 'admin' && isAdmin && <AdminView />}
      </main>
    </div>
  );
}
