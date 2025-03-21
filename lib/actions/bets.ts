// lib/actions/bets.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { calculateBetAmount, generateBetCode } from '@/lib/lottery/calculators';
import { createBet } from '@/lib/supabase/mutations';
import { getRuleByCode, getUserWallet } from '@/lib/supabase/queries';
import createServerClient from '@/lib/supabase/server';
import { BetFormData } from '@/types/bet';

/**
 * Server Action: Tạo cược mới
 */
export async function createNewBet(formData: BetFormData) {
  try {
    const supabase = await createServerClient();

    // Lấy thông tin user hiện tại
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return {
        error: 'Bạn cần đăng nhập để đặt cược',
        loginRequired: true,
      };
    }

    // Lấy thông tin quy tắc cược
    const rule = await getRuleByCode(supabase, formData.bet_type, formData.region as any);

    if (!rule) {
      return {
        error: 'Loại cược không hợp lệ',
      };
    }

    // Tính toán tiền cược và tiềm năng thắng
    const calculationResult = calculateBetAmount(
      rule,
      formData.numbers,
      formData.amount,
      formData.subtype,
      formData.region
    );

    // Kiểm tra số dư ví
    const wallet = await getUserWallet(supabase, session.user.id);

    if (!wallet || wallet.balance < calculationResult.totalStake) {
      return {
        error: 'Số dư không đủ để đặt cược. Vui lòng nạp thêm tiền vào ví.',
        insufficientFunds: true,
        requiredAmount: calculationResult.totalStake,
        availableBalance: wallet ? wallet.balance : 0,
      };
    }

    // Tạo mã cược từ prefix ngày + loại cược
    const today = new Date().toISOString().slice(5, 10).replace(/-/g, ''); // MMDD format
    const betCodePrefix = today + formData.bet_type.substring(0, 2).toUpperCase();
    const betCode = generateBetCode(betCodePrefix);

    // Tạo cược mới
    const betData = {
      user_id: session.user.id,
      bet_code: betCode,
      rule_id: rule.id,
      region: formData.region,
      province: formData.province,
      subtype: formData.subtype,
      chosen_numbers: formData.numbers,
      amount: formData.amount,
      total_amount: calculationResult.totalStake,
      potential_win: calculationResult.potentialWin,
      draw_date: formData.draw_date,
    };

    // Lưu vào database
    const newBet = await createBet(supabase, betData);

    // Revalidate paths
    revalidatePath('/account/bets');
    revalidatePath('/bet');

    return {
      success: true,
      bet: newBet,
      betCode: betCode,
    };
  } catch (error: any) {
    console.error('Error creating bet:', error);

    // Handle different types of errors
    if (error.message?.includes('duplicate key')) {
      return {
        error: 'Mã cược đã tồn tại. Vui lòng thử lại.',
      };
    }

    if (error.message?.includes('insufficient funds')) {
      return {
        error: 'Số dư không đủ để đặt cược. Vui lòng nạp thêm tiền vào ví.',
        insufficientFunds: true,
      };
    }

    return {
      error: 'Đã xảy ra lỗi khi đặt cược. Vui lòng thử lại sau.',
    };
  }
}

/**
 * Server Action: Hủy cược
 */
export async function cancelBet(betId: string, redirectToList: boolean = false) {
  try {
    const supabase = await createServerClient();

    // Lấy thông tin user hiện tại
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return {
        error: 'Bạn cần đăng nhập để hủy cược',
        loginRequired: true,
      };
    }

    // Lấy thông tin cược
    const { data: bet } = await supabase
      .from('bets')
      .select('*')
      .eq('id', betId)
      .eq('user_id', session.user.id)
      .single();

    if (!bet) {
      return {
        error: 'Không tìm thấy cược hoặc bạn không có quyền hủy cược này',
      };
    }

    if (bet.status !== 'PENDING') {
      return {
        error: 'Chỉ có thể hủy cược đang chờ xử lý',
      };
    }

    // Cập nhật trạng thái cược
    const { error: updateError } = await supabase
      .from('bets')
      .update({
        status: 'CANCELLED',
        updated_at: new Date().toISOString(),
      })
      .eq('id', betId);

    if (updateError) {
      throw updateError;
    }

    // Hoàn tiền vào ví
    const { data: wallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (!wallet) {
      throw new Error('Không tìm thấy ví');
    }

    // Cập nhật ví
    const { error: walletError } = await supabase
      .from('wallets')
      .update({
        balance: wallet.balance + bet.total_amount,
        total_bet: wallet.total_bet - bet.total_amount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', wallet.id);

    if (walletError) {
      throw walletError;
    }

    // Tạo giao dịch hoàn tiền
    const { error: transactionError } = await supabase.from('transactions').insert({
      user_id: session.user.id,
      wallet_id: wallet.id,
      type: 'REFUND',
      amount: bet.total_amount,
      balance_before: wallet.balance,
      balance_after: wallet.balance + bet.total_amount,
      reference_id: betId,
      status: 'COMPLETED',
      notes: `Hoàn tiền do hủy cược - ${bet.bet_code}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (transactionError) {
      throw transactionError;
    }

    // Revalidate paths
    revalidatePath('/account/bets');
    revalidatePath('/bet');

    // Redirect if requested
    if (redirectToList) {
      redirect('/account/bets');
    }

    return {
      success: true,
      message: 'Hủy cược thành công',
    };
  } catch (error: any) {
    console.error('Error cancelling bet:', error);
    return {
      error: 'Đã xảy ra lỗi khi hủy cược. Vui lòng thử lại sau.',
    };
  }
}

/**
 * Server Action: Lấy thông tin cược
 */
export async function getBetByCode(betCode: string) {
  try {
    const supabase = await createServerClient();

    // Lấy thông tin cược
    const { data, error } = await supabase
      .from('bets')
      .select(
        `
        *,
        users (
          id, username, email
        ),
        rules (
          id, name, rule_code, bet_type, region, digits, rate
        )
      `
      )
      .eq('bet_code', betCode)
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      bet: data,
    };
  } catch (error) {
    console.error('Error getting bet by code:', error);
    return {
      error: 'Không tìm thấy phiếu cược với mã này',
    };
  }
}

/**
 * Server Action: Lấy lich sử cược gần đây
 */
export async function getRecentBets(limit: number = 5) {
  try {
    const supabase = await createServerClient();

    // Lấy thông tin user hiện tại
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return {
        error: 'Bạn cần đăng nhập để xem lịch sử cược',
        loginRequired: true,
      };
    }

    // Lấy cược gần đây
    const { data, error } = await supabase
      .from('bets')
      .select(
        `
        *,
        rules (
          id, name, rule_code, bet_type
        )
      `
      )
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return {
      success: true,
      bets: data,
    };
  } catch (error) {
    console.error('Error getting recent bets:', error);
    return {
      error: 'Đã xảy ra lỗi khi lấy lịch sử cược. Vui lòng thử lại sau.',
    };
  }
}
