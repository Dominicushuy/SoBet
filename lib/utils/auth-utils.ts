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
  const supabase = await createServerClient();

  try {
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

    if (error || !userData) return null;

    // Lấy thông tin ví của người dùng
    const { data: walletData } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single();

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
  const supabase = createClientBrowser();

  try {
    const { data: userData, error } = await supabase
      .from('users')
      .select('username, role')
      .eq('id', user.id)
      .single();

    if (error || !userData) return null;

    // Lấy thông tin ví
    const { data: walletData } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email || '',
      username: userData.username,
      role: userData.role as UserRole,
      balance: walletData?.balance || 0,
    };
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
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
