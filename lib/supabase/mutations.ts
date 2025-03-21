// lib/supabase/mutations.ts
import { SupabaseClient } from '@supabase/supabase-js';

import { generateBetCode } from '@/lib/lottery/calculators';
import { BetStatus } from '@/types/bet';

import { Database } from './types';

type Client = SupabaseClient<Database>;

/**
 * Tạo cược mới
 * @param supabase Supabase client
 * @param betData Dữ liệu cược
 * @returns Cược đã tạo
 */
export async function createBet(
  supabase: Client,
  betData: {
    user_id: string;
    rule_id: string;
    region: string;
    province?: string;
    subtype?: string;
    chosen_numbers: string[];
    amount: number;
    total_amount: number;
    potential_win: number;
    draw_date: string;
  }
) {
  // Tạo mã cược ngẫu nhiên
  const bet_code = generateBetCode();

  // Thêm cược vào database
  const { data, error } = await supabase
    .from('bets')
    .insert({
      ...betData,
      bet_code,
      status: 'PENDING' as BetStatus,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating bet:', error);
    throw error;
  }

  // Sau khi tạo cược, cập nhật ví của người dùng
  await updateWalletAfterBetting(supabase, betData.user_id, betData.total_amount);

  return data;
}

/**
 * Cập nhật ví sau khi đặt cược
 * @param supabase Supabase client
 * @param userId ID người dùng
 * @param amount Số tiền cược
 */
async function updateWalletAfterBetting(supabase: Client, userId: string, amount: number) {
  // Lấy thông tin ví hiện tại
  const { data: wallet, error: walletError } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (walletError) {
    console.error('Error fetching wallet:', walletError);
    throw walletError;
  }

  // Cập nhật ví
  const { error: updateError } = await supabase
    .from('wallets')
    .update({
      balance: wallet.balance - amount,
      total_bet: wallet.total_bet + amount,
    })
    .eq('id', wallet.id);

  if (updateError) {
    console.error('Error updating wallet:', updateError);
    throw updateError;
  }

  // Tạo giao dịch
  const { error: transactionError } = await supabase.from('transactions').insert({
    user_id: userId,
    wallet_id: wallet.id,
    type: 'BET',
    amount: -amount,
    balance_before: wallet.balance,
    balance_after: wallet.balance - amount,
    status: 'COMPLETED',
    notes: 'Đặt cược xổ số',
  });

  if (transactionError) {
    console.error('Error creating transaction:', transactionError);
    throw transactionError;
  }
}

/**
 * Thêm kết quả xổ số mới
 * @param supabase Supabase client
 * @param resultData Dữ liệu kết quả xổ số
 * @returns Kết quả đã thêm
 */
export async function addLotteryResult(
  supabase: Client,
  resultData: {
    draw_date: string;
    province: string;
    region: string;
    winning_numbers: any;
  }
) {
  // Kiểm tra xem đã có kết quả chưa
  const { data: existingResult } = await supabase
    .from('results')
    .select('id')
    .eq('draw_date', resultData.draw_date)
    .eq('province', resultData.province)
    .single();

  if (existingResult) {
    // Nếu đã có, cập nhật kết quả
    const { data, error } = await supabase
      .from('results')
      .update({
        winning_numbers: resultData.winning_numbers,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingResult.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating lottery result:', error);
      throw error;
    }

    return data;
  } else {
    // Nếu chưa có, thêm mới
    const { data, error } = await supabase.from('results').insert(resultData).select().single();

    if (error) {
      console.error('Error adding lottery result:', error);
      throw error;
    }

    return data;
  }
}

/**
 * Cập nhật trạng thái cược sau khi kiểm tra kết quả
 * @param supabase Supabase client
 * @param betId ID cược
 * @param verificationResult Kết quả kiểm tra
 * @returns Cược đã cập nhật
 */
export async function updateBetAfterVerification(
  supabase: Client,
  betId: string,
  verificationResult: {
    isWin: boolean;
    winningNumbers: string[];
    totalWinAmount: number;
    winDetails?: any;
  }
) {
  // Lấy thông tin cược hiện tại
  const { data: bet, error: betError } = await supabase
    .from('bets')
    .select('*')
    .eq('id', betId)
    .single();

  if (betError) {
    console.error('Error fetching bet:', betError);
    throw betError;
  }

  // Cập nhật trạng thái cược
  const status = verificationResult.isWin ? 'WON' : 'LOST';
  const { data, error } = await supabase
    .from('bets')
    .update({
      status,
      result: verificationResult,
      won_amount: verificationResult.isWin ? verificationResult.totalWinAmount : 0,
      updated_at: new Date().toISOString(),
    })
    .eq('id', betId)
    .select()
    .single();

  if (error) {
    console.error('Error updating bet status:', error);
    throw error;
  }

  // Nếu thắng, cập nhật ví
  if (verificationResult.isWin && verificationResult.totalWinAmount > 0) {
    await updateWalletAfterWinning(supabase, bet.user_id, verificationResult.totalWinAmount, betId);
  }

  return data;
}

/**
 * Cập nhật ví sau khi thắng cược
 * @param supabase Supabase client
 * @param userId ID người dùng
 * @param amount Số tiền thắng
 * @param betId ID cược
 */
async function updateWalletAfterWinning(
  supabase: Client,
  userId: string,
  amount: number,
  betId: string
) {
  // Lấy thông tin ví hiện tại
  const { data: wallet, error: walletError } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (walletError) {
    console.error('Error fetching wallet:', walletError);
    throw walletError;
  }

  // Cập nhật ví
  const { error: updateError } = await supabase
    .from('wallets')
    .update({
      balance: wallet.balance + amount,
      total_win: wallet.total_win + amount,
    })
    .eq('id', wallet.id);

  if (updateError) {
    console.error('Error updating wallet:', updateError);
    throw updateError;
  }

  // Tạo giao dịch
  const { error: transactionError } = await supabase.from('transactions').insert({
    user_id: userId,
    wallet_id: wallet.id,
    type: 'WIN',
    amount: amount,
    balance_before: wallet.balance,
    balance_after: wallet.balance + amount,
    reference_id: betId,
    status: 'COMPLETED',
    notes: 'Trúng thưởng xổ số',
  });

  if (transactionError) {
    console.error('Error creating transaction:', transactionError);
    throw transactionError;
  }
}

/**
 * Nạp tiền vào ví
 * @param supabase Supabase client
 * @param userId ID người dùng
 * @param amount Số tiền nạp
 * @returns Thông tin ví sau khi nạp
 */
export async function depositToWallet(supabase: Client, userId: string, amount: number) {
  // Lấy thông tin ví hiện tại
  const { data: wallet, error: walletError } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (walletError) {
    console.error('Error fetching wallet:', walletError);
    throw walletError;
  }

  // Cập nhật ví
  const { data, error: updateError } = await supabase
    .from('wallets')
    .update({
      balance: wallet.balance + amount,
    })
    .eq('id', wallet.id)
    .select()
    .single();

  if (updateError) {
    console.error('Error updating wallet:', updateError);
    throw updateError;
  }

  // Tạo giao dịch
  const { error: transactionError } = await supabase.from('transactions').insert({
    user_id: userId,
    wallet_id: wallet.id,
    type: 'DEPOSIT',
    amount: amount,
    balance_before: wallet.balance,
    balance_after: wallet.balance + amount,
    status: 'COMPLETED',
    notes: 'Nạp tiền vào ví',
  });

  if (transactionError) {
    console.error('Error creating transaction:', transactionError);
    throw transactionError;
  }

  return data;
}

/**
 * Đăng ký người dùng mới
 * @param supabase Supabase client
 * @param email Email người dùng
 * @param password Mật khẩu
 * @param username Tên người dùng
 * @returns Thông tin người dùng mới
 */
export async function registerUser(
  supabase: Client,
  email: string,
  password: string,
  username: string
) {
  // Đăng ký người dùng qua Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    console.error('Error registering user:', authError);
    throw authError;
  }

  if (!authData.user) {
    throw new Error('Failed to create user');
  }

  // Thêm thông tin người dùng vào bảng users
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      email,
      username,
      role: 'user',
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding user details:', error);
    throw error;
  }

  // Ví sẽ tự động được tạo thông qua trigger trong DB

  return data;
}
