'use client';

import { useEffect, useState } from 'react';

import { PlusCircle } from 'lucide-react';

import BetTypeEditor from '@/app/admin/bet-types/components/BetTypeEditor';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { getBetTypes, toggleBetTypeActive, deleteBetType } from '@/lib/actions/bet-types';
import { BetTypeFormValues } from '@/lib/validators/bet-type-form';

export default function BetTypesPage() {
  const [betTypes, setBetTypes] = useState<any[]>([]);
  const [selectedBetType, setSelectedBetType] = useState<BetTypeFormValues | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load bet types on mount
  useEffect(() => {
    loadBetTypes();
  }, []);

  const loadBetTypes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getBetTypes();
      if (result.error) {
        setError(result.error);
      } else {
        setBetTypes(result.data || []);
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNew = () => {
    setSelectedBetType(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (betType: any) => {
    // Parse JSON fields if they are strings
    const preparedBetType = {
      ...betType,
      variants:
        typeof betType.variants === 'string' ? JSON.parse(betType.variants) : betType.variants,
      win_logic:
        typeof betType.win_logic === 'string' ? JSON.parse(betType.win_logic) : betType.win_logic,
    };

    setSelectedBetType(preparedBetType);
    setIsEditorOpen(true);
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    const result = await toggleBetTypeActive(id, !currentActive);
    if (result.error) {
      setError(result.error);
    } else {
      // Update local state
      setBetTypes(betTypes.map((bt) => (bt.id === id ? { ...bt, active: !currentActive } : bt)));
      setSuccess(`Đã ${!currentActive ? 'kích hoạt' : 'vô hiệu hóa'} loại cược thành công`);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa loại cược này?')) {
      const result = await deleteBetType(id);
      if (result.error) {
        setError(result.error);
      } else {
        // Update local state
        setBetTypes(betTypes.filter((bt) => bt.id !== id));
        setSuccess('Đã xóa loại cược thành công');

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      }
    }
  };

  const handleEditorClose = (refresh: boolean = false) => {
    setIsEditorOpen(false);
    setSelectedBetType(null);
    if (refresh) {
      loadBetTypes();
    }
  };

  // Table columns
  const columns = [
    {
      accessorKey: 'name',
      header: 'Tên loại cược',
    },
    {
      accessorKey: 'rule_code',
      header: 'Mã',
    },
    {
      accessorKey: 'bet_type',
      header: 'Phân loại',
    },
    {
      accessorKey: 'region',
      header: 'Miền áp dụng',
      cell: ({ row }: any) => {
        const region = row.getValue('region');
        return (
          <span>
            {region === 'M1' ? 'Miền Nam/Trung' : region === 'M2' ? 'Miền Bắc' : 'Cả hai miền'}
          </span>
        );
      },
    },
    {
      accessorKey: 'rate',
      header: 'Tỷ lệ thưởng',
      cell: ({ row }: any) => {
        const rate = row.getValue('rate');
        return rate ? `${rate}x` : '-';
      },
    },
    {
      accessorKey: 'active',
      header: 'Trạng thái',
      cell: ({ row }: any) => {
        const isActive = row.getValue('active');
        return (
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${
              isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {isActive ? 'Hoạt động' : 'Vô hiệu'}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }: any) => {
        const betType = row.original;
        return (
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={() => handleEdit(betType)}>
              Sửa
            </Button>
            <Button
              size="sm"
              variant={betType.active ? 'secondary' : 'default'}
              onClick={() => handleToggleActive(betType.id, betType.active)}
            >
              {betType.active ? 'Vô hiệu' : 'Kích hoạt'}
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleDelete(betType.id)}>
              Xóa
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Quản lý Loại Cược</h1>
          <Button onClick={handleAddNew} className="flex items-center">
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm Loại Cược Mới
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Danh sách Loại Cược</CardTitle>
            <CardDescription>Quản lý các loại cược và tỷ lệ thưởng trong hệ thống</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-lottery-primary"></div>
              </div>
            ) : (
              <DataTable columns={columns} data={betTypes} pagination={true} />
            )}
          </CardContent>
        </Card>

        {isEditorOpen && <BetTypeEditor betType={selectedBetType} onClose={handleEditorClose} />}
      </div>
    </ProtectedRoute>
  );
}
