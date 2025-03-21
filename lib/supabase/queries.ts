// lib/supabase/queries.ts
import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from './types';

type Client = SupabaseClient<Database>;

/**
 * Lấy tất cả tỉnh/thành phố theo khu vực
 * @param supabase Supabase client
 * @param region Khu vực (M1, M2, BOTH)
 * @returns Danh sách tỉnh/thành phố theo khu vực
 */
export async function getProvincesByRegion(
  supabase: Client,
  region: 'M1' | 'M2' | 'BOTH' = 'BOTH'
) {
  let query = supabase.from('provinces').select('*').eq('is_active', true).order('name');

  if (region !== 'BOTH') {
    query = query.eq('region', region);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching provinces:', error);
    throw error;
  }

  return data;
}

/**
 * Lấy tất cả tỉnh/thành phố xổ số theo ngày trong tuần
 * @param supabase Supabase client
 * @param dayOfWeek Ngày trong tuần (0: CN, 1-6: T2-T7)
 * @param region Khu vực (M1, M2, BOTH)
 * @returns Danh sách tỉnh/thành phố xổ số trong ngày
 */
export async function getProvincesForDay(
  supabase: Client,
  dayOfWeek: number,
  region: 'M1' | 'M2' | 'BOTH' = 'BOTH'
) {
  // Sử dụng function trong database để lấy theo ngày
  const { data, error } = await supabase.rpc('get_provinces_by_day_of_week', {
    day: dayOfWeek,
  });

  if (error) {
    console.error('Error fetching provinces for day:', error);
    throw error;
  }

  // Lọc theo region nếu cần
  if (region !== 'BOTH') {
    return data.filter((p) => p.region === region);
  }

  return data;
}

/**
 * Lấy quy tắc cược theo loại
 * @param supabase Supabase client
 * @param ruleCode Mã quy tắc (dd, xc, b2, b3, b4, etc.)
 * @param region Khu vực (M1, M2, BOTH)
 * @returns Quy tắc cược tương ứng
 */
export async function getRuleByCode(supabase: Client, ruleCode: string, region?: 'M1' | 'M2') {
  let query = supabase.from('rules').select('*').eq('rule_code', ruleCode).eq('active', true);

  if (region) {
    query = query.or(`region.eq.${region},region.eq.BOTH`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching rule:', error);
    throw error;
  }

  return data[0] || null;
}

/**
 * Lấy tất cả quy tắc cược đang hoạt động
 * @param supabase Supabase client
 * @param region Khu vực (M1, M2, BOTH)
 * @returns Danh sách quy tắc cược
 */
export async function getAllActiveRules(supabase: Client, region?: 'M1' | 'M2') {
  let query = supabase.from('rules').select('*').eq('active', true).order('name');

  if (region) {
    query = query.or(`region.eq.${region},region.eq.BOTH`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching rules:', error);
    throw error;
  }

  return data;
}

/**
 * Lấy lịch sử cược của người dùng
 * @param supabase Supabase client
 * @param userId ID người dùng
 * @param status Trạng thái cược (optional)
 * @param limit Số lượng kết quả (mặc định: 50)
 * @returns Danh sách cược của người dùng
 */
export async function getUserBets(supabase: Client, userId: string, status?: string, limit = 50) {
  let query = supabase
    .from('bets')
    .select(
      `
      *,
      rules (
        id, name, rule_code, bet_type
      )
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching user bets:', error);
    throw error;
  }

  return data;
}

/**
 * Lấy kết quả xổ số theo ngày và tỉnh
 * @param supabase Supabase client
 * @param date Ngày xổ số (YYYY-MM-DD)
 * @param province Tỉnh/thành phố
 * @returns Kết quả xổ số
 */
export async function getLotteryResult(supabase: Client, date: string, province: string) {
  const { data, error } = await supabase
    .from('results')
    .select('*')
    .eq('draw_date', date)
    .eq('province', province)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 là lỗi không tìm thấy kết quả
    console.error('Error fetching lottery result:', error);
    throw error;
  }

  return data || null;
}

/**
 * Lấy thông tin chi tiết về một cược
 * @param supabase Supabase client
 * @param betId ID của cược
 * @returns Chi tiết cược với thông tin quy tắc
 */
export async function getBetDetails(supabase: Client, betId: string) {
  const { data, error } = await supabase
    .from('bets')
    .select(
      `
      *,
      rules (
        id, name, rule_code, bet_type, digits, rate, variants, win_logic
      )
    `
    )
    .eq('id', betId)
    .single();

  if (error) {
    console.error('Error fetching bet details:', error);
    throw error;
  }

  return data;
}

/**
 * Lấy kết quả xổ số mới nhất
 * @param supabase Supabase client
 * @param limit Số lượng kết quả (mặc định: 10)
 * @returns Danh sách kết quả xổ số mới nhất
 */
export async function getLatestResults(supabase: Client, limit = 10) {
  const { data, error } = await supabase
    .from('results')
    .select('*')
    .order('draw_date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching latest results:', error);
    throw error;
  }

  return data;
}

/**
 * Lấy thông tin số dư ví của người dùng
 * @param supabase Supabase client
 * @param userId ID người dùng
 * @returns Thông tin ví
 */
export async function getUserWallet(supabase: Client, userId: string) {
  const { data, error } = await supabase.from('wallets').select('*').eq('user_id', userId).single();

  if (error) {
    console.error('Error fetching user wallet:', error);
    throw error;
  }

  return data;
}
