// types/bet.ts

import { Json } from '@/lib/supabase/types';

// Đại diện cho một quy tắc cược từ database
export interface Rule {
  id: string;
  bet_type: string;
  name: string;
  description: string | null;
  rule_code: string; // dd, xc, b2, b3, b4, b7l, b8l, nt, x, da
  region: string; // M1, M2, BOTH
  digits: number | null;
  rate: number | null;
  stake_formula: string | null;
  variants: Json | null; // Các biến thể của quy tắc (như dd, dau, duoi)
  win_logic: Json | null; // Logic để xác định thắng/thua
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Đại diện cho một cược đã đặt trong database
export interface Bet {
  id: string;
  bet_code: string; // Mã cược duy nhất
  user_id: string;
  rule_id: string;
  region: string; // M1, M2
  province?: string; // Tỉnh/thành phố cụ thể (nếu có)
  subtype: string | null; // Biến thể cụ thể (dd, dau, duoi, x2, x3...)
  chosen_numbers: string[]; // Các số đã chọn
  amount: number; // Mệnh giá cho mỗi số
  total_amount: number; // Tổng tiền đóng
  potential_win: number; // Tiềm năng thắng tối đa
  draw_date: string; // Ngày xổ
  status: BetStatus;
  result: Json | null; // Kết quả kiểm tra
  won_amount: number | null; // Tiền thắng thực tế
  created_at: string;
  updated_at: string;
}

export type BetStatus = 'PENDING' | 'VERIFIED' | 'WON' | 'LOST' | 'CANCELLED';

// Dữ liệu cho form đặt cược
export interface BetFormData {
  region: string;
  province?: string;
  bet_type: string;
  subtype?: string;
  selection_method: string;
  numbers: string[];
  amount: number;
  draw_date: string;
}

// Interface cho các tham số chọn số
export interface NumberSelectionParams {
  type: string; // 'DIRECT', 'ZODIAC', 'PERMUTATION', 'HI_LO', 'ODD_EVEN', 'PATTERN'
  digits?: number;
  animalCode?: string; // Cho con giáp
  baseNumber?: string; // Cho hoán vị
  hiLo?: 'hi' | 'lo'; // Cho Tài/Xỉu
  oddEven?: 'odd' | 'even'; // Cho Chẵn/Lẻ
  pattern?: string; // Cho kéo số
}

// Interface cho kết quả tính toán
export interface BetCalculationResult {
  numbers: string[];
  unitStake: number; // Mệnh giá cho mỗi số
  unitCount: number; // Số lượng đơn vị (số hoặc cặp số)
  multiplier: number; // Hệ số nhân dựa trên loại cược
  totalStake: number; // Tổng tiền đóng
  potentialWin: number; // Tiềm năng thắng tối đa
  rewardRate: number; // Tỷ lệ thưởng
}

// Interface cho kết quả đối soát
export interface BetVerificationResult {
  betId: string;
  isWin: boolean;
  winningNumbers: string[];
  totalWinAmount: number;
  details?: any;
}

// Interface cho rule variants
export interface RuleVariant {
  code: string;
  name: string;
  description?: string;
  stakeMultiplier: {
    M1?: number;
    M2?: number;
  };
}

// Interface cho win logic
export interface WinLogicConfig {
  type: 'SIMPLE' | 'COMPLEX';
  prizes: {
    M1?: string[];
    M2?: string[];
  };
  digitPosition: 'LAST' | 'FIRST' | 'ALL';
  digitCount: number;
  matchType?: 'ANY' | 'ALL';
  specialCases?: any;
}

// Interface cho bet request từ client
export interface CreateBetRequest {
  rule_id: string;
  region: string;
  province?: string;
  subtype?: string;
  chosen_numbers: string[];
  amount: number;
  draw_date: string;
}

// Interface cho bet response về client
export interface BetResponse {
  id: string;
  bet_code: string;
  rule: {
    name: string;
    rule_code: string;
  };
  region: string;
  province?: string;
  subtype?: string;
  chosen_numbers: string[];
  amount: number;
  total_amount: number;
  potential_win: number;
  draw_date: string;
  status: BetStatus;
  created_at: string;
}

// Interface cho kết quả xổ số compact để hiển thị
export interface LotteryResultCompact {
  id: string;
  draw_date: string;
  province: string;
  region: string;
  special_prize: string;
  first_prize: string;
  last_two_digits: string[];
  last_three_digits: string[];
  created_at: string;
}

// Interface cho form validation
export interface BetFormValidation {
  region: boolean;
  province: boolean;
  bet_type: boolean;
  subtype: boolean;
  numbers: boolean;
  amount: boolean;
  draw_date: boolean;
  errors: {
    [key: string]: string;
  };
}
