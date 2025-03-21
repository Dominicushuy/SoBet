'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, type Resolver } from 'react-hook-form';

import { createNewBet } from '@/app/actions/bet-actions';
import BetForm from '@/app/bet/components/BetForm';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { betFormSchema } from '@/lib/validators/bet-form';
import { BetFormData } from '@/types/bet';

export default function BetPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formStatus, setFormStatus] = useState<{
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    message: string;
  }>({
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: '',
  });

  // Get any pre-selected options from URL params
  const preSelectedRegion = searchParams.get('region') || '';
  const preSelectedType = searchParams.get('type') || '';

  // Initialize form with react-hook-form and zod validation
  const form = useForm<BetFormData>({
    resolver: zodResolver(betFormSchema) as unknown as Resolver<BetFormData>,
    defaultValues: {
      region: preSelectedRegion as 'M1' | 'M2' | '',
      bet_type: preSelectedType,
      selection_method: 'direct',
      numbers: [],
      amount: 10000, // Default amount in VND
      draw_date: new Date().toISOString().split('T')[0], // Today's date
    },
  });

  const handleSubmit = async (data: BetFormData) => {
    try {
      setFormStatus({
        isLoading: true,
        isSuccess: false,
        isError: false,
        message: 'Đang xử lý đặt cược...',
      });

      // Call server action to create bet
      const result = await createNewBet(data);

      if (result.error) {
        setFormStatus({
          isLoading: false,
          isSuccess: false,
          isError: true,
          message: result.error,
        });
        return;
      }

      // Success
      setFormStatus({
        isLoading: false,
        isSuccess: true,
        isError: false,
        message: 'Đặt cược thành công!',
      });

      // Reset form or redirect
      setTimeout(() => {
        router.push('/account/bets');
      }, 2000);
    } catch (error) {
      console.error('Error placing bet:', error);
      setFormStatus({
        isLoading: false,
        isSuccess: false,
        isError: true,
        message: 'Đã xảy ra lỗi khi đặt cược. Vui lòng thử lại sau.',
      });
    }
  };

  return (
    <div className="container mx-auto max-w-4xl">
      <h1 className="mb-6 text-3xl font-bold">Đặt Cược Xổ Số</h1>

      {formStatus.isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{formStatus.message}</AlertDescription>
        </Alert>
      )}

      {formStatus.isSuccess && (
        <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
          <AlertDescription>{formStatus.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="bg-lottery-primary text-white">
          <CardTitle>Thông tin đặt cược</CardTitle>
          <CardDescription className="text-gray-100">
            Chọn khu vực, loại cược và số muốn đặt
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <BetForm form={form} onSubmit={handleSubmit} isSubmitting={formStatus.isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
