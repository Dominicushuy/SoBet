// lib/lottery/number-generators.ts

export interface NumberSelectionMethod {
  id: string;
  code: string;
  name: string;
  description: string;
  applicableBetTypes: string[]; // Mã các loại cược có thể áp dụng phương pháp này
  configuration: SelectionConfig;
}

export interface SelectionConfig {
  type: 'DIRECT' | 'ZODIAC' | 'PERMUTATION' | 'RANGE' | 'PATTERN' | 'HI_LO' | 'ODD_EVEN';
  params?: ZodiacParams | HiLoParams | OddEvenParams | PermutationParams;
  generateFunction: string; // Tên hàm cần gọi
}

export interface ZodiacParams {
  animals: ZodiacAnimal[];
}

export interface ZodiacAnimal {
  code: string;
  name: string;
  value: number;
  numbers: string[];
}

export interface HiLoParams {
  hiRange: [number, number];
  loRange: [number, number];
}

export interface OddEvenParams {
  includeZero?: boolean;
}

export interface PermutationParams {
  maxDigits: number;
}

// Ví dụ phương pháp chọn số theo 12 con giáp
export const zodiacSelectionMethod: NumberSelectionMethod = {
  id: 'z1',
  code: 'zodiac',
  name: '12 Con Giáp',
  description: 'Chọn số theo 12 con giáp',
  applicableBetTypes: ['dd', 'b2', 'b3', 'b4', 'b7l', 'b8l', 'nt'],
  configuration: {
    type: 'ZODIAC',
    params: {
      animals: [
        {
          code: 'ti',
          name: 'Tý',
          value: 0,
          numbers: ['00', '12', '24', '36', '48', '60', '72', '84', '96'],
        },
        {
          code: 'suu',
          name: 'Sửu',
          value: 1,
          numbers: ['01', '13', '25', '37', '49', '61', '73', '85', '97'],
        },
        {
          code: 'dan',
          name: 'Dần',
          value: 2,
          numbers: ['02', '14', '26', '38', '50', '62', '74', '86', '98'],
        },
        {
          code: 'mao',
          name: 'Mão',
          value: 3,
          numbers: ['03', '15', '27', '39', '51', '63', '75', '87', '99'],
        },
        {
          code: 'thin',
          name: 'Thìn',
          value: 4,
          numbers: ['04', '16', '28', '40', '52', '64', '76', '88'],
        },
        {
          code: 'ty',
          name: 'Tỵ',
          value: 5,
          numbers: ['05', '17', '29', '41', '53', '65', '77', '89'],
        },
        {
          code: 'ngo',
          name: 'Ngọ',
          value: 6,
          numbers: ['06', '18', '30', '42', '54', '66', '78', '90'],
        },
        {
          code: 'mui',
          name: 'Mùi',
          value: 7,
          numbers: ['07', '19', '31', '43', '55', '67', '79', '91'],
        },
        {
          code: 'than',
          name: 'Thân',
          value: 8,
          numbers: ['08', '20', '32', '44', '56', '68', '80', '92'],
        },
        {
          code: 'dau',
          name: 'Dậu',
          value: 9,
          numbers: ['09', '21', '33', '45', '57', '69', '81', '93'],
        },
        {
          code: 'tuat',
          name: 'Tuất',
          value: 10,
          numbers: ['10', '22', '34', '46', '58', '70', '82', '94'],
        },
        {
          code: 'hoi',
          name: 'Hợi',
          value: 11,
          numbers: ['11', '23', '35', '47', '59', '71', '83', '95'],
        },
      ],
    },
    generateFunction: 'generateZodiacNumbers',
  },
};

// Định nghĩa lookup object để tối ưu hiệu suất
const zodiacNumbersMap: Record<string, string[]> = {
  ti: ['00', '12', '24', '36', '48', '60', '72', '84', '96'],
  suu: ['01', '13', '25', '37', '49', '61', '73', '85', '97'],
  dan: ['02', '14', '26', '38', '50', '62', '74', '86', '98'],
  mao: ['03', '15', '27', '39', '51', '63', '75', '87', '99'],
  thin: ['04', '16', '28', '40', '52', '64', '76', '88'],
  ty: ['05', '17', '29', '41', '53', '65', '77', '89'],
  ngo: ['06', '18', '30', '42', '54', '66', '78', '90'],
  mui: ['07', '19', '31', '43', '55', '67', '79', '91'],
  than: ['08', '20', '32', '44', '56', '68', '80', '92'],
  dau: ['09', '21', '33', '45', '57', '69', '81', '93'],
  tuat: ['10', '22', '34', '46', '58', '70', '82', '94'],
  hoi: ['11', '23', '35', '47', '59', '71', '83', '95'],
};

