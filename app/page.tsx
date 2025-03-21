import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function Home() {
  return (
    <div className="container mx-auto max-w-6xl">
      <section className="mb-12 text-center">
        <h1 className="mb-6 text-4xl font-bold">Hệ Thống Cá Cược Xổ Số</h1>
        <p className="text-lg text-muted-foreground">
          Đặt cược dễ dàng với đầy đủ các hình thức: Đầu Đuôi, Xỉu Chủ, Bao Lô và nhiều loại khác
        </p>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="bg-lottery-primary text-white">
            <CardTitle>Đặt Cược</CardTitle>
            <CardDescription className="text-gray-100">Chọn số và đặt cược dễ dàng</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-4">
              Đa dạng hình thức cá cược: Đầu Đuôi, Xỉu Chủ, Bao Lô, và nhiều hình thức khác.
            </p>
            <Button asChild className="w-full">
              <Link href="/bet">Đặt Cược Ngay</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-lottery-m1 text-white">
            <CardTitle>Miền Nam/Trung (M1)</CardTitle>
            <CardDescription className="text-gray-100">
              Cược cho các đài miền Nam và miền Trung
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-4">
              Xổ số các tỉnh miền Nam (TP.HCM, Đồng Nai...) và miền Trung (Đà Nẵng, Khánh Hòa...).
              Giải đặc biệt 6 chữ số.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/bet?region=M1">Cược M1</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-lottery-m2 text-white">
            <CardTitle>Miền Bắc (M2)</CardTitle>
            <CardDescription className="text-gray-100">Cược cho các đài miền Bắc</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-4">
              Xổ số miền Bắc (Hà Nội, Quảng Ninh, Hải Phòng...). Giải đặc biệt 5 chữ số. Cách tính
              cược khác với M1.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/bet?region=M2">Cược M2</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 rounded-lg bg-muted p-6">
        <h2 className="mb-4 text-2xl font-bold">Các Loại Cược Phổ Biến</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-md bg-white p-4 shadow">
            <h3 className="mb-2 font-bold">Đầu Đuôi (dd)</h3>
            <p className="text-sm">
              Cược số 2 chữ số, trúng khi khớp với đầu (giải 8/7) hoặc đuôi (giải đặc biệt).
            </p>
          </div>
          <div className="rounded-md bg-white p-4 shadow">
            <h3 className="mb-2 font-bold">Xỉu Chủ (xc)</h3>
            <p className="text-sm">
              Cược số 3 chữ số, trúng khi khớp với đầu (giải 7/6) hoặc đuôi (giải đặc biệt).
            </p>
          </div>
          <div className="rounded-md bg-white p-4 shadow">
            <h3 className="mb-2 font-bold">Bao Lô (b2, b3, b4)</h3>
            <p className="text-sm">
              Cược số 2, 3 hoặc 4 chữ số, trúng khi khớp với N số cuối của bất kỳ lô nào.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
