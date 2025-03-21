// lib/utils/auth-utils.ts
import { User } from '@supabase/supabase-js';

import { createClient as createClientBrowser } from '@/lib/supabase/client';
import { createServerClient } from '@/lib/supabase/server';

export type UserRole = 'admin' | 'user';

export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  role: UserRole;
  balance?: number;
}

/**
 * Lấy thông tin người dùng hiện tại từ server-side
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    // Lấy thêm thông tin từ bảng users tùy chỉnh của chúng ta
    const { data: userData, error } = await supabase
      .from('users')
      .select('username, role')
      .eq('id', user.id)
      .single();

    if (error || !userData) {
      console.error('Error fetching user data:', error);
      return null;
    }

    // Lấy thông tin ví của người dùng
    const { data: walletData, error: walletError } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    if (walletError) {
      console.error('Error fetching wallet data:', walletError);
    }

    return {
      id: user.id,
      email: user.email || '',
      username: userData.username,
      role: userData.role as UserRole,
      balance: walletData?.balance || 0,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Kiểm tra xem người dùng có vai trò cụ thể không
 */
export function hasRole(user: AuthUser | null, role: UserRole | UserRole[]): boolean {
  if (!user) return false;

  if (Array.isArray(role)) {
    return role.includes(user.role);
  }

  return user.role === role;
}

/**
 * Lấy dữ liệu người dùng từ Supabase Auth user
 */
export async function getUserData(user: User): Promise<AuthUser | null> {
  try {
    const supabase = createClientBrowser();

    // Lấy thông tin từ bảng users
    const { data: userData, error } = await supabase
      .from('users')
      .select('username, role')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user data:', error);
      // Instead of returning null, return basic user info with default role
      return {
        id: user.id,
        email: user.email || '',
        role: 'user', // Default role if we can't fetch from database
      };
    }

    // Lấy thông tin ví
    const { data: walletData, error: walletError } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    if (walletError) {
      console.error('Error fetching wallet data:', walletError);
    }

    return {
      id: user.id,
      email: user.email || '',
      username: userData.username,
      role: userData.role as UserRole,
      balance: walletData?.balance || 0,
    };
  } catch (error) {
    console.error('Error getting user data:', error);
    // Still return basic user info in case of error
    return {
      id: user.id,
      email: user.email || '',
      role: 'user', // Default role
    };
  }
}

/**
 * Redirect người dùng dựa trên vai trò của họ
 */
export function getRedirectPathAfterLogin(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'user':
    default:
      return '/bet';
  }
}
