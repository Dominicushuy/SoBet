import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';

const inter = Inter({ subsets: ['latin', 'vietnamese'] });

export const metadata: Metadata = {
  title: 'Lottery Betting App',
  description: 'Ứng dụng quản lý cá cược xổ số',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <div className="min-h-screen bg-lottery-background">
          <Header />
          <div className="flex flex-1">
            <Sidebar className="hidden w-64 md:block" />
            <main className="flex-1 p-4 md:p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
