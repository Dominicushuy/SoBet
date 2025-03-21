// components/ui/lottery/MultiProvinceSelector.tsx
import * as React from 'react';

import { format, addDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { X } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Label } from '@/components/ui/Label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';

interface Province {
  province_id: string;
  province_name: string;
  region: string;
  sub_region: string | null;
}

interface MultiProvinceSelectorProps {
  selectedRegions: string[];
  selectedDate: Date;
  selectedProvinces: string[];
  onProvincesChange: (provinces: string[]) => void;
  disabled?: boolean;
}

const MultiProvinceSelector: React.FC<MultiProvinceSelectorProps> = ({
  selectedRegions,
  selectedDate,
  selectedProvinces,
  onProvincesChange,
  disabled = false,
}) => {
  const [provinces, setProvinces] = React.useState<Province[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const fetchProvinces = async () => {
      if (!selectedRegions || selectedRegions.length === 0 || !selectedDate) return;

      setLoading(true);
      try {
        // Lấy ngày trong tuần (0: Chủ nhật, 1-6: Thứ 2 - Thứ 7)
        const dayOfWeek = selectedDate.getDay();

        // Gọi API để lấy danh sách tỉnh theo ngày và khu vực
        const response = await fetch(
          `/api/provinces?day=${dayOfWeek}&region=${selectedRegions.join(',')}`
        );

        if (!response.ok) {
          throw new Error('Không thể lấy danh sách tỉnh');
        }

        const data = await response.json();
        setProvinces(data);
      } catch (error) {
        console.error('Error fetching provinces:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProvinces();
  }, [selectedRegions, selectedDate]);

  const formatDateLabel = (date: Date) => {
    return format(date, 'EEEE, dd/MM/yyyy', { locale: vi });
  };

  const toggleProvince = (provinceName: string) => {
    if (selectedProvinces.includes(provinceName)) {
      onProvincesChange(selectedProvinces.filter((p) => p !== provinceName));
    } else {
      onProvincesChange([...selectedProvinces, provinceName]);
    }
  };

  const handleSelectAll = () => {
    onProvincesChange(provinces.map((p) => p.province_name));
  };

  const handleClearAll = () => {
    onProvincesChange([]);
  };

  const getProvincesByRegion = (region: string) => {
    return provinces.filter((p) => p.region === region);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="province-selector">Chọn tỉnh/thành phố xổ số</Label>
        <div className="text-sm text-muted-foreground mb-2">{formatDateLabel(selectedDate)}</div>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
              disabled={
                disabled || loading || provinces.length === 0 || selectedRegions.length === 0
              }
            >
              <span className="truncate">
                {selectedProvinces.length > 0
                  ? `Đã chọn ${selectedProvinces.length} tỉnh/thành`
                  : 'Chọn tỉnh/thành phố'}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <div className="p-3 border-b flex justify-between items-center">
              <h4 className="font-medium text-sm">Tỉnh/thành phố xổ số</h4>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="h-8 text-xs"
                >
                  Chọn tất cả
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                  className="h-8 text-xs"
                >
                  Bỏ chọn
                </Button>
              </div>
            </div>
            <div className="max-h-[300px] overflow-auto p-4 space-y-4">
              {selectedRegions.includes('M1') && getProvincesByRegion('M1').length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-medium text-sm">Miền Nam/Trung (M1)</h5>
                  <div className="grid grid-cols-1 gap-2">
                    {getProvincesByRegion('M1').map((province) => (
                      <div key={province.province_id} className="flex items-center space-x-2">
                        <Checkbox
                          id={province.province_id}
                          checked={selectedProvinces.includes(province.province_name)}
                          onCheckedChange={() => toggleProvince(province.province_name)}
                        />
                        <Label htmlFor={province.province_id} className="text-sm cursor-pointer">
                          {province.province_name}
                          {province.sub_region ? ` (${province.sub_region})` : ''}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedRegions.includes('M2') && getProvincesByRegion('M2').length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-medium text-sm">Miền Bắc (M2)</h5>
                  <div className="grid grid-cols-1 gap-2">
                    {getProvincesByRegion('M2').map((province) => (
                      <div key={province.province_id} className="flex items-center space-x-2">
                        <Checkbox
                          id={province.province_id}
                          checked={selectedProvinces.includes(province.province_name)}
                          onCheckedChange={() => toggleProvince(province.province_name)}
                        />
                        <Label htmlFor={province.province_id} className="text-sm cursor-pointer">
                          {province.province_name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {provinces.length === 0 && !loading && (
                <div className="text-center py-4 text-gray-500">
                  Không có tỉnh/thành phố nào xổ vào ngày này cho miền đã chọn
                </div>
              )}

              {loading && (
                <div className="text-center py-4">
                  <div className="animate-spin h-5 w-5 border-2 border-primary rounded-full border-t-transparent mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Đang tải...</p>
                </div>
              )}
            </div>
            <div className="p-3 border-t">
              <Button className="w-full" onClick={() => setOpen(false)}>
                Xác nhận ({selectedProvinces.length})
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {selectedProvinces.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {selectedProvinces.map((province) => (
              <Badge key={province} variant="secondary" className="flex items-center gap-1">
                {province}
                <X className="h-3 w-3 cursor-pointer" onClick={() => toggleProvince(province)} />
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {[-1, 0, 1, 2, 3, 4, 5, 6].map((offset) => {
          const date = addDays(new Date(), offset);
          const dateStr = format(date, 'dd/MM');
          // Hiển thị đầy đủ tên ngày thay vì chỉ hiện "Thứ"
          const dayName = format(date, 'EEEE', { locale: vi });
          const isSelected =
            date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear();

          return (
            <button
              key={offset}
              className={`text-xs px-2 py-1 rounded-md ${
                isSelected ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
              onClick={() => {
                // Khi click vào ngày khác, cần reset tỉnh đã chọn
                onProvincesChange([]);
                // Và trigger refetch provinces
                const event = new CustomEvent('dateChanged', { detail: { date } });
                window.dispatchEvent(event);
              }}
            >
              <div className="font-semibold">{dateStr}</div>
              <div>{dayName}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MultiProvinceSelector;
