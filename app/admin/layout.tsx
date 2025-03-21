'use client';

import { useState } from 'react';

import {
  ChevronLeft,
  Menu,
  X,
  LayoutDashboard,
  Settings,
  Users,
  FileText,
  Database,
  BarChart,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: 'Loại Cược',
      href: '/admin/bet-types',
      icon: <Database className="h-5 w-5" />,
    },
    {
      name: 'Kết Quả Xổ Số',
      href: '/verification',
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: 'Thống Kê',
      href: '/admin/statistics',
      icon: <BarChart className="h-5 w-5" />,
    },
    {
      name: 'Người Dùng',
      href: '/admin/users',
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: 'Cài Đặt',
      href: '/admin/settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex min-h-screen">
        {/* Sidebar for larger screens */}
        <aside className="hidden w-64 bg-white border-r shadow-sm md:block">
          <div className="flex h-16 items-center justify-between border-b px-4 py-2">
            <Link href="/admin" className="flex items-center space-x-2">
              <div className="rounded-md bg-lottery-primary p-1.5">
                <LayoutDashboard className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-lottery-primary">Admin Portal</span>
            </Link>
          </div>
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-lottery-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </Link>
            ))}
          </nav>
          <div className="absolute bottom-4 w-64 px-4">
            <Link
              href="/"
              className="flex items-center rounded-md border px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Trở về trang chính
            </Link>
          </div>
        </aside>

        {/* Mobile sidebar */}
        <div
          className={cn(
            'fixed inset-0 z-40 flex md:hidden',
            sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className={cn(
              'fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity',
              sidebarOpen ? 'opacity-100' : 'opacity-0'
            )}
            onClick={() => setSidebarOpen(false)}
            onKeyDown={(e) => e.key === 'Enter' && setSidebarOpen(false)}
            role="button"
            tabIndex={0}
          />

          {/* Sidebar panel */}
          <div
            className={cn(
              'relative flex w-full max-w-xs flex-1 flex-col bg-white pt-5 pb-4 transition transform',
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            )}
          >
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <Button
                variant="ghost"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full text-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            <div className="flex flex-shrink-0 items-center px-4">
              <Link href="/admin" className="flex items-center space-x-2">
                <div className="rounded-md bg-lottery-primary p-1.5">
                  <LayoutDashboard className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-lottery-primary">Admin Portal</span>
              </Link>
            </div>

            <div className="mt-5 h-0 flex-1 overflow-y-auto px-2">
              <nav className="space-y-1 px-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      pathname === item.href
                        ? 'bg-lottery-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="px-4 mt-4">
              <Link
                href="/"
                className="flex items-center rounded-md border px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                onClick={() => setSidebarOpen(false)}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Trở về trang chính
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1">
          {/* Mobile header */}
          <div className="flex items-center justify-between border-b md:hidden h-16 px-4">
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-6 w-6" />
            </Button>
            <Link href="/admin" className="text-lg font-semibold text-lottery-primary">
              Admin Portal
            </Link>
            <div className="w-10"></div> {/* Empty div for flex layout balance */}
          </div>

          {/* Main content */}
          <main className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
