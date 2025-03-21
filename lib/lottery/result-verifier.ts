// lib/lottery/result-verifier.ts
import { Rule, Bet } from '@/types/bet';
import { SavedResult } from '@/types/result';

export interface VerificationResult {
  isWin: boolean;
  winningNumbers: string[];
  totalWinAmount: number;
  winDetails?: any;
}

/**
 * Xác minh kết quả cược với kết quả xổ số
 */
export function verifyBetResult(
  bet: Bet & { rules: Rule },
  results: SavedResult
): VerificationResult {
  const betType = bet.rules.rule_code;
  const subtype = bet.subtype || '';
  const region = bet.region;
  const numbers = bet.chosen_numbers;
  const amount = bet.amount;

  // Chọn hàm xác minh dựa trên loại cược
  switch (betType) {
    case 'dd':
      return verifyDauDuoi(
        {
          numbers,
          subtype,
          region,
          amount,
          province: bet.province,
          drawDate: bet.draw_date,
        },
        results
      );
    case 'xc':
      return verifyXiuChu(
        {
          numbers,
          subtype,
          region,
          amount,
          province: bet.province,
          drawDate: bet.draw_date,
        },
        results
      );
    case 'b2':
    case 'b3':
    case 'b4':
      return verifyBaoLo(
        {
          numbers,
          subtype: betType, // b2, b3, b4
          region,
          amount,
          province: bet.province,
          drawDate: bet.draw_date,
        },
        results
      );
    case 'b7l':
      return verifyBao7Lo(
        {
          numbers,
          digitCount: Number(betType.charAt(1)) || 2, // Lấy số chữ số từ mã cược
          region,
          amount,
          province: bet.province,
          drawDate: bet.draw_date,
        },
        results
      );
    case 'b8l':
      return verifyBao8Lo(
        {
          numbers,
          digitCount: Number(betType.charAt(1)) || 2, // Lấy số chữ số từ mã cược
          region,
          amount,
          province: bet.province,
          drawDate: bet.draw_date,
        },
        results
      );
    case 'nt':
      return verifyNhatTo(
        {
          numbers,
          region,
          amount,
          province: bet.province,
          drawDate: bet.draw_date,
        },
        results
      );
    case 'x':
      return verifyXien(
        {
          numbers,
          subtype, // x2, x3, x4
          region,
          amount,
          province: bet.province,
          drawDate: bet.draw_date,
        },
        results
      );
    case 'da':
      return verifyDa(
        {
          numbers,
          subtype, // da2, da3, da4, da5
          region,
          amount,
          province: bet.province,
          drawDate: bet.draw_date,
        },
        results
      );
    default:
      throw new Error(`Loại cược không được hỗ trợ: ${betType}`);
  }
}

/**
 * Lấy tất cả số trúng từ kết quả xổ số
 */
function getAllWinningNumbers(results: SavedResult, digitCount: number): Record<string, string[]> {
  const winningNumbers: Record<string, string[]> = {};
  const resultObj = results.winning_numbers;

  for (const [prize, numbers] of Object.entries(resultObj)) {
    winningNumbers[prize] = numbers.map((n) => n.slice(-digitCount));
  }

  return winningNumbers;
}

/**
 * Xác minh cược Đầu Đuôi
 */
