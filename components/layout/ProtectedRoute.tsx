'use client';

import { useEffect } from 'react';

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

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Chuyển hướng đến đăng nhập nếu chưa xác thực
      const currentPath = window.location.pathname;
      router.push(`/login?redirectTo=${encodeURIComponent(currentPath)}`);
      return;
    }

    // Kiểm tra vai trò bắt buộc
    if (!isLoading && requiredRole && user) {
      const hasRequiredRole = Array.isArray(requiredRole)
        ? requiredRole.includes(user.role)
        : user.role === requiredRole;

      if (!hasRequiredRole) {
        // Chuyển hướng về trang chủ nếu người dùng không có vai trò bắt buộc
        router.push('/');
      }
    }
  }, [user, isAuthenticated, isLoading, router, requiredRole]);

  // Hiển thị trạng thái tải
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-lottery-primary"></div>
      </div>
    );
  }

  // Chưa xác thực hoặc không có vai trò bắt buộc
  if (!isAuthenticated || (requiredRole && user && !checkRole(user.role, requiredRole))) {
    return null;
  }

  // Đã xác thực với vai trò bắt buộc, render children
  return <>{children}</>;
}

// Hàm helper để kiểm tra xem người dùng có vai trò bắt buộc không
function checkRole(userRole: string, requiredRole: UserRole | UserRole[]): boolean {
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole as UserRole);
  }

  return userRole === requiredRole;
}
