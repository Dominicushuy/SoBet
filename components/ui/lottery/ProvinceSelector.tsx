// components/lottery/ProvinceSelector.tsx
import * as React from 'react';

import { format, addDays } from 'date-fns';
import { vi } from 'date-fns/locale';

import { Label } from '@/components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';

interface Province {
  province_id: string;
  province_name: string;
  region: string;
  sub_region: string | null;
}

interface ProvinceSelectorProps {
  selectedRegion: string;
  selectedDate: Date;
  selectedProvince: string;
  onProvinceChange: (province: string) => void;
  disabled?: boolean;
}

const ProvinceSelector: React.FC<ProvinceSelectorProps> = ({
  selectedRegion,
  selectedDate,
  selectedProvince,
  onProvinceChange,
  disabled = false,
}) => {
  const [provinces, setProvinces] = React.useState<Province[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchProvinces = async () => {
      if (!selectedRegion || !selectedDate) return;

      setLoading(true);
      try {
        // Lấy ngày trong tuần (0: Chủ nhật, 1-6: Thứ 2 - Thứ 7)
        const dayOfWeek = selectedDate.getDay();

        // Gọi API để lấy danh sách tỉnh theo ngày và khu vực
        const response = await fetch(`/api/provinces?day=${dayOfWeek}&region=${selectedRegion}`);

        if (!response.ok) {
          throw new Error('Không thể lấy danh sách tỉnh');
        }

        const data = await response.json();
        setProvinces(data);

        // Tự động chọn tỉnh đầu tiên nếu chưa có tỉnh nào được chọn
        if (data.length > 0 && !selectedProvince) {
          onProvinceChange(data[0].province_name);
        }
      } catch (error) {
        console.error('Error fetching provinces:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProvinces();
  }, [selectedRegion, selectedDate, selectedProvince, onProvinceChange]);

  const formatDateLabel = (date: Date) => {
    return format(date, 'EEEE, dd/MM/yyyy', { locale: vi });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="province-selector">Chọn tỉnh/thành phố xổ số</Label>
        <div className="text-sm text-muted-foreground mb-2">{formatDateLabel(selectedDate)}</div>
        <Select
          value={selectedProvince}
          onValueChange={onProvinceChange}
          disabled={disabled || loading || provinces.length === 0}
        >
          <SelectTrigger id="province-selector" className="w-full">
            <SelectValue placeholder="Chọn tỉnh/thành phố" />
          </SelectTrigger>
          <SelectContent>
            {provinces.map((province) => (
              <SelectItem key={province.province_id} value={province.province_name}>
                {province.province_name}
                {province.sub_region ? ` (${province.sub_region})` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {provinces.length === 0 && !loading && (
          <div className="text-sm text-destructive mt-1">
            Không có tỉnh/thành phố nào xổ vào ngày này cho miền đã chọn
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {[-1, 0, 1, 2, 3, 4, 5, 6].map((offset) => {
          const date = addDays(new Date(), offset);
          const dateStr = format(date, 'dd/MM');
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
                onProvinceChange('');
                // Và trigger refetch provinces
                const event = new CustomEvent('dateChanged', { detail: { date } });
                window.dispatchEvent(event);
              }}
            >
              <div className="font-semibold">{dateStr}</div>
              <div>{dayName.charAt(0).toUpperCase() + dayName.slice(1, 3)}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProvinceSelector;
