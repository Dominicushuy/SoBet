// app/admin/page.tsx
'use client';

import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="container mx-auto">
        <h1 className="mb-6 text-3xl font-bold">Trang Quản Trị</h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Quản lý Người Dùng</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Quản lý tài khoản và phân quyền người dùng trên hệ thống</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kết Quả Xổ Số</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Cập nhật và quản lý kết quả xổ số các đài</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thống Kê Cược</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Xem thống kê tình hình đặt cược trên hệ thống</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
