'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { UserRole } from '@/lib/utils/auth-utils';
import { useAuth } from '@/providers/AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Chỉ xử lý logic khi đã load xong thông tin authentication
    if (!isLoading) {
      // Nếu không đăng nhập, chuyển đến trang login
      if (!isAuthenticated) {
        const currentPath = window.location.pathname;
        console.log('Not authenticated, redirecting to login');
        router.push(`/login?redirectTo=${encodeURIComponent(currentPath)}`);
        return;
      }

      // Nếu đã đăng nhập nhưng không có quyền yêu cầu
      if (requiredRole && user) {
        const hasRequiredRole = Array.isArray(requiredRole)
          ? requiredRole.includes(user.role)
          : user.role === requiredRole;

        if (!hasRequiredRole) {
          console.log('Insufficient permissions, redirecting to home');
          router.push('/');
          return;
        }
      }

      // Đã kiểm tra xong authentication
      setAuthChecked(true);
    }
  }, [user, isAuthenticated, isLoading, router, requiredRole]);

  // Nếu đang loading, hiển thị spinner
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-lottery-primary"></div>
        <span className="ml-3 text-gray-500">Đang kiểm tra quyền truy cập...</span>
      </div>
    );
  }

  // Nếu chưa check xong authentication (có thể đang chuyển hướng), không hiển thị gì
  if (!authChecked) {
    return null;
  }

  // Nếu đã kiểm tra xong và có quyền truy cập, hiển thị nội dung
  return <>{children}</>;
}
