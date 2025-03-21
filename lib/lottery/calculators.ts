// lib/lottery/calculators.ts
import { BetCalculationResult, Rule } from '@/types/bet';

/**
 * Tính toán tiền cược và tiềm năng thắng
 * @param rule Quy tắc cược
 * @param numbers Mảng các số đã chọn
 * @param amount Mệnh giá cho mỗi số
 * @param subtype Loại phụ (nếu có)
 * @param region Miền (M1 hoặc M2)
 */
export function calculateBetAmount(
  rule: Rule,
  numbers: string[],
  amount: number,
  subtype: string | undefined,
  region: string
): BetCalculationResult {
  // Xác định số chữ số
  const digitCount = rule.digits || 2;

  // Xác định số lượng đơn vị (số lượng số)
  const unitCount = numbers.length;

  // Xác định hệ số nhân dựa trên loại cược và miền
  let multiplier = 1;

  // Parse variants từ JSON nếu có
  const variants = parseVariants(rule.variants);

  // Xác định hệ số nhân dựa trên quy tắc và biến thể
  if (variants && subtype) {
    // Tìm variant phù hợp với subtype
    const variant = variants.find((v: any) => v.code === subtype);
    if (variant && variant.stakeMultiplier) {
      // Nếu có stakeMultiplier cho miền cụ thể
      multiplier =
        region === 'M1' ? variant.stakeMultiplier.M1 || 1 : variant.stakeMultiplier.M2 || 1;
    }
  }

  // Nếu không tìm thấy từ variants, sử dụng logic mặc định
  if (multiplier === 1) {
    switch (rule.rule_code) {
      case 'dd': // Đầu Đuôi
        if (region === 'M1') {
          multiplier = subtype === 'dd' ? 2 : 1;
        } else {
          // M2
          multiplier = subtype === 'dd' ? 5 : subtype === 'dau' ? 4 : 1;
        }
        break;

      case 'xc': // Xỉu Chủ
        if (region === 'M1') {
          multiplier = subtype === 'xc' ? 2 : 1;
        } else {
          // M2
          multiplier = subtype === 'xc' ? 4 : subtype === 'dau' ? 3 : 1;
        }
        break;

      case 'b2': // Bao Lô 2
        multiplier = region === 'M1' ? 18 : 27;
        break;

      case 'b3': // Bao Lô 3
        multiplier = region === 'M1' ? 17 : 23;
        break;

      case 'b4': // Bao Lô 4
        multiplier = region === 'M1' ? 16 : 20;
        break;

      case 'b7l': // Bao 7 Lô (chỉ M1)
        multiplier = 7;
        break;

      case 'b8l': // Bao 8 Lô (chỉ M2)
        multiplier = 8;
        break;

      case 'nt': // Nhất To (chỉ M2)
        multiplier = 1;
        break;

      case 'x': // Xiên (chỉ M2)
        multiplier = 27; // Tổng số lô M2
        break;

      case 'da': // Đá (chỉ M1)
        if (subtype === 'da2') multiplier = 1;
        else if (subtype === 'da3') multiplier = 3;
        else if (subtype === 'da4') multiplier = 6;
        else if (subtype === 'da5') multiplier = 10;
        break;

      default:
        // Nếu không tìm thấy quy tắc, sử dụng giá trị mặc định từ db
        if (rule.stake_formula) {
          try {
            // Thay thế eval bằng Function để an toàn hơn
            const safeCalculate = new Function(
              'region',
              'subtype',
              `return (${rule.stake_formula});`
            );
            multiplier = safeCalculate(region, subtype);
          } catch (error) {
            console.error('Error evaluating stake formula:', error);
            multiplier = 1;
          }
        }
        break;
    }
  }

  // Tính tổng tiền đóng
  const totalStake = amount * unitCount * multiplier;

  // Xác định tỷ lệ thưởng
  let rewardRate = rule.rate || 1;

  // Nếu variant có rate, sử dụng nó
  if (variants && subtype) {
    const variant = variants.find((v: any) => v.code === subtype);
    if (variant && variant.rate) {
      rewardRate = variant.rate;
    }
  }

  // Nếu không tìm thấy từ variants, sử dụng logic mặc định
  if (rewardRate === 1 && !rule.rate) {
    if (rule.rule_code === 'x') {
      if (subtype === 'x2') rewardRate = 75;
      else if (subtype === 'x3') rewardRate = 40;
      else if (subtype === 'x4') rewardRate = 250;
    } else if (rule.rule_code === 'da') {
      // Sử dụng tỷ lệ thưởng cơ bản cho Đá
      if (subtype === 'da2') rewardRate = 12.5;
      else if (subtype === 'da3')
        rewardRate = 37.5; // Tỷ lệ cơ bản
      else if (subtype === 'da4')
        rewardRate = 250; // Tỷ lệ cơ bản
      else if (subtype === 'da5') rewardRate = 1250; // Tỷ lệ cơ bản
    } else if (rule.rule_code.startsWith('b')) {
      // Điều chỉnh tỷ lệ cho bao lô dựa trên số chữ số
      if (digitCount === 2) rewardRate = 75;
      else if (digitCount === 3) rewardRate = 650;
      else if (digitCount === 4) rewardRate = 5500;
    } else if (rule.rule_code === 'dd' || rule.rule_code === 'nt') {
      rewardRate = 75;
    } else if (rule.rule_code === 'xc') {
      rewardRate = 650;
    }
  }

  // Tính tiềm năng thắng (mỗi số có thể thắng độc lập)
  const potentialWin = amount * rewardRate * unitCount;

  return {
    numbers,
    unitStake: amount,
    unitCount,
    multiplier,
    totalStake,
    potentialWin,
    rewardRate,
  };
}

