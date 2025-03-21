'use client';

import { useEffect } from 'react';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/providers/AuthProvider';

import LoginForm from './components/LoginForm';

export default function LoginPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';

  // Chuyển hướng người dùng đã xác thực
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  // Vẫn đang tải trạng thái xác thực
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg border p-8 shadow-md">
          <div className="flex justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-lottery-primary"></div>
          </div>
          <p className="mt-4 text-center text-gray-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4">
      <Card className="w-full">
        <CardHeader className="bg-lottery-primary text-white">
          <CardTitle className="text-center">Đăng Nhập</CardTitle>
          <CardDescription className="text-center text-gray-100">
            Đăng nhập để sử dụng dịch vụ xổ số
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <LoginForm redirectTo={redirectTo} />

          <div className="mt-4 text-center text-sm text-gray-500">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="text-lottery-primary hover:underline">
              Đăng ký ngay
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
