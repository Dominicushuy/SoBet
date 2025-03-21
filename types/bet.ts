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
