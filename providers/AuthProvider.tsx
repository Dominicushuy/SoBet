'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { AuthUser, getUserData } from '@/lib/utils/auth-utils';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  balance: number;
  formattedBalance: string;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isAdmin: false,
  balance: 0,
  formattedBalance: '0',
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // Flag to prevent state updates after component unmount
    let isMounted = true;

    // Kiểm tra người dùng hiện tại khi component mount
    const checkUser = async () => {
      try {
        // Lấy thông tin session hiện tại
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('Error checking auth session:', error);
          if (isMounted) setUser(null);
          return;
        }

        if (session?.user) {
          // Nếu có session, lấy thêm thông tin user từ database
          const userData = await getUserData(session.user);
          if (isMounted) setUser(userData);
        } else {
          if (isMounted) setUser(null);
        }
      } catch (error) {
        console.error('Error in auth check:', error);
        if (isMounted) setUser(null);
      } finally {
        // Ensure isLoading is set to false even if errors occur
        if (isMounted) setIsLoading(false);
      }
    };

    // Thiết lập listener cho các thay đổi auth
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const userData = await getUserData(session.user);
          if (isMounted) setUser(userData);
        } catch (error) {
          console.error('Error getting user data after sign in:', error);
          if (isMounted) setUser(null);
        } finally {
          if (isMounted) setIsLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    });

    // Start the auth check process
    checkUser();

    // Force isLoading to false after a maximum timeout (5 seconds)
    const timeoutId = setTimeout(() => {
      if (isMounted && isLoading) {
        console.warn('Auth check timed out, forcing isLoading to false');
        setIsLoading(false);
      }
    }, 5000);

    // Cleanup listener and prevent state updates on unmount
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  // Đăng xuất
  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Các computed properties
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const balance = user?.balance || 0;
  const formattedBalance = formatCurrency(balance);

  // Debug output for troubleshooting
  useEffect(() => {
    console.log('Auth state:', { isLoading, isAuthenticated, isAdmin, user });
  }, [isLoading, isAuthenticated, isAdmin, user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        isAdmin,
        balance,
        formattedBalance,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
