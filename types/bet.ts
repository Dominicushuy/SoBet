export type BetStatus = 'PENDING' | 'VERIFIED' | 'WON' | 'LOST' | 'CANCELLED';

export interface BetFormData {
  region: 'M1' | 'M2' | '';
  province: string;
  bet_type: string;
  subtype?: string;
  selection_method: 'direct' | 'zodiac' | 'hiLo' | 'oddEven' | 'pattern';
  numbers: string[];
  amount: number;
  draw_date: string;
}

export interface Bet {
  id: string;
  bet_code: string;
  user_id: string;
  rule_id: string;
  rule_name?: string; // Tên của quy tắc cược
  region: 'M1' | 'M2';
  province: string;
  province_id?: string;
  subtype?: string;
  chosen_numbers: string[];
  amount: number;
  total_amount: number;
  potential_win: number;
  draw_date: string;
  status: BetStatus;
  result?: any;
  won_amount?: number;
  created_at: string;
  updated_at: string;
}

export interface BetWithDetails extends Bet {
  user?: {
    id: string;
    username: string;
    email: string;
  };
  province_info?: {
    id: string;
    name: string;
    region: string;
  };
  rule_details?: {
    id: string;
    name: string;
    bet_type: string;
    rule_code: string;
    rate: number;
  };
}

export interface BetVerificationResult {
  isWin: boolean;
  winningNumbers: string[];
  matchedPrizes: any[];
  totalWinAmount: number;
}

// Định nghĩa interface cho kết quả tính toán cược
export interface BetCalculationResult {
  numbers: string[];
  unitStake: number;
  unitCount: number;
  multiplier: number;
  totalStake: number;
  potentialWin: number;
  rewardRate: number;
}

// Định nghĩa interface cho Rule
export interface Rule {
  id: string;
  name: string;
  rule_code: string;
  bet_type: string;
  region: string;
  digits?: number;
  rate?: number;
  stake_formula?: string;
  variants?: any; // Thay bằng type cụ thể
  win_logic?: any; // Thay bằng type cụ thể
  active: boolean;
}
