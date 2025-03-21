// lib/actions/multi-bets.ts
'use server';

import { revalidatePath } from 'next/cache';

import { calculateBetAmount, generateBetCode } from '@/lib/lottery/calculators';
import { createBet } from '@/lib/supabase/mutations';
import { getRuleByCode, getUserWallet } from '@/lib/supabase/queries';
import createServerClient from '@/lib/supabase/server';
import { MultiBetFormValues } from '@/lib/validators/bet-form';

// Map tỉnh -> khu vực
const provinceRegionMap: Record<string, string> = {
  // Miền Nam & Miền Trung (M1)
  'TP. HCM': 'M1',
  'Đồng Nai': 'M1',
  'Cần Thơ': 'M1',
  'Đồng Tháp': 'M1',
  'Cà Mau': 'M1',
  'Bến Tre': 'M1',
  'Vũng Tàu': 'M1',
  'Bạc Liêu': 'M1',
  'Đà Nẵng': 'M1',
  'Khánh Hòa': 'M1',
  'Thừa T. Huế': 'M1',
  'Quảng Nam': 'M1',
  'Quảng Bình': 'M1',
  'Quảng Trị': 'M1',
  'Bình Định': 'M1',
  'Phú Yên': 'M1',
  'Gia Lai': 'M1',
  'Ninh Thuận': 'M1',

  // Miền Bắc (M2)
  'Hà Nội': 'M2',
  'Quảng Ninh': 'M2',
  'Bắc Ninh': 'M2',
  'Hải Phòng': 'M2',
  'Nam Định': 'M2',
  'Thái Bình': 'M2',
};

/**
 * Server Action: Tạo cược mới cho nhiều tỉnh
 */
export async function createMultiProvinceBet(formData: MultiBetFormValues) {
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
    const rule = await getRuleByCode(supabase, formData.bet_type);

    if (!rule) {
      return {
        error: 'Loại cược không hợp lệ',
      };
    }

    // Kiểm tra số dư ví
    const wallet = await getUserWallet(supabase, session.user.id);
    if (!wallet) {
      return {
        error: 'Không tìm thấy thông tin ví',
      };
    }

    // Tính toán tổng tiền cược cho tất cả tỉnh
    let totalStake = 0;
    let totalPotentialWin = 0;

    // Chuẩn bị mảng kết quả tính toán cho từng tỉnh
    const provinceResults = [];

    // Tạo mã cược cơ sở
    const today = new Date().toISOString().slice(5, 10).replace(/-/g, ''); // MMDD format
    const baseBetCodePrefix = today + formData.bet_type.substring(0, 2).toUpperCase();

    // Tính toán cho từng tỉnh
    for (const province of formData.provinces) {
      // Xác định khu vực cho tỉnh
      const region =
        provinceRegionMap[province] ||
        (province.includes('Miền Nam') || province.includes('Miền Trung') ? 'M1' : 'M2');

      // Tính toán cược cho tỉnh này
      const betResult = calculateBetAmount(
        rule,
        formData.numbers,
        formData.amount,
        formData.subtype,
        region
      );

      totalStake += betResult.totalStake;
      totalPotentialWin += betResult.potentialWin;

      // Thêm vào kết quả tính toán
      provinceResults.push({
        province,
        region,
        stake: betResult.totalStake,
        potentialWin: betResult.potentialWin,
        betResult,
      });
    }

    // Kiểm tra số dư
    if (wallet.balance < totalStake) {
      return {
        error: 'Số dư không đủ để đặt cược. Vui lòng nạp thêm tiền vào ví.',
        insufficientFunds: true,
        requiredAmount: totalStake,
        availableBalance: wallet.balance,
      };
    }

    // Tạo cược cho từng tỉnh
    const createdBets = [];
    const betCodes = [];

    for (const result of provinceResults) {
      // Tạo mã cược độc nhất cho mỗi vé
      const betCode = generateBetCode(baseBetCodePrefix);
      betCodes.push(betCode);

      // Dữ liệu cược
      const betData = {
        user_id: session.user.id,
        bet_code: betCode,
        rule_id: rule.id,
        region: result.region,
        province: result.province,
        subtype: formData.subtype,
        chosen_numbers: formData.numbers,
        amount: formData.amount,
        total_amount: result.stake,
        potential_win: result.potentialWin,
        draw_date: formData.draw_date,
      };

      // Lưu vào database
      const newBet = await createBet(supabase, betData);
      createdBets.push(newBet);
    }

    // Revalidate paths
    revalidatePath('/account/bets');
    revalidatePath('/bet');

    return {
      success: true,
      bets: createdBets,
      betCodes: betCodes,
      totalStake,
      totalPotentialWin,
      provinceCount: formData.provinces.length,
    };
  } catch (error: any) {
    console.error('Error creating multi-province bet:', error);

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
