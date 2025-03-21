'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

import { User } from '@supabase/supabase-js';

import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { AuthUser, getUserData } from '@/lib/utils/auth-utils';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  balance: number;
  formattedBalance: string;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,
  balance: 0,
  formattedBalance: '0 ₫',
  signOut: async () => {},
  refreshUserData: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const refreshUserData = async () => {
    if (!supabaseUser) return;

    try {
      const retryGetUserData = async (retries = 2): Promise<AuthUser | null> => {
        try {
          const userData = await getUserData(supabaseUser);
          if (userData) {
            return userData;
          }

          if (retries > 0) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            return retryGetUserData(retries - 1);
          }

          return null;
        } catch (error) {
          if (retries > 0) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            return retryGetUserData(retries - 1);
          }
          throw error;
        }
      };

      const userData = await retryGetUserData();

      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      // Silent error in production
    }
  };

  useEffect(() => {
    const setupAuth = async () => {
      try {
        setIsLoading(true);

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setSupabaseUser(session.user);

          try {
            const userData = await getUserData(session.user);
            if (userData) {
              setUser(userData);
            }
          } catch (userDataError) {
            // Silent in production
          }
        }
      } catch (error) {
        // Silent in production
      } finally {
        setIsLoading(false);
      }
    };

    setupAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          setSupabaseUser(session.user);

          setTimeout(async () => {
            try {
              const userData = await getUserData(session.user);
              if (userData) {
                setUser(userData);
              }
            } catch (error) {
              // Silent in production
            }
          }, 300);
        }
      } else if (event === 'SIGNED_OUT') {
        setSupabaseUser(null);
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSupabaseUser(null);
      setUser(null);
    } catch (error) {
      // Silent in production
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const balance = user?.balance || 0;
  const formattedBalance = formatCurrency(balance);

  const value = {
    user,
    isAuthenticated,
    isAdmin,
    isLoading,
    balance,
    formattedBalance,
    signOut,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