function verifyDauDuoi(
  bet: {
    numbers: string[];
    subtype: string;
    region: string;
    amount: number;
    province: string;
    drawDate: string;
  },
  results: SavedResult
): VerificationResult {
  const winningNumbers: string[] = [];
  let totalWinAmount = 0;
  const rewardRate = 75; // Tỷ lệ thưởng cố định cho Đầu Đuôi

  const winningData = results.winning_numbers;

  for (const number of bet.numbers) {
    if (bet.region === 'M1') {
      // Kiểm tra đầu (giải tám - G8)
      if (bet.subtype === 'dd' || bet.subtype === 'dau') {
        const g8 = winningData.giaiTam?.[0];
        if (g8 === number) {
          winningNumbers.push(`${number} (Giải 8)`);
          totalWinAmount += bet.amount * rewardRate;
        }
      }

      // Kiểm tra đuôi (giải đặc biệt - cuối)
      if (bet.subtype === 'dd' || bet.subtype === 'duoi') {
        const db = winningData.giaiDacBiet[0];
        const dbTail = db.slice(-2);
        if (dbTail === number) {
          winningNumbers.push(`${number} (Đặc Biệt)`);
          totalWinAmount += bet.amount * rewardRate;
        }
      }
    } else if (bet.region === 'M2') {
      // Kiểm tra đầu (giải bảy - G7)
      if (bet.subtype === 'dd' || bet.subtype === 'dau') {
        for (const g7 of winningData.giaiBay) {
          if (g7 === number) {
            winningNumbers.push(`${number} (Giải 7)`);
            totalWinAmount += bet.amount * rewardRate;
            break; // Chỉ tính một lần ngay cả khi số xuất hiện nhiều lần
          }
        }
      }

      // Kiểm tra đuôi (giải đặc biệt - cuối)
      if (bet.subtype === 'dd' || bet.subtype === 'duoi') {
        const db = winningData.giaiDacBiet[0];
        const dbTail = db.slice(-2);
        if (dbTail === number) {
          winningNumbers.push(`${number} (Đặc Biệt)`);
          totalWinAmount += bet.amount * rewardRate;
        }
      }
    }
  }

  return {
    isWin: winningNumbers.length > 0,
    winningNumbers,
    totalWinAmount,
  };
}

/**
 * Xác minh cược Xỉu Chủ
 */
function verifyXiuChu(
  bet: {
    numbers: string[];
    subtype: string;
    region: string;
    amount: number;
    province: string;
    drawDate: string;
  },
  results: SavedResult
): VerificationResult {
  const winningNumbers: string[] = [];
  let totalWinAmount = 0;
  const rewardRate = 650; // Tỷ lệ thưởng cố định cho Xỉu Chủ

  const winningData = results.winning_numbers;

  for (const number of bet.numbers) {
    if (bet.region === 'M1') {
      // Kiểm tra đầu (giải bảy - G7)
      if (bet.subtype === 'xc' || bet.subtype === 'dau') {
        const g7 = winningData.giaiBay?.[0];
        if (g7 === number) {
          winningNumbers.push(`${number} (Giải 7)`);
          totalWinAmount += bet.amount * rewardRate;
        }
      }

      // Kiểm tra đuôi (giải đặc biệt - 3 số cuối)
      if (bet.subtype === 'xc' || bet.subtype === 'duoi') {
        const db = winningData.giaiDacBiet[0];
        const dbTail = db.slice(-3);
        if (dbTail === number) {
          winningNumbers.push(`${number} (Đặc Biệt)`);
          totalWinAmount += bet.amount * rewardRate;
        }
      }
    } else if (bet.region === 'M2') {
      // Kiểm tra đầu (giải sáu - G6)
      if (bet.subtype === 'xc' || bet.subtype === 'dau') {
        for (const g6 of winningData.giaiSau) {
          if (g6 === number) {
            winningNumbers.push(`${number} (Giải 6)`);
            totalWinAmount += bet.amount * rewardRate;
            break;
          }
        }
      }

      // Kiểm tra đuôi (giải đặc biệt - 3 số cuối)
      if (bet.subtype === 'xc' || bet.subtype === 'duoi') {
        const db = winningData.giaiDacBiet[0];
        const dbTail = db.slice(-3);
        if (dbTail === number) {
          winningNumbers.push(`${number} (Đặc Biệt)`);
          totalWinAmount += bet.amount * rewardRate;
        }
      }
    }
  }

  return {
    isWin: winningNumbers.length > 0,
    winningNumbers,
    totalWinAmount,
  };
}

/**
 * Xác minh cược Bao Lô
 */
function verifyBaoLo(
  bet: {
    numbers: string[];
    subtype: string; // b2, b3, b4
    region: string;
    amount: number;
    province: string;
    drawDate: string;
  },
  results: SavedResult
): VerificationResult {
  const winningNumbers: string[] = [];
  let totalWinAmount = 0;

  // Xác định số chữ số và tỷ lệ thưởng
  let digitCount = 2;
  let rewardRate = 75;

  if (bet.subtype === 'b3') {
    digitCount = 3;
    rewardRate = 650;
  } else if (bet.subtype === 'b4') {
    digitCount = 4;
    rewardRate = 5500;
  }

  // Lấy tất cả số trúng với số chữ số phù hợp
  const allWinningNumbers = getAllWinningNumbers(results, digitCount);

  for (const number of bet.numbers) {
    for (const [prize, numbers] of Object.entries(allWinningNumbers)) {
      if (numbers.includes(number)) {
        winningNumbers.push(`${number} (${prize})`);
        totalWinAmount += bet.amount * rewardRate;
        break; // Chỉ tính một lần cho mỗi số
      }
    }
  }

  return {
    isWin: winningNumbers.length > 0,
    winningNumbers,
    totalWinAmount,
  };
}

