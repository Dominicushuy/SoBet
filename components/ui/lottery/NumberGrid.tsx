// components/lottery/NumberGrid.tsx
import * as React from 'react';

import { isValidNumber } from '@/lib/lottery/calculators';
import { cn } from '@/lib/utils';

interface NumberGridProps {
  selectedNumbers: string[];
  betType: string;
  digitCount?: number;
  onSelectNumber: (number: string) => void;
  onUnselectNumber: (number: string) => void;
  maxSelectCount?: number;
  disabled?: boolean;
  winningNumbers?: string[];
}

const NumberGrid: React.FC<NumberGridProps> = ({
  selectedNumbers,
  betType,
  digitCount = 2,
  onSelectNumber,
  onUnselectNumber,
  maxSelectCount = 0,
  disabled = false,
  winningNumbers = [],
}) => {
  const [numbers, setNumbers] = React.useState<string[]>([]);

  React.useEffect(() => {
    // Tạo mảng số từ 00-99
    if (digitCount === 2) {
      const nums = Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, '0'));
      setNumbers(nums);
    } else if (digitCount === 3) {
      // Quá nhiều số cho digitCount = 3 nên chỉ hiển thị số đã chọn
      setNumbers([...selectedNumbers]);
    } else if (digitCount === 4) {
      // Quá nhiều số cho digitCount = 4 nên chỉ hiển thị số đã chọn
      setNumbers([...selectedNumbers]);
    }
  }, [digitCount, selectedNumbers]);

  const handleNumberClick = (num: string) => {
    if (disabled) return;

    const isSelected = selectedNumbers.includes(num);

    if (isSelected) {
      onUnselectNumber(num);
    } else {
      // Kiểm tra xem có vượt quá số lượng cho phép không
      if (maxSelectCount > 0 && selectedNumbers.length >= maxSelectCount) {
        return;
      }

      // Kiểm tra số có hợp lệ cho loại cược không
      if (isValidNumber(num, betType)) {
        onSelectNumber(num);
      }
    }
  };

  // Chỉ renderGrid cho digitCount = 2, còn lại render list
  if (digitCount === 2) {
    return (
      <div className="number-grid">
        {numbers.map((num) => {
          const isSelected = selectedNumbers.includes(num);
          const isWinning = winningNumbers.includes(num);

          return (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              disabled={
                disabled ||
                (maxSelectCount > 0 && selectedNumbers.length >= maxSelectCount && !isSelected)
              }
              className={cn(
                'lottery-number',
                isWinning && isSelected
                  ? 'lottery-number-win'
                  : isSelected
                    ? 'lottery-number-selected'
                    : 'lottery-number-default'
              )}
              aria-label={`Số ${num}`}
            >
              {num}
            </button>
          );
        })}
      </div>
    );
  } else {
    // Render danh sách số đã chọn cho digitCount > 2
    return (
      <div className="p-4 border rounded-md">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500">Số đã chọn:</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedNumbers.length > 0 ? (
            selectedNumbers.map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num)}
                className={cn(
                  'px-3 py-1 text-sm font-medium rounded-md cursor-pointer',
                  winningNumbers.includes(num)
                    ? 'bg-lottery-win text-white'
                    : 'bg-lottery-selected text-black'
                )}
                aria-label={`Selected number ${num}`}
              >
                {num}
              </button>
            ))
          ) : (
            <div className="text-sm text-gray-400">Chưa có số nào được chọn</div>
          )}
        </div>
      </div>
    );
  }
};

export default NumberGrid;
