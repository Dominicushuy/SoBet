'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { verifyBetByCode } from '@/app/actions/verification-actions';
import BetVerifier from '@/app/verification/components/BetVerifier';
import ResultsInput from '@/app/verification/components/ResultsInput';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

// Schema cho form kiểm tra vé
const betCodeSchema = z.object({
  betCode: z.string().min(1, 'Vui lòng nhập mã vé để kiểm tra'),
});

export default function VerificationPage() {
  const [activeTab, setActiveTab] = useState<string>('check');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<any>(null);

  // Form handling
  const form = useForm<z.infer<typeof betCodeSchema>>({
    resolver: zodResolver(betCodeSchema),
    defaultValues: {
      betCode: '',
    },
  });

  // Handle verification
  const handleCheckBet = async (values: z.infer<typeof betCodeSchema>) => {
    try {
      setIsLoading(true);
      setVerificationError('');
      setVerificationResult(null);

      // Call server action to verify bet
      const result = await verifyBetByCode(values.betCode);

      if (result.error) {
        setVerificationError(result.error);
        return;
      }

      // Set verification result
      setVerificationResult(result);
    } catch (error) {
      console.error('Error verifying bet:', error);
      setVerificationError('Đã xảy ra lỗi khi kiểm tra vé. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl">
      <h1 className="mb-6 text-3xl font-bold">Kiểm tra kết quả</h1>

      <Tabs defaultValue="check" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="check">Kiểm tra vé</TabsTrigger>
          <TabsTrigger value="input">Nhập kết quả xổ số</TabsTrigger>
        </TabsList>

        <TabsContent value="check" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Kiểm tra vé của bạn</CardTitle>
              <CardDescription>Nhập mã vé để kiểm tra kết quả xổ số</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCheckBet)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="betCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mã vé</FormLabel>
                        <div className="flex space-x-2">
                          <Input placeholder="Nhập mã vé (VD: ABCDE123)" {...field} />
                          <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Đang kiểm tra...' : 'Kiểm tra'}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>

              {verificationError && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{verificationError}</AlertDescription>
                </Alert>
              )}

              {verificationResult && <BetVerifier result={verificationResult} className="mt-4" />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="input" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Nhập kết quả xổ số</CardTitle>
              <CardDescription>Chỉ dành cho quản trị viên</CardDescription>
            </CardHeader>
            <CardContent>
              <ResultsInput />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