/**
 * Xác minh cược Bao 7 Lô (M1)
 */
function verifyBao7Lo(
  bet: {
    numbers: string[];
    digitCount: number;
    region: string;
    amount: number;
    province: string;
    drawDate: string;
  },
  results: SavedResult
): VerificationResult {
  if (bet.region !== 'M1') {
    return { isWin: false, winningNumbers: [], totalWinAmount: 0 };
  }

  const winningNumbers: string[] = [];
  let totalWinAmount = 0;

  // Xác định tỷ lệ thưởng dựa trên số chữ số
  let rewardRate = 75; // Mặc định cho 2 chữ số

  if (bet.digitCount === 3) {
    rewardRate = 650;
  } else if (bet.digitCount === 4) {
    rewardRate = 5500;
  }

  // Lọc chỉ lấy 7 lô cụ thể cho bao 7 lô M1
  const filteredPrizes: Record<string, string[]> = {};
  const winningData = results.winning_numbers;

  // 7 lô M1: Giải tám (1), Giải bảy (1), Giải sáu (3), Giải năm (1), Giải đặc biệt (1)
  filteredPrizes.giaiTam = winningData.giaiTam || [];
  filteredPrizes.giaiBay = winningData.giaiBay || [];
  filteredPrizes.giaiSau = winningData.giaiSau || [];
  filteredPrizes.giaiNam = winningData.giaiNam ? [winningData.giaiNam[0]] : [];
  filteredPrizes.giaiDacBiet = winningData.giaiDacBiet || [];

  for (const number of bet.numbers) {
    for (const [prize, numbers] of Object.entries(filteredPrizes)) {
      for (const prizeNumber of numbers) {
        const tail = prizeNumber.slice(-bet.digitCount);
        if (tail === number) {
          winningNumbers.push(`${number} (${prize})`);
          totalWinAmount += bet.amount * rewardRate;
          break; // Chỉ tính một lần cho mỗi số trong mỗi giải
        }
      }
    }
  }

  return {
    isWin: winningNumbers.length > 0,
    winningNumbers,
    totalWinAmount,
  };
}

/**
 * Xác minh cược Bao 8 Lô (M2)
 */
function verifyBao8Lo(
  bet: {
    numbers: string[];
    digitCount: number;
    region: string;
    amount: number;
    province: string;
    drawDate: string;
  },
  results: SavedResult
): VerificationResult {
  if (bet.region !== 'M2') {
    return { isWin: false, winningNumbers: [], totalWinAmount: 0 };
  }

  const winningNumbers: string[] = [];
  let totalWinAmount = 0;

  // Xác định tỷ lệ thưởng dựa trên số chữ số
  let rewardRate = 75; // Mặc định cho 2 chữ số

  if (bet.digitCount === 3) {
    rewardRate = 650;
  } else if (bet.digitCount === 4) {
    rewardRate = 5500;
  }

  // Lọc chỉ lấy 8 lô cụ thể cho bao 8 lô M2
  const filteredPrizes: Record<string, string[]> = {};
  const winningData = results.winning_numbers;

  // 8 lô M2: Giải đặc biệt (1), Giải bảy (1), Giải sáu (3), Giải năm (1), Giải tư (1), Giải ba (1)
  filteredPrizes.giaiDacBiet = winningData.giaiDacBiet || [];
  filteredPrizes.giaiBay = winningData.giaiBay ? [winningData.giaiBay[0]] : [];
  filteredPrizes.giaiSau = winningData.giaiSau || [];
  filteredPrizes.giaiNam = winningData.giaiNam ? [winningData.giaiNam[0]] : [];
  filteredPrizes.giaiTu = winningData.giaiTu ? [winningData.giaiTu[0]] : [];
  filteredPrizes.giaiBa = winningData.giaiBa ? [winningData.giaiBa[0]] : [];

  for (const number of bet.numbers) {
    for (const [prize, numbers] of Object.entries(filteredPrizes)) {
      for (const prizeNumber of numbers) {
        const tail = prizeNumber.slice(-bet.digitCount);
        if (tail === number) {
          winningNumbers.push(`${number} (${prize})`);
          totalWinAmount += bet.amount * rewardRate;
          break; // Chỉ tính một lần cho mỗi số trong mỗi giải
        }
      }
    }
  }

  return {
    isWin: winningNumbers.length > 0,
    winningNumbers,
    totalWinAmount,
  };
}

