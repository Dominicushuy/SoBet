'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import { Session } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { AuthUser, getUserData } from '@/lib/utils/auth-utils';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  balance: number;
  formattedBalance: string;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  balance: 0,
  formattedBalance: '0 ₫',
  signOut: async () => {},
  refreshUserData: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const queryClient = useQueryClient();
  const supabase = createClient();

  // Lấy dữ liệu người dùng
  const fetchUserData = async (session: Session | null) => {
    if (!session || !session.user) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    const userData = await getUserData(session.user);
    setUser(userData);
    setIsLoading(false);
  };

  // Làm mới dữ liệu người dùng (ví dụ: sau khi nạp tiền)
  const refreshUserData = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    await fetchUserData(session);
  };

  // Xử lý thay đổi phiên người dùng
  useEffect(() => {
    // Lấy phiên ban đầu
    const initializeAuth = async () => {
      setIsLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      await fetchUserData(session);
    };

    initializeAuth();

    // Thiết lập listener cho thay đổi trạng thái auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      await fetchUserData(session);

      // Xóa cache React Query khi đăng xuất
      if (event === 'SIGNED_OUT') {
        queryClient.clear();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, queryClient]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const balance = user?.balance || 0;
  const formattedBalance = formatCurrency(balance);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    balance,
    formattedBalance,
    signOut,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
