'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { X, Plus, Trash } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';

import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { SubTypeFormValues } from '@/lib/validators/bet-type-form';

// Schema cho trường hợp đặc biệt (specialRates)
const specialRateSchema = z.object({
  key: z.string().min(1, 'Mã trường hợp không được để trống'),
  description: z.string().min(1, 'Mô tả không được để trống'),
  rate: z.number().min(0, 'Tỷ lệ không được âm'),
});

// Schema cho cả form
const payRateSchema = z.object({
  rate: z.number().nullable().optional(),
  specialRates: z.array(specialRateSchema).optional(),
});

type PayRateFormValues = z.infer<typeof payRateSchema>;
type SpecialRateFormValues = z.infer<typeof specialRateSchema>;

interface PayRateEditorProps {
  variant: SubTypeFormValues;
  onSave: (updatedVariant: SubTypeFormValues) => void;
  onCancel: () => void;
}

export default function PayRateEditor({ variant, onSave, onCancel }: PayRateEditorProps) {
  const [error, setError] = useState<string | null>(null);

  // Prepare form values
  const prepareInitialValues = (): PayRateFormValues => {
    const specialRates: SpecialRateFormValues[] = [];

    // Convert specialRates object to array for form
    if (variant.specialRates) {
      Object.entries(variant.specialRates).forEach(([key, rate]) => {
        specialRates.push({
          key,
          description: getSpecialRateDescription(key),
          rate,
        });
      });
    }

    return {
      rate: variant.rate || null,
      specialRates: specialRates.length > 0 ? specialRates : undefined,
    };
  };

  // Helper to generate description for special rate keys
  const getSpecialRateDescription = (key: string): string => {
    // Maps special rate keys to human-readable descriptions
    const descriptions: Record<string, string> = {
      '3_plus_3times': 'Trúng 3 số + 1 số về 3 lần',
      '3_plus_2times': 'Trúng 3 số + 1 số về 2 lần',
      '2_plus_2times': 'Trúng 2 số + 1 số về 2 lần',
      '2_only': 'Trúng 2 số không kèm số nào về 2 lần',
      '4_plus_3times': 'Trúng 4 số + 1 số về 3 lần',
      '4_plus_2times': 'Trúng 4 số + 1 số về 2 lần',
      '5_plus_3times': 'Trúng 5 số + 1 số về 3 lần',
      '5_plus_2times': 'Trúng 5 số + 1 số về 2 lần',
    };

    return descriptions[key] || key;
  };

  // Setup form
  const form = useForm<PayRateFormValues>({
    resolver: zodResolver(payRateSchema),
    defaultValues: prepareInitialValues(),
  });

  // Setup field array for special rates
  const {
    fields: specialRateFields,
    append: appendSpecialRate,
    remove: removeSpecialRate,
  } = useFieldArray({
    control: form.control,
    name: 'specialRates',
  });

  // Handle form submission
  const onSubmit = (data: PayRateFormValues) => {
    try {
      // Convert specialRates array back to object for storage
      const specialRatesObject: Record<string, number> = {};
      data.specialRates?.forEach((item) => {
        specialRatesObject[item.key] = item.rate;
      });

      // Update the variant with new rate information
      const updatedVariant: SubTypeFormValues = {
        ...variant,
        rate: data.rate ?? undefined,
        specialRates: Object.keys(specialRatesObject).length > 0 ? specialRatesObject : undefined,
      };

      onSave(updatedVariant);
    } catch (err) {
      setError('Đã xảy ra lỗi khi cập nhật tỷ lệ thưởng');
      console.error(err);
    }
  };

  // Add a new special rate
  const handleAddSpecialRate = () => {
    appendSpecialRate({
      key: '',
      description: '',
      rate: 0,
    });
  };

  return (
    <Dialog open={true} onOpenChange={(open: boolean) => !open && onCancel()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Tỷ lệ thưởng cho biến thể: {variant.name}</DialogTitle>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tỷ lệ thưởng cơ bản</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="75"
                        value={field.value === null ? '' : field.value}
                        onChange={(e) => {
                          const value = e.target.value === '' ? null : parseFloat(e.target.value);
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Tỷ lệ thưởng cơ bản cho trường hợp trúng thông thường (1:75, 1:650...)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Tỷ lệ thưởng đặc biệt</h3>
                  <Button type="button" onClick={handleAddSpecialRate} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" /> Thêm trường hợp
                  </Button>
                </div>

                {specialRateFields.length === 0 ? (
                  <div className="text-center p-4 bg-gray-50 rounded-md">
                    <p className="text-gray-500 text-sm">Chưa có tỷ lệ thưởng đặc biệt.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {specialRateFields.map((field, index) => (
                      <div key={field.id} className="border rounded-md p-3">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-sm font-medium">Trường hợp #{index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSpecialRate(index)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <FormField
                            control={form.control}
                            name={`specialRates.${index}.key`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Mã trường hợp</FormLabel>
                                <FormControl>
                                  <Input placeholder="3_plus_2times" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`specialRates.${index}.rate`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Tỷ lệ thưởng</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="75"
                                    value={field.value}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name={`specialRates.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Mô tả trường hợp</FormLabel>
                              <FormControl>
                                <Input placeholder="Trúng 3 số + 1 số về 2 lần" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Hủy
              </Button>
              <Button type="submit">Lưu thay đổi</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
