import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { submitLotteryResult, verifyBetsByDate } from '@/app/actions/verification-actions';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import ProvinceSelector from '@/components/ui/lottery/ProvinceSelector';
import RegionSelector from '@/components/ui/lottery/RegionSelector';

// Schema for results form
const resultsFormSchema = z.object({
  region: z.enum(['M1', 'M2']),
  province: z.string().min(1, 'Vui lòng chọn tỉnh/thành phố'),
  drawDate: z.string().min(1, 'Vui lòng chọn ngày xổ'),

  // Giải thưởng
  giaiDacBiet: z.string().min(1, 'Vui lòng nhập giải Đặc Biệt'),
  giaiNhat: z.string().min(1, 'Vui lòng nhập giải Nhất'),
  giaiNhi: z.array(z.string()).optional().default([]),
  giaiBa: z.array(z.string()).optional().default([]),
  giaiTu: z.array(z.string()).optional().default([]),
  giaiNam: z.array(z.string()).optional().default([]),
  giaiSau: z.array(z.string()).optional().default([]),
  giaiBay: z.array(z.string()).optional().default([]),
  giaiTam: z.array(z.string()).optional().default([]),
});

export default function ResultsInput() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const form = useForm<z.infer<typeof resultsFormSchema>>({
    resolver: zodResolver(resultsFormSchema),
    defaultValues: {
      region: 'M1',
      province: '',
      drawDate: new Date().toISOString().split('T')[0],
      giaiDacBiet: '',
      giaiNhat: '',
      giaiNhi: [],
      giaiBa: [],
      giaiTu: [],
      giaiNam: [],
      giaiSau: [],
      giaiBay: [],
      giaiTam: [],
    },
  });

  const selectedRegion = form.watch('region');

  // Handle date change
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    form.setValue('drawDate', date.toISOString().split('T')[0]);
  };

  // Handle province change
  const handleProvinceChange = (province: string) => {
    form.setValue('province', province);
  };

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof resultsFormSchema>) => {
    try {
      setIsSubmitting(true);
      setSubmitSuccess(false);
      setSubmitError('');
      setVerificationResult(null);

      // Format winning numbers based on region
      const winningNumbers = {
        giaiDacBiet: [data.giaiDacBiet],
        giaiNhat: [data.giaiNhat],
        giaiNhi:
          data.region === 'M1' ? [data.giaiNhi[0] || ''] : data.giaiNhi.filter(Boolean).slice(0, 2),
        giaiBa:
          data.region === 'M1'
            ? data.giaiBa.filter(Boolean).slice(0, 2)
            : data.giaiBa.filter(Boolean).slice(0, 6),
        giaiTu:
          data.region === 'M1'
            ? data.giaiTu.filter(Boolean).slice(0, 7)
            : data.giaiTu.filter(Boolean).slice(0, 4),
        giaiNam:
          data.region === 'M1' ? [data.giaiNam[0] || ''] : data.giaiNam.filter(Boolean).slice(0, 6),
        giaiSau:
          data.region === 'M1'
            ? data.giaiSau.filter(Boolean).slice(0, 3)
            : data.giaiSau.filter(Boolean).slice(0, 3),
        giaiBay:
          data.region === 'M1' ? [data.giaiBay[0] || ''] : data.giaiBay.filter(Boolean).slice(0, 4),
        giaiTam: data.region === 'M1' ? [data.giaiTam[0] || ''] : [],
      };

      // Submit lottery result
      const result = await submitLotteryResult({
        draw_date: data.drawDate,
        province: data.province,
        region: data.region,
        winning_numbers: winningNumbers,
      });

      if (result.error) {
        setSubmitError(result.error);
        return;
      }

      setSubmitSuccess(true);

      // Auto-verify bets for this draw
      const verificationResult = await verifyBetsByDate(data.drawDate, data.province);
      if (!verificationResult.error) {
        setVerificationResult(verificationResult);
      }
    } catch (error) {
      console.error('Error submitting results:', error);
      setSubmitError('Đã xảy ra lỗi khi cập nhật kết quả xổ số. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate fields for a specific prize
  const renderPrizeFields = (
    name: 'giaiNhi' | 'giaiBa' | 'giaiTu' | 'giaiNam' | 'giaiSau' | 'giaiBay' | 'giaiTam',
    label: string,
    count: number
  ) => {
    return (
      <div className="space-y-2">
        <FormLabel>{label}</FormLabel>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Array.from({ length: count }).map((_, index) => (
            <FormField
              key={`${name}.${index}`}
              control={form.control}
              name={`${name}.${index}`}
              render={({ field }) => (
                <FormItem>
                  <Input
                    placeholder={`Số ${index + 1}`}
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      const values = [...(form.getValues(name) || [])];
                      values[index] = value;
                      form.setValue(name, values as any);
                    }}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Region, Date, Province Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="region"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chọn khu vực</FormLabel>
                <RegionSelector
                  selectedRegion={field.value}
                  onRegionChange={(region) => {
                    form.setValue('region', region as 'M1' | 'M2');
                    form.setValue('province', '');
                  }}
                  disabled={isSubmitting}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="province"
            render={({ field }) => (
              <FormItem>
                <ProvinceSelector
                  selectedRegion={selectedRegion}
                  selectedDate={selectedDate}
                  selectedProvince={field.value}
                  onProvinceChange={handleProvinceChange}
                  disabled={isSubmitting}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Main prizes */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="giaiDacBiet"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giải Đặc Biệt</FormLabel>
                  <Input placeholder="Số giải Đặc Biệt" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="giaiNhat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giải Nhất</FormLabel>
                  <Input placeholder="Số giải Nhất" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Other prizes based on region */}
          {selectedRegion === 'M1' ? (
            <>
              {renderPrizeFields('giaiNhi', 'Giải Nhì', 1)}
              {renderPrizeFields('giaiBa', 'Giải Ba', 2)}
              {renderPrizeFields('giaiTu', 'Giải Tư', 7)}
              {renderPrizeFields('giaiNam', 'Giải Năm', 1)}
              {renderPrizeFields('giaiSau', 'Giải Sáu', 3)}
              {renderPrizeFields('giaiBay', 'Giải Bảy', 1)}
              {renderPrizeFields('giaiTam', 'Giải Tám', 1)}
            </>
          ) : (
            <>
              {renderPrizeFields('giaiNhi', 'Giải Nhì', 2)}
              {renderPrizeFields('giaiBa', 'Giải Ba', 6)}
              {renderPrizeFields('giaiTu', 'Giải Tư', 4)}
              {renderPrizeFields('giaiNam', 'Giải Năm', 6)}
              {renderPrizeFields('giaiSau', 'Giải Sáu', 3)}
              {renderPrizeFields('giaiBay', 'Giải Bảy', 4)}
            </>
          )}
        </div>

        {submitError && (
          <Alert variant="destructive">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        {submitSuccess && (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <AlertDescription>Cập nhật kết quả xổ số thành công!</AlertDescription>
          </Alert>
        )}

        {verificationResult && (
          <Alert className="bg-blue-50 text-blue-800 border-blue-200">
            <AlertDescription>
              Đã xác minh {verificationResult.verifiedCount} phiếu cược. Có{' '}
              {verificationResult.results?.filter((r: any) => r.isWin).length || 0} phiếu trúng
              thưởng.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang xử lý...' : 'Cập nhật kết quả xổ số'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
