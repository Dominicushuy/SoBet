'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { registerUser } from '@/lib/supabase/mutations';
import { createServerClient } from '@/lib/supabase/server';

/**
 * Server Action: Đăng ký người dùng mới
 */
export async function signUp(formData: { email: string; password: string; username: string }) {
  try {
    const supabase = createServerClient();

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
    const supabase = createServerClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      throw error;
    }

    return {
      success: true,
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
  const supabase = createServerClient();
  await supabase.auth.signOut();
  redirect('/');
}

/**
 * Server Action: Nạp tiền vào ví (mô phỏng thanh toán)
 */
export async function depositFunds(amount: number) {
  try {
    const supabase = createServerClient();

    // Lấy thông tin user hiện tại
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        error: 'Bạn cần đăng nhập để nạp tiền',
      };
    }

    // Lấy thông tin ví
    const { data: wallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!wallet) {
      return {
        error: 'Không tìm thấy ví',
      };
    }

    // Cập nhật ví
    const { error: updateError } = await supabase
      .from('wallets')
      .update({
        balance: wallet.balance + amount,
      })
      .eq('id', wallet.id);

    if (updateError) {
      throw updateError;
    }

    // Tạo giao dịch
    const { error: transactionError } = await supabase.from('transactions').insert({
      user_id: user.id,
      wallet_id: wallet.id,
      type: 'DEPOSIT',
      amount: amount,
      balance_before: wallet.balance,
      balance_after: wallet.balance + amount,
      status: 'COMPLETED',
      notes: 'Nạp tiền vào ví',
    });

    if (transactionError) {
      throw transactionError;
    }

    return {
      success: true,
      newBalance: wallet.balance + amount,
    };
  } catch (error) {
    console.error('Error depositing funds:', error);
    return {
      error: 'Đã xảy ra lỗi khi nạp tiền. Vui lòng thử lại sau.',
    };
  }
}
