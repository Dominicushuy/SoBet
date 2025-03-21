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
  const [atMaxCapacity, setAtMaxCapacity] = React.useState(false);

  // Check if at max capacity
  React.useEffect(() => {
    if (maxSelectCount > 0) {
      setAtMaxCapacity(selectedNumbers.length >= maxSelectCount);
    } else {
      setAtMaxCapacity(false);
    }
  }, [selectedNumbers, maxSelectCount]);

  React.useEffect(() => {
    // Tạo mảng số từ 00-99
    if (digitCount === 2) {
      const nums = Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, '0'));
      setNumbers(nums);
    } else if (digitCount === 3) {
      // Chỉ hiển thị số đã chọn cho số 3 chữ số
      setNumbers([...selectedNumbers]);
    } else if (digitCount === 4) {
      // Chỉ hiển thị số đã chọn cho số 4 chữ số
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
      <div className="space-y-2">
        {maxSelectCount > 0 && (
          <div className="text-sm text-gray-500">
            {selectedNumbers.length} / {maxSelectCount} số đã chọn
          </div>
        )}

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
                      : 'lottery-number-default',
                  atMaxCapacity && !isSelected && 'opacity-50'
                )}
                aria-label={`Số ${num}`}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>
    );
  } else {
    // Render danh sách số đã chọn cho digitCount > 2
    return (
      <div className="p-4 border rounded-md">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500">Số đã chọn:</h3>
        </div>

        {selectedNumbers.length > 0 ? (
          <div className="max-h-60 overflow-auto">
            <div className="flex flex-wrap gap-2">
              {selectedNumbers.map((num) => (
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
              ))}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-400">Chưa có số nào được chọn</div>
        )}

        {/* Form to add numbers for digitCount > 2 */}
        <div className="mt-4 flex space-x-2">
          <input
            type="text"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            maxLength={digitCount}
            placeholder={`Nhập số ${digitCount} chữ số`}
            disabled={disabled || atMaxCapacity}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const input = e.currentTarget;
                const value = input.value;

                if (isValidNumber(value, betType) && !selectedNumbers.includes(value)) {
                  onSelectNumber(value);
                  input.value = '';
                }
              }
            }}
          />
          <button
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            disabled={disabled || atMaxCapacity}
            onClick={() => {
              const input = document.querySelector('input') as HTMLInputElement;
              const value = input.value;

              if (isValidNumber(value, betType) && !selectedNumbers.includes(value)) {
                onSelectNumber(value);
                input.value = '';
              }
            }}
          >
            Thêm
          </button>
        </div>
      </div>
    );
  }
};

export default NumberGrid;