// Phương thức tạo số theo 12 con giáp
export function generateZodiacNumbers(animalCode: string): string[] {
  return zodiacNumbersMap[animalCode] || [];
}

// Set để lưu trữ các permutation đã sinh sẵn, giúp cải thiện hiệu suất
const permutationCache: Record<string, string[]> = {};

// Phương thức tạo hoán vị của số
export function generatePermutations(number: string): string[] {
  // Nếu đã có trong cache thì lấy từ cache
  if (permutationCache[number]) {
    return permutationCache[number];
  }

  const digits = number.split('');
  const results: string[] = [];

  function permute(arr: string[], m: string[] = []) {
    if (arr.length === 0) {
      results.push(m.join(''));
    } else {
      for (let i = 0; i < arr.length; i++) {
        const curr = arr.slice();
        const next = curr.splice(i, 1);
        permute(curr, m.concat(next));
      }
    }
  }

  permute(digits);

  // Loại bỏ trùng lặp và lưu vào cache
  const uniqueResults = Array.from(new Set(results));
  permutationCache[number] = uniqueResults;

  return uniqueResults;
}

// Phương thức tạo số cao/thấp (tài/xỉu)
export function generateHiLoNumbers(type: 'hi' | 'lo'): string[] {
  // Pre-generate arrays to improve performance
  const hiNumbers = Array.from({ length: 50 }, (_, i) => (i + 50).toString().padStart(2, '0'));
  const loNumbers = Array.from({ length: 50 }, (_, i) => i.toString().padStart(2, '0'));

  return type === 'hi' ? hiNumbers : loNumbers;
}

// Phương thức tạo số chẵn/lẻ
export function generateOddEvenNumbers(type: 'odd' | 'even'): string[] {
  // Pre-generate arrays to improve performance
  const evenNumbers = Array.from({ length: 50 }, (_, i) => (i * 2).toString().padStart(2, '0'));
  const oddNumbers = Array.from({ length: 50 }, (_, i) => (i * 2 + 1).toString().padStart(2, '0'));

  return type === 'even' ? evenNumbers : oddNumbers;
}

/**
 * Tạo số theo kéo chục
 * @param tensDigit Chữ số hàng chục (0-9)
 */
export function generateTensNumbers(tensDigit: number): string[] {
  const results: string[] = [];

  for (let i = 0; i <= 9; i++) {
    results.push(`${tensDigit}${i}`);
  }

  return results;
}

/**
 * Tạo số theo kéo đơn vị
 * @param unitsDigit Chữ số hàng đơn vị (0-9)
 */
export function generateUnitsNumbers(unitsDigit: number): string[] {
  const results: string[] = [];

  for (let i = 0; i <= 9; i++) {
    results.push(`${i}${unitsDigit}`);
  }

  return results;
}

/**
 * Tạo số đôi (số hai chữ số giống nhau)
 */
export function generateDoubleNumbers(): string[] {
  return Array.from({ length: 10 }, (_, i) => `${i}${i}`);
}

/**
 * Tạo số ba (số ba chữ số giống nhau)
 */
export function generateTripleNumbers(): string[] {
  return Array.from({ length: 10 }, (_, i) => `${i}${i}${i}`);
}

/**
 * Tạo số tiến (ba chữ số liên tiếp tăng dần)
 */
export function generateProgressiveNumbers(): string[] {
  const results: string[] = [];

  for (let i = 1; i <= 7; i++) {
    results.push(`${i}${i + 1}${i + 2}`);
  }

  return results;
}

// Lấy tất cả các phương pháp chọn số
export async function getNumberSelectionMethods(): Promise<NumberSelectionMethod[]> {
  // Trong thực tế, có thể gọi API hoặc lấy từ database
  return [
    zodiacSelectionMethod,
    // Thêm các phương pháp khác
  ];
}
