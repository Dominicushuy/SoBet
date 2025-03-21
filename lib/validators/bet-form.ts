import * as z from 'zod';

// Schema validation cho form đặt cược
export const betFormSchema = z.object({
  region: z.enum(['M1', 'M2'], {
    required_error: 'Vui lòng chọn khu vực',
  }),
  province: z.string().min(1, {
    message: 'Vui lòng chọn tỉnh/thành phố',
  }),
  bet_type: z.string().min(1, {
    message: 'Vui lòng chọn loại cược',
  }),
  subtype: z.string().optional(),
  selection_method: z.enum(['direct', 'zodiac', 'hiLo', 'oddEven', 'pattern']).default('direct'),
  numbers: z.array(z.string()).min(1, {
    message: 'Vui lòng chọn ít nhất 1 số',
  }),
  amount: z.number().min(1000, {
    message: 'Mệnh giá tối thiểu là 1.000 VNĐ',
  }),
  draw_date: z.string(),
});

// Type inferred từ schema
export type BetFormValues = z.infer<typeof betFormSchema>;

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

  return { isValid: true };
}
