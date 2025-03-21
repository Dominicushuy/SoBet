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
  const variants = rule.variants
    ? typeof rule.variants === 'string'
      ? JSON.parse(rule.variants as string)
      : rule.variants
    : null;

  // Xác định hệ số nhân dựa trên quy tắc và biến thể
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

  // Tính tổng tiền đóng
  const totalStake = amount * unitCount * multiplier;

  // Xác định tỷ lệ thưởng
  let rewardRate = rule.rate || 1;

  // Điều chỉnh tỷ lệ thưởng nếu cần thiết (cho Xiên, Đá)
  if (rule.rule_code === 'x') {
    if (subtype === 'x2') rewardRate = 75;
    else if (subtype === 'x3') rewardRate = 40;
    else if (subtype === 'x4') rewardRate = 250;
  } else if (rule.rule_code === 'da') {
    // Sử dụng tỷ lệ thưởng cơ bản cho Đá
    // (Tỷ lệ chính xác sẽ phụ thuộc vào kịch bản trúng thưởng)
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
 * Format giá tiền Việt Nam
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Tính tỷ lệ thưởng dựa trên loại cược và số chữ số
 */
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

/**
 * Xác định hệ số nhân cho stake dựa trên loại cược, miền và subtype
 */
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

/**
 * Kiểm tra số có hợp lệ cho loại cược không
 */
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

/**
 * Tạo mã cược ngẫu nhiên
 */
export function generateBetCode(prefix: string = ''): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = prefix;
  const randomPartLength = 8 - prefix.length;

  for (let i = 0; i < randomPartLength; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}
