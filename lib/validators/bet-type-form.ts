import * as z from 'zod';

// Schema for SubType
export const subtypeSchema = z.object({
  code: z.string().min(1, 'Mã biến thể không được để trống'),
  name: z.string().min(1, 'Tên biến thể không được để trống'),
  description: z.string().optional(),
  stakeMultiplier: z
    .object({
      M1: z.number().optional(),
      M2: z.number().optional(),
    })
    .optional(),
  rate: z.number().optional(),
  specialRates: z.record(z.string(), z.number()).optional(),
});

// Schema for WinLogic
export const winLogicSchema = z.object({
  type: z.enum(['SIMPLE', 'COMPLEX']),
  prizes: z.object({
    M1: z.array(z.string()).optional(),
    M2: z.array(z.string()).optional(),
  }),
  digitPosition: z.enum(['LAST', 'FIRST', 'ALL']),
  digitCount: z.number().optional(),
  matchType: z.enum(['ANY', 'ALL']).optional(),
  specialLogic: z.string().optional(),
});

// Main schema for Bet Type form
export const betTypeFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Tên loại cược không được để trống'),
  description: z.string().optional(),
  bet_type: z.string().min(1, 'Phân loại cược không được để trống'),
  rule_code: z
    .string()
    .min(1, 'Mã quy tắc không được để trống')
    .refine((val) => /^[a-z0-9_]+$/.test(val), {
      message: 'Mã quy tắc chỉ được chứa chữ cái thường, số và dấu gạch dưới',
    }),
  region: z.enum(['M1', 'M2', 'BOTH'], {
    required_error: 'Vui lòng chọn miền áp dụng',
  }),
  digits: z.number().nullable().optional(),
  rate: z.number().min(0, 'Tỷ lệ thưởng không được âm').nullable().optional(),
  stake_formula: z.string().optional(),
  variants: z.array(subtypeSchema).optional(),
  win_logic: winLogicSchema.optional(),
  active: z.boolean().default(true),
});

export type BetTypeFormValues = z.infer<typeof betTypeFormSchema>;
export type SubTypeFormValues = z.infer<typeof subtypeSchema>;
export type WinLogicFormValues = z.infer<typeof winLogicSchema>;
