import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function Header() {
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
          <Link href="/account/bets" className="font-medium hover:text-lottery-primary">
            Lịch Sử Cược
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Đăng Nhập
          </Button>
          <Button variant="default" size="sm">
            Đăng Ký
          </Button>
        </div>
      </div>
    </header>
  );
}
