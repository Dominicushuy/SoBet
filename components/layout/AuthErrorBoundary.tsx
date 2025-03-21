'use client';

import React, { ErrorInfo, ReactNode } from 'react';

import { Button } from '@/components/ui/Button';
import { useAuth } from '@/providers/AuthProvider';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class AuthErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Auth error caught by boundary:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return <AuthErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

function AuthErrorFallback({ error }: { error: Error | null }) {
  const { refreshUserData } = useAuth();

  const handleRetry = async () => {
    try {
      await refreshUserData();
      window.location.reload();
    } catch (e) {
      console.error('Error refreshing user data:', e);
    }
  };

  const handleSignOut = async () => {
    try {
      // Đăng xuất khỏi supabase
      const supabase = (window as any).supabase;
      if (supabase?.auth) {
        await supabase.auth.signOut();
      }

      // Xóa các cookie
      document.cookie.split(';').forEach(function (c) {
        document.cookie = c
          .replace(/^ +/, '')
          .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
      });

      // Chuyển hướng về trang đăng nhập
      window.location.href = '/login';
    } catch (e) {
      console.error('Error signing out:', e);
      // Nếu lỗi, vẫn cố gắng chuyển trang
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lỗi xác thực</h2>
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md text-sm overflow-auto max-h-32">
            {error ? error.message : 'Đã xảy ra lỗi với trạng thái xác thực của bạn.'}
          </div>
          <p className="text-gray-600 mb-6">
            Có vẻ như đã xảy ra lỗi với phiên đăng nhập của bạn. Vui lòng thử làm mới trạng thái
            đăng nhập hoặc đăng nhập lại.
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={handleRetry} variant="default">
              Làm mới trạng thái đăng nhập
            </Button>
            <Button onClick={handleSignOut} variant="outline">
              Đăng xuất và đăng nhập lại
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthErrorBoundary;
