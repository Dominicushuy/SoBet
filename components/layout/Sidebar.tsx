import Link from 'next/link';

import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  return (
    <aside className={cn('border-r bg-white p-4', className)}>
      <div className="space-y-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 font-semibold text-lottery-primary">Loại Cược</h2>
          <nav className="space-y-1">
            <Link
              href="/bet?type=dd"
              className="block rounded-md px-3 py-2 text-sm hover:bg-muted hover:text-lottery-primary"
            >
              Đầu Đuôi (dd)
            </Link>
            <Link
              href="/bet?type=xc"
              className="block rounded-md px-3 py-2 text-sm hover:bg-muted hover:text-lottery-primary"
            >
              Xỉu Chủ (xc)
            </Link>
            <Link
              href="/bet?type=b2"
              className="block rounded-md px-3 py-2 text-sm hover:bg-muted hover:text-lottery-primary"
            >
              Bao Lô 2 (b2)
            </Link>
            <Link
              href="/bet?type=b3"
              className="block rounded-md px-3 py-2 text-sm hover:bg-muted hover:text-lottery-primary"
            >
              Bao Lô 3 (b3)
            </Link>
            <Link
              href="/bet?type=b4"
              className="block rounded-md px-3 py-2 text-sm hover:bg-muted hover:text-lottery-primary"
            >
              Bao Lô 4 (b4)
            </Link>
          </nav>
        </div>

        <div className="px-3 py-2">
          <h2 className="mb-2 font-semibold text-lottery-primary">Khu Vực</h2>
          <nav className="space-y-1">
            <Link
              href="/bet?region=M1"
              className="flex items-center rounded-md px-3 py-2 text-sm hover:bg-muted hover:text-lottery-primary"
            >
              <span className="h-2 w-2 rounded-full bg-lottery-m1"></span>
              <span className="ml-2">Miền Nam/Trung (M1)</span>
            </Link>
            <Link
              href="/bet?region=M2"
              className="flex items-center rounded-md px-3 py-2 text-sm hover:bg-muted hover:text-lottery-primary"
            >
              <span className="h-2 w-2 rounded-full bg-lottery-m2"></span>
              <span className="ml-2">Miền Bắc (M2)</span>
            </Link>
          </nav>
        </div>

        <div className="px-3 py-2">
          <h2 className="mb-2 font-semibold text-lottery-primary">Tiện Ích</h2>
          <nav className="space-y-1">
            <Link
              href="/verification"
              className="block rounded-md px-3 py-2 text-sm hover:bg-muted hover:text-lottery-primary"
            >
              Kiểm Tra Vé
            </Link>
            <Link
              href="/results"
              className="block rounded-md px-3 py-2 text-sm hover:bg-muted hover:text-lottery-primary"
            >
              Kết Quả Xổ Số
            </Link>
          </nav>
        </div>

        {/* Admin Section (conditionally rendered) */}
        <div className="px-3 py-2">
          <h2 className="mb-2 font-semibold text-lottery-primary">Quản Trị</h2>
          <nav className="space-y-1">
            <Link
              href="/admin"
              className="block rounded-md px-3 py-2 text-sm hover:bg-muted hover:text-lottery-primary"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/bet-types"
              className="block rounded-md px-3 py-2 text-sm hover:bg-muted hover:text-lottery-primary"
            >
              Quản Lý Loại Cược
            </Link>
          </nav>
        </div>
      </div>
    </aside>
  );
}