/**
 * Tính toán tổng tiền cược và tiềm năng thắng cho nhiều tỉnh
 * @param rule Quy tắc cược
 * @param numbers Mảng các số đã chọn
 * @param amount Mệnh giá cho mỗi số
 * @param subtype Loại phụ (nếu có)
 * @param provinces Danh sách tỉnh đã chọn
 * @param provinceRegionMap Map tỉnh -> miền
 */
export function calculateMultiProvinceBetAmount(
  rule: Rule,
  numbers: string[],
  amount: number,
  subtype: string | undefined,
  provinces: string[],
  provinceRegionMap: Record<string, string>
): {
  totalStake: number;
  potentialWin: number;
  breakdowns: {
    province: string;
    region: string;
    stake: number;
    potentialWin: number;
  }[];
} {
  const breakdowns = provinces.map((province) => {
    const region = provinceRegionMap[province] || (province.includes('M1') ? 'M1' : 'M2'); // Fallback

    const result = calculateBetAmount(rule, numbers, amount, subtype, region);

    return {
      province,
      region,
      stake: result.totalStake,
      potentialWin: result.potentialWin,
    };
  });

  // Tổng hợp kết quả
  const totalStake = breakdowns.reduce((sum, item) => sum + item.stake, 0);
  const potentialWin = breakdowns.reduce((sum, item) => sum + item.potentialWin, 0);

  return {
    totalStake,
    potentialWin,
    breakdowns,
  };
}

/**
 * Hàm helper để parse variants từ schema
 */
function parseVariants(variants: any): any[] {
  if (!variants) return [];

  try {
    if (typeof variants === 'string') {
      return JSON.parse(variants);
    }
    return Array.isArray(variants) ? variants : [];
  } catch (error) {
    console.error('Error parsing variants:', error);
    return [];
  }
}

// Giữ lại các hàm hiện có
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function getRewardRate(betType: string, digitCount: number, subtype?: string): number {
  switch (betType) {
    case 'dd':
      return 75;
    case 'xc':
      return 650;
    case 'b2':
    case 'b7l':
    case 'b8l':
      return digitCount === 2 ? 75 : digitCount === 3 ? 650 : 5500;
    case 'b3':
      return 650;
    case 'b4':
      return 5500;
    case 'nt':
      return 75;
    case 'x':
      if (subtype === 'x2') return 75;
      if (subtype === 'x3') return 40;
      if (subtype === 'x4') return 250;
      return 75;
    case 'da':
      if (subtype === 'da2') return 12.5;
      if (subtype === 'da3') return 37.5;
      if (subtype === 'da4') return 250;
      if (subtype === 'da5') return 1250;
      return 12.5;
    default:
      return 1;
  }
}

export function getStakeMultiplier(betType: string, region: string, subtype?: string): number {
  switch (betType) {
    case 'dd':
      if (region === 'M1') {
        return subtype === 'dd' ? 2 : 1;
      } else {
        // M2
        return subtype === 'dd' ? 5 : subtype === 'dau' ? 4 : 1;
      }
    case 'xc':
      if (region === 'M1') {
        return subtype === 'xc' ? 2 : 1;
      } else {
        // M2
        return subtype === 'xc' ? 4 : subtype === 'dau' ? 3 : 1;
      }
    case 'b2':
      return region === 'M1' ? 18 : 27;
    case 'b3':
      return region === 'M1' ? 17 : 23;
    case 'b4':
      return region === 'M1' ? 16 : 20;
    case 'b7l':
      return 7;
    case 'b8l':
      return 8;
    case 'nt':
      return 1;
    case 'x':
      return 27;
    case 'da':
      if (subtype === 'da2') return 1;
      if (subtype === 'da3') return 3;
      if (subtype === 'da4') return 6;
      if (subtype === 'da5') return 10;
      return 1;
    default:
      return 1;
  }
}

export function isValidNumber(number: string, betType: string): boolean {
  if (!number) return false;

  switch (betType) {
    case 'dd':
    case 'nt':
    case 'b2':
    case 'x':
    case 'da':
      // 2 chữ số (00-99)
      return /^\d{2}$/.test(number);
    case 'xc':
    case 'b3':
      // 3 chữ số (000-999)
      return /^\d{3}$/.test(number);
    case 'b4':
      // 4 chữ số (0000-9999)
      return /^\d{4}$/.test(number);
    case 'b7l':
    case 'b8l':
      // 2, 3 hoặc 4 chữ số
      return /^\d{2,4}$/.test(number);
    default:
      return false;
  }
}

export function generateBetCode(prefix: string = ''): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = prefix;
  const randomPartLength = 8 - prefix.length;

  for (let i = 0; i < randomPartLength; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}
