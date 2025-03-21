'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { registerUser } from '@/lib/supabase/mutations';
import { createServerClient } from '@/lib/supabase/server';
import { AuthUser, UserRole, getRedirectPathAfterLogin } from '@/lib/utils/auth-utils';

/**
 * Server Action: Đăng ký người dùng mới
 */
export async function signUp(formData: { email: string; password: string; username: string }) {
  try {
    const supabase = await createServerClient();

    // Đăng ký người dùng
    const user = await registerUser(supabase, formData.email, formData.password, formData.username);

    return {
      success: true,
      user,
      message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.',
    };
  } catch (error: any) {
    console.error('Error signing up:', error);

    // Xử lý các lỗi phổ biến
    if (error.message?.includes('already registered')) {
      return {
        error: 'Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.',
      };
    }

    if (error.message?.includes('weak password')) {
      return {
        error: 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn (ít nhất 6 ký tự).',
      };
    }

    return {
      error: 'Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại sau.',
    };
  }
}

/**
 * Server Action: Đăng nhập
 */
export async function signIn(formData: { email: string; password: string }) {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      throw error;
    }

    // Lấy thông tin role của người dùng
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single();

    const role = (userData?.role as UserRole) || 'user';

    return {
      success: true,
      user: data.user,
      role,
      redirectTo: getRedirectPathAfterLogin(role),
    };
  } catch (error: any) {
    console.error('Error signing in:', error);

    // Xử lý các lỗi phổ biến
    if (error.message?.includes('Invalid login')) {
      return {
        error: 'Email hoặc mật khẩu không chính xác.',
      };
    }

    return {
      error: 'Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.',
    };
  }
}

/**
 * Server Action: Đăng xuất
 */
export async function signOut() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect('/');
}

/**
 * Server Action: Lấy thông tin người dùng hiện tại kèm theo vai trò
 */
export async function getCurrentUserWithRole(): Promise<{ user: AuthUser | null }> {
  try {
    const supabase = await createServerClient();

    // Lấy thông tin người dùng từ auth
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { user: null };
    }

    // Lấy thông tin chi tiết người dùng với vai trò
    const { data: userData } = await supabase
      .from('users')
      .select('username, role')
      .eq('id', user.id)
      .single();

    if (!userData) {
      return { user: null };
    }

    // Lấy thông tin ví
    const { data: walletData } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    return {
      user: {
        id: user.id,
        email: user.email || '',
        username: userData.username,
        role: userData.role as UserRole,
        balance: walletData?.balance || 0,
      },
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return { user: null };
  }
}

/**
 * Server Action: Kiểm tra người dùng có phải là admin không
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const result = await getCurrentUserWithRole();
    return result.user?.role === 'admin';
  } catch (error) {
    return false;
  }
}
