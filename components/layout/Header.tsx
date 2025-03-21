'use client';

import { useState } from 'react';

import { LogOut, Menu, User as UserIcon, UserCircle, Wallet, ChevronDown } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/providers/AuthProvider';

export default function Header() {
  const { user, isAuthenticated, isAdmin, balance, formattedBalance, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold text-lottery-primary">
            XỔ SỐ ONLINE
          </Link>
        </div>

        <nav className="hidden space-x-4 md:flex">
          <Link href="/" className="font-medium hover:text-lottery-primary">
            Trang Chủ
          </Link>
          <Link href="/bet" className="font-medium hover:text-lottery-primary">
            Đặt Cược
          </Link>
          <Link href="/verification" className="font-medium hover:text-lottery-primary">
            Kiểm Tra Vé
          </Link>
          {isAuthenticated && (
            <Link href="/account/bets" className="font-medium hover:text-lottery-primary">
              Lịch Sử Cược
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              className="font-medium text-lottery-primary hover:text-lottery-primary/80"
            >
              Quản Trị
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {/* Hiển thị số dư */}
              <div className="hidden items-center rounded-md border px-3 py-1 md:flex">
                <Wallet size={16} className="mr-2 text-lottery-primary" />
                <span className="font-medium">{formattedBalance}</span>
              </div>

              {/* User menu */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <UserCircle size={18} />
                  <span className="max-w-[100px] truncate">{user?.username || user?.email}</span>
                  <ChevronDown size={14} />
                </Button>

                {showUserMenu && (
                  <Card className="absolute right-0 top-full z-50 mt-1 w-56 shadow-md">
                    <CardContent className="p-0">
                      <div className="p-3 font-medium border-b">
                        <div className="text-sm text-gray-500">Đăng nhập với</div>
                        <div className="truncate">{user?.email}</div>
                        <div className="flex items-center mt-2 text-sm text-lottery-primary">
                          <Wallet size={14} className="mr-1" />
                          {formattedBalance}
                        </div>
                      </div>
                      <Link
                        href="/account"
                        className="flex w-full items-center px-4 py-2 text-left text-sm hover:bg-muted"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <UserIcon size={16} className="mr-2" />
                        Tài khoản
                      </Link>
                      <button
                        className="flex w-full items-center px-4 py-2 text-left text-sm hover:bg-muted"
                        onClick={() => {
                          setShowUserMenu(false);
                          signOut();
                        }}
                      >
                        <LogOut size={16} className="mr-2" />
                        Đăng xuất
                      </button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href="/login">Đăng Nhập</Link>
              </Button>
              <Button variant="default" size="sm" asChild>
                <Link href="/register">Đăng Ký</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
