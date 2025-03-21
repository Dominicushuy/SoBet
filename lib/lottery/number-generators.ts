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
  params?: any; // Tham số bổ sung đặc thù cho phương pháp
  generateFunction: string; // Tên hàm cần gọi
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
          code: 'ty',
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

// Phương thức tạo số theo 12 con giáp
export function generateZodiacNumbers(animalCode: string): string[] {
  const zodiacMap: Record<string, string[]> = {
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

  return zodiacMap[animalCode] || [];
}

// Phương thức tạo hoán vị của số
export function generatePermutations(number: string): string[] {
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
  return Array.from(new Set(results)); // Loại bỏ trùng lặp
}

// Phương thức tạo số cao/thấp (tài/xỉu)
export function generateHiLoNumbers(type: 'hi' | 'lo'): string[] {
  const result: string[] = [];

  if (type === 'hi') {
    // Tài (cao)
    for (let i = 50; i <= 99; i++) {
      result.push(i.toString().padStart(2, '0'));
    }
  } else {
    // Xỉu (thấp)
    for (let i = 0; i <= 49; i++) {
      result.push(i.toString().padStart(2, '0'));
    }
  }

  return result;
}

// Phương thức tạo số chẵn/lẻ
export function generateOddEvenNumbers(type: 'odd' | 'even'): string[] {
  const result: string[] = [];

  for (let i = 0; i <= 99; i++) {
    const numStr = i.toString().padStart(2, '0');
    const isEven = i % 2 === 0;

    if ((type === 'even' && isEven) || (type === 'odd' && !isEven)) {
      result.push(numStr);
    }
  }

  return result;
}

// Lấy tất cả các phương pháp chọn số
export async function getNumberSelectionMethods(): Promise<NumberSelectionMethod[]> {
  // Trong thực tế, có thể gọi API hoặc lấy từ database
  return [
    zodiacSelectionMethod,
    // Thêm các phương pháp khác
  ];
}
