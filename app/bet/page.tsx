'use client';

import { useState, useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';

import MultiBetForm from '@/app/bet/components/MultiBetForm';
import MultiSuccessDialog from '@/app/bet/components/MultiSuccessDialog';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { createMultiProvinceBet } from '@/lib/actions/multi-bets';
import { betFormSchema, MultiBetFormValues } from '@/lib/validators/bet-form';
import { useAuth } from '@/providers/AuthProvider';

export default function BetPage() {
  const router = useRouter();
  const { user, isAuthenticated, balance } = useAuth();
  const searchParams = useSearchParams();
  const [formStatus, setFormStatus] = useState<{
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    message: string;
    betCodes?: string[];
    insufficientFunds?: boolean;
    requiredAmount?: number;
    loginRequired?: boolean;
    provinceCount?: number;
    totalStake?: number;
  }>({
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: '',
  });

  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated && !formStatus.isLoading) {
      // Save current URL for redirect after login
      const currentUrl = window.location.pathname + window.location.search;
      router.push(`/login?redirectTo=${encodeURIComponent(currentUrl)}`);
    }
  }, [isAuthenticated, router, formStatus.isLoading]);

  // Get any pre-selected options from URL params
  const preSelectedRegion = searchParams.get('region') || '';
  const preSelectedType = searchParams.get('type') || '';

  // Initialize form with react-hook-form and zod validation
  const form = useForm<MultiBetFormValues>({
    resolver: zodResolver(betFormSchema),
    defaultValues: {
      regions:
        preSelectedRegion && (preSelectedRegion === 'M1' || preSelectedRegion === 'M2')
          ? [preSelectedRegion as 'M1' | 'M2']
          : [],
      provinces: [],
      bet_type: preSelectedType || '',
      selection_method: 'direct',
      numbers: [],
      amount: 10000, // Default amount in VND
      draw_date: new Date().toISOString().split('T')[0], // Today's date
      subtype: '',
    },
  });

  const handleSubmit = async (data: MultiBetFormValues) => {
    try {
      if (!isAuthenticated) {
        setFormStatus({
          isLoading: false,
          isSuccess: false,
          isError: true,
          message: 'Bạn cần đăng nhập để đặt cược',
          loginRequired: true,
        });
        return;
      }

      setFormStatus({
        isLoading: true,
        isSuccess: false,
        isError: false,
        message: 'Đang xử lý đặt cược...',
      });

      // Call server action to create bet
      const result = await createMultiProvinceBet(data);

      if (result.error) {
        setFormStatus({
          isLoading: false,
          isSuccess: false,
          isError: true,
          message: result.error,
          insufficientFunds: result.insufficientFunds,
          requiredAmount: result.requiredAmount,
          loginRequired: result.loginRequired,
        });
        return;
      }

      // Success
      setFormStatus({
        isLoading: false,
        isSuccess: true,
        isError: false,
        message: 'Đặt cược thành công!',
        betCodes: result.betCodes,
        provinceCount: result.provinceCount,
        totalStake: result.totalStake,
      });

      // Show success dialog
      setShowSuccessDialog(true);
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

  // Handle closing the success dialog
  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);

    // Reset the form
    form.reset({
      regions: [],
      provinces: [],
      bet_type: '',
      selection_method: 'direct',
      numbers: [],
      amount: 10000,
      draw_date: new Date().toISOString().split('T')[0],
      subtype: '',
    });
  };

  // Handle view bet details after success
  const handleViewBet = () => {
    setShowSuccessDialog(false);
    router.push('/account/bets');
  };

  // Handle adding money when insufficient funds
  const handleAddMoney = () => {
    router.push('/account/wallet');
  };

  // If not authenticated, show login message
  if (!isAuthenticated && !formStatus.isLoading) {
    return null; // Will redirect to login via useEffect
  }

  return (
    <div className="container mx-auto max-w-4xl">
      <h1 className="mb-6 text-3xl font-bold">Đặt Cược Xổ Số</h1>

      {formStatus.isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            {formStatus.message}
            {formStatus.insufficientFunds && (
              <div className="mt-2">
                <Button size="sm" variant="outline" onClick={handleAddMoney}>
                  Nạp tiền ngay
                </Button>
              </div>
            )}
            {formStatus.loginRequired && (
              <div className="mt-2">
                <Link href={`/login?redirectTo=${encodeURIComponent(window.location.pathname)}`}>
                  <Button size="sm" variant="outline">
                    Đăng nhập ngay
                  </Button>
                </Link>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {formStatus.isSuccess && !showSuccessDialog && (
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
          <MultiBetForm form={form} onSubmit={handleSubmit} isSubmitting={formStatus.isLoading} />
        </CardContent>
      </Card>

      {/* Success Dialog */}
      {showSuccessDialog && formStatus.betCodes && (
        <MultiSuccessDialog
          open={showSuccessDialog}
          onClose={handleSuccessDialogClose}
          onViewBet={handleViewBet}
          betCodes={formStatus.betCodes}
          provinceCount={formStatus.provinceCount || 0}
          totalStake={formStatus.totalStake || 0}
        />
      )}
    </div>
  );
}