/**
 * Xác minh cược Nhất To (M2)
 */
function verifyNhatTo(
  bet: {
    numbers: string[];
    region: string;
    amount: number;
    province: string;
    drawDate: string;
  },
  results: SavedResult
): VerificationResult {
  if (bet.region !== 'M2') {
    return { isWin: false, winningNumbers: [], totalWinAmount: 0 };
  }

  const winningNumbers: string[] = [];
  let totalWinAmount = 0;
  const rewardRate = 75;

  const winningData = results.winning_numbers;
  const giaiNhat = winningData.giaiNhat[0];
  const nhatTail = giaiNhat.slice(-2); // 2 số cuối của giải Nhất

  for (const number of bet.numbers) {
    if (number === nhatTail) {
      winningNumbers.push(`${number} (Giải Nhất)`);
      totalWinAmount += bet.amount * rewardRate;
    }
  }

  return {
    isWin: winningNumbers.length > 0,
    winningNumbers,
    totalWinAmount,
  };
}

/**
 * Xác minh cược Xiên (M2)
 */
function verifyXien(
  bet: {
    numbers: string[];
    subtype: string; // x2, x3, x4
    region: string;
    amount: number;
    province: string;
    drawDate: string;
  },
  results: SavedResult
): VerificationResult {
  if (bet.region !== 'M2') {
    return { isWin: false, winningNumbers: [], totalWinAmount: 0 };
  }

  // Lấy tất cả số 2 chữ số từ kết quả
  const allTails = getAllWinningNumbers(results, 2);
  const allTailNumbers: string[] = [];

  // Gộp tất cả 2 số cuối từ các giải
  for (const tails of Object.values(allTails)) {
    allTailNumbers.push(...tails);
  }

  // Kiểm tra xem tất cả các số của người chơi có trong kết quả không
  const matchedNumbers = bet.numbers.filter((number) => allTailNumbers.includes(number));

  // Chỉ thắng khi tất cả các số đều trúng
  const isWin = matchedNumbers.length === bet.numbers.length;

  let rewardRate = 0;
  // Xác định tỷ lệ thưởng dựa trên subtype
  if (bet.subtype === 'x2' && isWin) {
    rewardRate = 75;
  } else if (bet.subtype === 'x3' && isWin) {
    rewardRate = 40;
  } else if (bet.subtype === 'x4' && isWin) {
    rewardRate = 250;
  }

  const totalWinAmount = isWin ? bet.amount * rewardRate : 0;

  return {
    isWin,
    winningNumbers: isWin ? matchedNumbers : [],
    totalWinAmount,
  };
}

/**
 * Xác minh cược Đá (M1) - phức tạp với nhiều kịch bản thắng
 */
