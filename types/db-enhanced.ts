// types/db-enhanced.ts
import { Tables } from '@/lib/supabase/types';

/**
 * Các kiểu dữ liệu nâng cao từ Database Supabase để sử dụng trong ứng dụng
 */

// Loại khu vực xổ số
export type LotteryRegion = 'M1' | 'M2' | 'BOTH';

// Trạng thái cược
export type BetStatus = 'PENDING' | 'VERIFIED' | 'WON' | 'LOST' | 'CANCELLED';

// Loại giao dịch
export type TransactionType = 'DEPOSIT' | 'WITHDRAW' | 'BET' | 'WIN' | 'REFUND';

// User với role
export interface User extends Tables<'users'> {
  role: string;
}

// Province với thông tin đầy đủ
export interface Province extends Tables<'provinces'> {
  sub_region: string | null;
}

// Rule với variants và win_logic đã parse
export interface Rule extends Tables<'rules'> {
  variants: RuleVariant[] | null;
  win_logic: WinLogicConfig | null;
}

// Bet với thông tin rule
export interface BetWithRule extends Tables<'bets'> {
  rules: Rule;
}

// Bet với kết quả đã parse
export interface VerifiedBet extends Tables<'bets'> {
  result: BetVerificationResult | null;
}

// Wallet với thông tin user
export interface WalletWithUser extends Tables<'wallets'> {
  users: {
    username: string;
    email: string;
  };
}

// Transaction với thông tin bet
export interface TransactionWithReference extends Tables<'transactions'> {
  bets?: {
    bet_code: string;
    rule_id: string;
    province: string;
    draw_date: string;
  };
}

// Result với winning_numbers đã parse
export interface ParsedResult extends Tables<'results'> {
  winning_numbers: {
    giaiDacBiet: string[];
    giaiNhat: string[];
    giaiNhi: string[];
    giaiBa: string[];
    giaiTu: string[];
    giaiNam: string[];
    giaiSau: string[];
    giaiBay: string[];
    giaiTam?: string[];
  };
}

// Kết quả xác minh cược
export interface BetVerificationResult {
  isWin: boolean;
  winningNumbers: string[];
  totalWinAmount: number;
  winDetails?: any;
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

// Thông tin tỉnh/thành phố xổ số theo ngày
export interface ProvinceByDay {
  province_id: string;
  province_name: string;
  region: string;
  sub_region: string | null;
}

// Thông tin kết quả xổ số compact để hiển thị
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

// Payload đăng ký người dùng
export interface RegisterUserPayload {
  email: string;
  password: string;
  username: string;
}

// Payload đăng nhập
export interface SignInPayload {
  email: string;
  password: string;
}

// Thông tin tài khoản người dùng đầy đủ
export interface UserAccount {
  id: string;
  email: string;
  username: string;
  role: string;
  wallet: {
    balance: number;
    total_bet: number;
    total_win: number;
  };
  created_at: string;
}
