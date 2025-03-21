'use server';

import { revalidatePath } from 'next/cache';

import { verifyBetResult } from '@/lib/lottery/result-verifier';
import { addLotteryResult, updateBetAfterVerification } from '@/lib/supabase/mutations';
import { getBetDetails } from '@/lib/supabase/queries';
import createServerClient from '@/lib/supabase/server';
import { SavedResult } from '@/types/result';

/**
 * Server Action: Xác nhận kết quả xổ số
 */
export async function submitLotteryResult(resultData: {
  draw_date: string;
  province: string;
  region: string;
  winning_numbers: any;
}) {
  try {
    const supabase = await createServerClient();

    // Lấy thông tin user hiện tại (chỉ admin mới có quyền)
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return {
        error: 'Bạn cần đăng nhập để thực hiện hành động này',
      };
    }

    // Kiểm tra quyền admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!userData || userData.role !== 'admin') {
      return {
        error: 'Bạn không có quyền thực hiện hành động này',
      };
    }

    // Thêm/cập nhật kết quả xổ số
    const result = await addLotteryResult(supabase, resultData);

    // Revalidate paths
    revalidatePath('/results');
    revalidatePath('/verification');

    return {
      success: true,
      result,
    };
  } catch (error) {
    console.error('Error submitting lottery result:', error);
    return {
      error: 'Đã xảy ra lỗi khi cập nhật kết quả xổ số. Vui lòng thử lại sau.',
    };
  }
}

/**
 * Server Action: Lấy kết quả cược dựa trên mã cược
 */
export async function verifyBetByCode(betCode: string) {
  try {
    const supabase = await createServerClient();

    // Tìm cược theo mã
    const { data: bet, error: betError } = await supabase
      .from('bets')
      .select(
        `
        *,
        rules (
          id, name, rule_code, bet_type, digits, rate, variants, win_logic
        )
      `
      )
      .eq('bet_code', betCode)
      .single();

    if (betError || !bet) {
      return {
        error: 'Không tìm thấy phiếu cược với mã này',
      };
    }

    // Kiểm tra nếu cược đã được xác minh
    if (bet.status !== 'PENDING') {
      return {
        bet,
        verified: true,
        message: 'Phiếu cược này đã được kiểm tra',
      };
    }

    // Lấy kết quả xổ số
    const { data: result, error: resultError } = await supabase
      .from('results')
      .select('*')
      .eq('draw_date', bet.draw_date)
      .eq('province', bet.province)
      .single();

    if (resultError || !result) {
      return {
        bet,
        verified: false,
        message: 'Chưa có kết quả xổ số cho ngày và tỉnh này',
      };
    }

    // Xác minh kết quả
    const verificationResult = verifyBetResult(bet, result as SavedResult);

    // Cập nhật trạng thái cược
    const updatedBet = await updateBetAfterVerification(supabase, bet.id, verificationResult);

    // Revalidate paths
    revalidatePath('/verification');
    revalidatePath('/account/bets');

    return {
      success: true,
      bet: updatedBet,
      verificationResult,
    };
  } catch (error) {
    console.error('Error verifying bet:', error);
    return {
      error: 'Đã xảy ra lỗi khi kiểm tra phiếu cược. Vui lòng thử lại sau.',
    };
  }
}

/**
 * Server Action: Xác minh nhiều phiếu cược theo ngày và tỉnh
 */
export async function verifyBetsByDate(draw_date: string, province: string) {
  try {
    const supabase = await createServerClient();

    // Lấy thông tin user hiện tại (chỉ admin mới có quyền)
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return {
        error: 'Bạn cần đăng nhập để thực hiện hành động này',
      };
    }

    // Kiểm tra quyền admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!userData || userData.role !== 'admin') {
      return {
        error: 'Bạn không có quyền thực hiện hành động này',
      };
    }

    // Lấy kết quả xổ số
    const { data: result, error: resultError } = await supabase
      .from('results')
      .select('*')
      .eq('draw_date', draw_date)
      .eq('province', province)
      .single();

    if (resultError || !result) {
      return {
        error: 'Chưa có kết quả xổ số cho ngày và tỉnh này',
      };
    }

    // Lấy danh sách các cược chưa được xác minh
    const { data: bets, error: betsError } = await supabase
      .from('bets')
      .select(
        `
        *,
        rules (
          id, name, rule_code, bet_type, digits, rate, variants, win_logic
        )
      `
      )
      .eq('draw_date', draw_date)
      .eq('province', province)
      .eq('status', 'PENDING');

    if (betsError) {
      return {
        error: 'Không thể lấy danh sách phiếu cược',
      };
    }

    if (!bets || bets.length === 0) {
      return {
        success: true,
        message: 'Không có phiếu cược nào cần xác minh',
        verifiedCount: 0,
      };
    }

    // Xác minh từng cược
    const verificationResults = [];
    for (const bet of bets) {
      const verificationResult = verifyBetResult(bet, result as SavedResult);
      await updateBetAfterVerification(supabase, bet.id, verificationResult);
      verificationResults.push({
        bet_code: bet.bet_code,
        isWin: verificationResult.isWin,
        winAmount: verificationResult.totalWinAmount,
      });
    }

    // Revalidate paths
    revalidatePath('/verification');
    revalidatePath('/admin');

    return {
      success: true,
      message: `Đã xác minh ${bets.length} phiếu cược`,
      verifiedCount: bets.length,
      results: verificationResults,
    };
  } catch (error) {
    console.error('Error verifying multiple bets:', error);
    return {
      error: 'Đã xảy ra lỗi khi xác minh các phiếu cược. Vui lòng thử lại sau.',
    };
  }
}