function verifyDa(
  bet: {
    numbers: string[];
    subtype: string; // da2, da3, da4, da5
    region: string;
    amount: number;
    province: string;
    drawDate: string;
  },
  results: SavedResult
): VerificationResult {
  if (bet.region !== 'M1') {
    return { isWin: false, winningNumbers: [], totalWinAmount: 0 };
  }

  // Lấy tất cả số 2 chữ số từ kết quả
  const allTails = getAllWinningNumbers(results, 2);
  const allTailNumbers: string[] = [];

  // Gộp tất cả 2 số cuối từ các giải
  for (const tails of Object.values(allTails)) {
    allTailNumbers.push(...tails);
  }

  // Đếm số lần mỗi số xuất hiện
  const numberCounts: Record<string, number> = {};
  for (const number of bet.numbers) {
    numberCounts[number] = allTailNumbers.filter((tail) => tail === number).length;
  }

  // Đếm số lượng số khớp và số lần xuất hiện
  const matchCount = Object.values(numberCounts).filter((count) => count > 0).length;
  const multipleMatches = Object.values(numberCounts).filter((count) => count >= 2).length;

  let rewardRate = 0;
  let scenario = '';

  // Xác định kịch bản thắng và tỷ lệ thưởng
  if (bet.subtype === 'da2') {
    // Đá 2: Chỉ có 1 kịch bản - trúng cả 2 số
    if (matchCount === 2) {
      rewardRate = 12.5;
      scenario = 'Trúng 2 số';
    }
  } else if (bet.subtype === 'da3') {
    // Đá 3: Nhiều kịch bản
    if (matchCount === 3) {
      const threeTimesCount = Object.values(numberCounts).filter((count) => count >= 3).length;
      const twoTimesCount = Object.values(numberCounts).filter((count) => count === 2).length;

      if (threeTimesCount >= 1) {
        rewardRate = 112.5;
        scenario = 'Trúng 3 số + 1 số về 3 lần';
      } else if (twoTimesCount >= 1) {
        rewardRate = 75;
        scenario = 'Trúng 3 số + 1 số về 2 lần';
      } else {
        rewardRate = 37.5;
        scenario = 'Trúng đủ 3 số';
      }
    } else if (matchCount === 2 && multipleMatches >= 1) {
      rewardRate = 43.75;
      scenario = 'Trúng 2 số + 1 số về 2 lần';
    } else if (matchCount === 2) {
      rewardRate = 25;
      scenario = 'Trúng 2 số không kèm số nào về 2 lần';
    }
  } else if (bet.subtype === 'da4') {
    // Đá 4: Nhiều kịch bản phức tạp hơn
    if (matchCount === 4) {
      const threeTimesCount = Object.values(numberCounts).filter((count) => count >= 3).length;
      const twoTimesCount = Object.values(numberCounts).filter((count) => count === 2).length;

      if (threeTimesCount >= 1) {
        rewardRate = 750;
        scenario = 'Trúng 4 số + 1 số về 3 lần';
      } else if (twoTimesCount >= 1) {
        rewardRate = 500;
        scenario = 'Trúng 4 số + 1 số về 2 lần';
      } else {
        rewardRate = 250;
        scenario = 'Trúng đủ 4 số';
      }
    } else if (matchCount === 3 && multipleMatches >= 1) {
      rewardRate = 150;
      scenario = 'Trúng 3 số + 1 số về 2 lần';
    } else if (matchCount === 2 && multipleMatches >= 1) {
      rewardRate = 75;
      scenario = 'Trúng 2 số + 1 số về 2 lần';
    }
  } else if (bet.subtype === 'da5') {
    // Đá 5: Các kịch bản cho đá 5
    if (matchCount === 5) {
      const threeTimesCount = Object.values(numberCounts).filter((count) => count >= 3).length;
      const twoTimesCount = Object.values(numberCounts).filter((count) => count === 2).length;

      if (threeTimesCount >= 1) {
        rewardRate = 3750;
        scenario = 'Trúng 5 số + 1 số về 3 lần';
      } else if (twoTimesCount >= 1) {
        rewardRate = 2500;
        scenario = 'Trúng 5 số + 1 số về 2 lần';
      } else {
        rewardRate = 1250;
        scenario = 'Trúng đủ 5 số';
      }
    } else if (matchCount === 4 && multipleMatches >= 2) {
      rewardRate = 750;
      scenario = 'Trúng 4 số + 2 số về 2 lần';
    } else if (matchCount === 3 && multipleMatches >= 1) {
      rewardRate = 500;
      scenario = 'Trúng 3 số + 1 số về 2 lần';
    }
  }

  const totalWinAmount = rewardRate > 0 ? bet.amount * rewardRate : 0;
  const matchedNumbers = Object.entries(numberCounts)
    .filter(([_, count]) => count > 0)
    .map(([number, count]) => `${number} (${count} lần)`);

  return {
    isWin: rewardRate > 0,
    winningNumbers: matchedNumbers,
    totalWinAmount,
    winDetails: {
      scenario,
      matchCount,
      multipleMatches,
    },
  };
}
