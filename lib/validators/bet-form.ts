// lib/validators/bet-form.ts
import * as z from 'zod';

// Schema validation cho form đặt cược
export const betFormSchema = z.object({
  regions: z.array(z.enum(['M1', 'M2'])).min(1, {
    message: 'Vui lòng chọn ít nhất một khu vực',
  }),
  provinces: z.array(z.string()).min(1, {
    message: 'Vui lòng chọn ít nhất một tỉnh/thành phố',
  }),
  bet_type: z.string().min(1, {
    message: 'Vui lòng chọn loại cược',
  }),
  subtype: z.string().optional(),
  selection_method: z
    .enum(['direct', 'zodiac', 'hiLo', 'oddEven', 'pattern', 'tens', 'special'])
    .default('direct'),
  numbers: z.array(z.string()).min(1, {
    message: 'Vui lòng chọn ít nhất 1 số',
  }),
  amount: z.number().min(1000, {
    message: 'Mệnh giá tối thiểu là 1.000 VNĐ',
  }),
  draw_date: z.string().min(1, {
    message: 'Vui lòng chọn ngày xổ',
  }),
});

// Type inferred từ schema
export type MultiBetFormValues = z.infer<typeof betFormSchema>;

// Giữ lại schema cũ cho tương thích ngược
export type BetFormValues = {
  region: 'M1' | 'M2' | '';
  province: string;
  bet_type: string;
  subtype?: string;
  selection_method: 'direct' | 'zodiac' | 'hiLo' | 'oddEven' | 'pattern';
  numbers: string[];
  amount: number;
  draw_date: string;
};

// Schema cho kết quả tính toán cược
export const betCalculationSchema = z.object({
  numbers: z.array(z.string()),
  unitStake: z.number(),
  unitCount: z.number(),
  multiplier: z.number(),
  totalStake: z.number(),
  potentialWin: z.number(),
  rewardRate: z.number(),
});

export type BetCalculationValues = z.infer<typeof betCalculationSchema>;

// Schema cho kết quả tính toán cược nhiều tỉnh
export const multiBetCalculationSchema = z.object({
  totalStake: z.number(),
  potentialWin: z.number(),
  breakdowns: z.array(
    z.object({
      province: z.string(),
      region: z.string(),
      stake: z.number(),
      potentialWin: z.number(),
    })
  ),
});

export type MultiBetCalculationValues = z.infer<typeof multiBetCalculationSchema>;

// Hàm helper kiểm tra validity của form
export function validateBetForm(data: any): { isValid: boolean; errors: Record<string, string> } {
  try {
    betFormSchema.parse(data);
    return { isValid: true, errors: {} };
  } catch (error) {
    const zodError = error as z.ZodError;
    const errors: Record<string, string> = {};

    zodError.errors.forEach((err) => {
      const field = err.path.join('.');
      errors[field] = err.message;
    });

    return { isValid: false, errors };
  }
}

// Kiểm tra xem số tiền cược có đáp ứng giới hạn không
export function validateBetAmount(
  amount: number,
  totalStake: number,
  walletBalance: number,
  minAmount = 1000,
  maxAmount = 50000000
): { isValid: boolean; message?: string } {
  if (amount < minAmount) {
    return {
      isValid: false,
      message: `Mệnh giá tối thiểu là ${minAmount.toLocaleString('vi-VN')} VNĐ`,
    };
  }

  if (totalStake > maxAmount) {
    return {
      isValid: false,
      message: `Tổng tiền cược tối đa là ${maxAmount.toLocaleString('vi-VN')} VNĐ`,
    };
  }

  if (totalStake > walletBalance) {
    return {
      isValid: false,
      message: `Số dư ví không đủ. Bạn cần nạp thêm ${(totalStake - walletBalance).toLocaleString('vi-VN')} VNĐ`,
    };
  }

  return { isValid: true };
}
