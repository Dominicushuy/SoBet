import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { AuthProvider } from '@/providers/AuthProvider';
import QueryProvider from '@/providers/QueryProvider';

const inter = Inter({ subsets: ['latin', 'vietnamese'] });

export const metadata: Metadata = {
  title: 'Xổ Số Online - Ứng dụng Cá cược Xổ số',
  description: 'Hệ thống đặt cược và đối soát kết quả xổ số trực tuyến',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        {/* AuthProvider phải được đặt trước QueryProvider */}
        <AuthProvider>
          <QueryProvider>
            <div className="min-h-screen bg-lottery-background">
              <Header />
              <div className="flex flex-1">
                <Sidebar className="hidden w-64 md:block" />
                <main className="flex-1 p-4 md:p-6">{children}</main>
              </div>
            </div>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
