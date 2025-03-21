'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { calculateBetAmount } from '@/lib/lottery/calculators';
import { createBet } from '@/lib/supabase/mutations';
import { getRuleByCode } from '@/lib/supabase/queries';
import createServerClient from '@/lib/supabase/server';
import { BetFormData } from '@/types/bet';

/**
 * Server Action: Tạo một cược mới
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
    const { data: wallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', session.user.id)
      .single();

    if (!wallet || wallet.balance < calculationResult.totalStake) {
      return {
        error: 'Số dư không đủ để đặt cược',
      };
    }

    // Tạo cược mới
    const betData = {
      user_id: session.user.id,
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
    };
  } catch (error) {
    console.error('Error creating bet:', error);
    return {
      error: 'Đã xảy ra lỗi khi đặt cược. Vui lòng thử lại sau.',
    };
  }
}

/**
 * Server Action: Hủy một cược
 */
export async function cancelBet(betId: string) {
  try {
    const supabase = await createServerClient();

    // Lấy thông tin user hiện tại
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return {
        error: 'Bạn cần đăng nhập để hủy cược',
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
      notes: 'Hoàn tiền do hủy cược',
    });

    if (transactionError) {
      throw transactionError;
    }

    // Revalidate paths
    revalidatePath('/account/bets');

    return {
      success: true,
      message: 'Hủy cược thành công',
    };
  } catch (error) {
    console.error('Error cancelling bet:', error);
    return {
      error: 'Đã xảy ra lỗi khi hủy cược. Vui lòng thử lại sau.',
    };
  }
}
