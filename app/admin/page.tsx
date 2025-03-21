'use client';

import Link from 'next/link';

import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/providers/AuthProvider';

export default function AdminPage() {
  const { user, isAdmin, isLoading } = useAuth();

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="container mx-auto">
        <h1 className="mb-6 text-3xl font-bold">Trang Quản Trị</h1>
        {/* Debug panel - chỉ hiển thị trong development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 border rounded-md bg-yellow-50">
            <h2 className="font-bold mb-2">Debug Info:</h2>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(
                {
                  user: {
                    id: user?.id,
                    email: user?.email,
                    role: user?.role,
                  },
                  isAdmin,
                  isLoading,
                },
                null,
                2
              )}
            </pre>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Quản lý Loại Cược</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Thêm, sửa, xóa và quản lý các loại cược và tỷ lệ thưởng</p>
              <Link
                href="/admin/bet-types"
                className="mt-4 block rounded-md bg-lottery-primary px-4 py-2 text-center text-white hover:bg-lottery-primary/90"
              >
                Quản lý Loại Cược
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kết Quả Xổ Số</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Cập nhật và quản lý kết quả xổ số các đài</p>
              <Link
                href="/verification"
                className="mt-4 block rounded-md bg-lottery-primary px-4 py-2 text-center text-white hover:bg-lottery-primary/90"
              >
                Quản lý Kết Quả
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thống Kê Cược</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Xem thống kê tình hình đặt cược trên hệ thống</p>
              <span className="mt-4 block rounded-md bg-gray-200 px-4 py-2 text-center text-gray-600 cursor-not-allowed">
                Đang phát triển
              </span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quản lý Đài</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Quản lý các đài xổ số và lịch xổ</p>
              <span className="mt-4 block rounded-md bg-gray-200 px-4 py-2 text-center text-gray-600 cursor-not-allowed">
                Đang phát triển
              </span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quản lý Người Dùng</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Xem và quản lý người dùng, phân quyền</p>
              <span className="mt-4 block rounded-md bg-gray-200 px-4 py-2 text-center text-gray-600 cursor-not-allowed">
                Đang phát triển
              </span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cài Đặt Hệ Thống</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Thiết lập và cấu hình hệ thống cá cược</p>
              <span className="mt-4 block rounded-md bg-gray-200 px-4 py-2 text-center text-gray-600 cursor-not-allowed">
                Đang phát triển
              </span>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
