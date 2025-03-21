// lib/lottery/bet-types.ts

export interface BetType {
  id: string;
  code: string;
  name: string;
  description: string;
  region: 'M1' | 'M2' | 'BOTH';
  digitCount: number;
  subtypes: SubType[];
  stakeCalculation: StakeCalculation;
  rewardRate: RewardRate;
  winLogic: WinLogic;
  isActive: boolean;
}

export interface SubType {
  id: string;
  code: string;
  name: string;
  description?: string;
}

export interface StakeCalculation {
  type: 'FIXED' | 'FORMULA';
  formula?: string; // Công thức tính động
  // Giá trị cố định
  M1?: {
    [subtype: string]: number; // Hệ số nhân cho mỗi subtype
  };
  M2?: {
    [subtype: string]: number; // Hệ số nhân cho mỗi subtype
  };
}

export interface RewardRate {
  type: 'FIXED' | 'VARIABLE';
  rate: number; // Tỷ lệ cố định
  variableRates?: {
    // Tỷ lệ biến đổi (như trong Đá)
    [scenario: string]: number;
  };
}

export interface WinLogic {
  type: 'SIMPLE' | 'COMPLEX';
  prizesM1?: string[]; // Mã giải thưởng cần kiểm tra cho M1
  prizesM2?: string[]; // Mã giải thưởng cần kiểm tra cho M2
  digitPosition?: 'LAST' | 'FIRST' | 'ALL'; // Vị trí số cần kiểm tra
  digitCount?: number; // Số lượng chữ số cần kiểm tra
  specialLogic?: string; // Logic đặc biệt cho điều kiện thắng phức tạp
}

// Ví dụ loại cược Đầu Đuôi (dd)
export const dauDuoiType: BetType = {
  id: '1',
  code: 'dd',
  name: 'Đầu Đuôi',
  description: 'Cá cược số 2 chữ số với đầu (giải 8/7) hoặc đuôi (giải đặc biệt)',
  region: 'BOTH',
  digitCount: 2,
  subtypes: [
    {
      id: '1a',
      code: 'dd',
      name: 'Đầu Đuôi Toàn Phần',
      description: 'Cược cả đầu và đuôi',
    },
    {
      id: '1b',
      code: 'dau',
      name: 'Chỉ Đầu',
      description: 'Chỉ cược đầu',
    },
    {
      id: '1c',
      code: 'duoi',
      name: 'Chỉ Đuôi',
      description: 'Chỉ cược đuôi',
    },
  ],
  stakeCalculation: {
    type: 'FIXED',
    M1: {
      dd: 2,
      dau: 1,
      duoi: 1,
    },
    M2: {
      dd: 5,
      dau: 4,
      duoi: 1,
    },
  },
  rewardRate: {
    type: 'FIXED',
    rate: 75,
  },
  winLogic: {
    type: 'SIMPLE',
    prizesM1: ['G8', 'DB'],
    prizesM2: ['G7', 'DB'],
    digitPosition: 'LAST',
    digitCount: 2,
  },
  isActive: true,
};

// Lấy tất cả các loại cược
export async function getBetTypes(): Promise<BetType[]> {
  // Trong thực tế, có thể gọi API hoặc lấy từ database
  return [
    dauDuoiType,
    // Thêm các loại cược khác
  ];
}
