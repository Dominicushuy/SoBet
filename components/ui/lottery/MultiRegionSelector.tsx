// components/ui/lottery/MultiRegionSelector.tsx
import * as React from 'react';

import { cn } from '@/lib/utils';

interface MultiRegionSelectorProps {
  selectedRegions: string[];
  onRegionsChange: (regions: string[]) => void;
  disabled?: boolean;
}

const MultiRegionSelector: React.FC<MultiRegionSelectorProps> = ({
  selectedRegions,
  onRegionsChange,
  disabled = false,
}) => {
  const regions = [
    {
      id: 'M1',
      name: 'Miền Nam/Trung',
      description: 'Xổ số các tỉnh miền Nam và miền Trung',
      color: 'bg-lottery-m1',
      details: '6 chữ số cho giải Đặc Biệt, 8-9 giải thưởng',
    },
    {
      id: 'M2',
      name: 'Miền Bắc',
      description: 'Xổ số các tỉnh miền Bắc',
      color: 'bg-lottery-m2',
      details: '5 chữ số cho giải Đặc Biệt, 8 giải thưởng',
    },
  ];

  const toggleRegion = (regionId: string) => {
    if (selectedRegions.includes(regionId)) {
      onRegionsChange(selectedRegions.filter((r) => r !== regionId));
    } else {
      onRegionsChange([...selectedRegions, regionId]);
    }
  };

  const selectAllRegions = () => {
    onRegionsChange(regions.map((r) => r.id));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {regions.map((region) => (
          <div
            key={region.id}
            role="button"
            tabIndex={disabled ? -1 : 0}
            className={cn(
              'relative rounded-lg border-2 p-4 cursor-pointer transition-all',
              selectedRegions.includes(region.id)
                ? `border-lottery-${region.id.toLowerCase()} shadow-md`
                : 'border-transparent hover:border-gray-200',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            onClick={() => {
              if (!disabled) {
                toggleRegion(region.id);
              }
            }}
            onKeyDown={(e) => {
              if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                toggleRegion(region.id);
              }
            }}
          >
            <div className="flex items-center">
              <div className={cn('w-4 h-4 rounded-full mr-2', region.color)} />
              <h3 className="text-lg font-medium">{region.name}</h3>
            </div>
            <p className="mt-2 text-sm text-gray-500">{region.description}</p>
            <p className="mt-1 text-xs text-gray-400">{region.details}</p>

            {selectedRegions.includes(region.id) && (
              <div className="absolute top-2 right-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-primary"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedRegions.length < 2 && (
        <div className="flex justify-end">
          <button
            onClick={selectAllRegions}
            disabled={disabled || selectedRegions.length === 2}
            className={cn(
              'text-sm font-medium',
              selectedRegions.length === 2 ? 'text-gray-400' : 'text-primary'
            )}
          >
            Chọn cả hai miền
          </button>
        </div>
      )}

      <div className="text-sm text-gray-500 bg-blue-50 border border-blue-200 rounded-md p-3">
        <strong>Lưu ý:</strong> Các tỉnh xổ theo lịch cố định. Mỗi tỉnh chỉ xổ vào một ngày nhất
        định trong tuần. Vui lòng kiểm tra lịch xổ số khi chọn tỉnh.
      </div>
    </div>
  );
};

export default MultiRegionSelector;
