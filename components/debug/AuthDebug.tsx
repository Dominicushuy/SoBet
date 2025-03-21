'use client';

import { useState } from 'react';

import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';

export default function AuthDebug() {
  const { user, isAuthenticated, isLoading, refreshUserData } = useAuth();
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);

  // Chỉ hiển thị trong development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const checkSession = async () => {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    setSessionInfo(data.session);
  };

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-md text-xs z-50 opacity-70 hover:opacity-100"
      >
        Debug Auth
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-md text-xs max-w-md max-h-96 overflow-auto z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Auth Debug</h3>
        <button onClick={() => setShowDebug(false)} className="text-gray-400 hover:text-white">
          Close
        </button>
      </div>

      <div className="space-y-2">
        <div>
          <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
          <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
        </div>

        <div className="flex space-x-2">
          <button onClick={checkSession} className="bg-blue-600 px-2 py-1 rounded text-xs">
            Check Session
          </button>

          <button
            onClick={() => refreshUserData()}
            className="bg-green-600 px-2 py-1 rounded text-xs"
          >
            Refresh User
          </button>
        </div>

        <div>
          <h4 className="font-semibold">User:</h4>
          <pre className="overflow-auto mt-1 bg-gray-900 p-2 rounded">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        {sessionInfo && (
          <div>
            <h4 className="font-semibold">Session:</h4>
            <pre className="overflow-auto mt-1 bg-gray-900 p-2 rounded">
              {JSON.stringify(
                {
                  user: sessionInfo.user
                    ? {
                        id: sessionInfo.user.id,
                        email: sessionInfo.user.email,
                      }
                    : null,
                  expires_at: sessionInfo.expires_at,
                },
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
