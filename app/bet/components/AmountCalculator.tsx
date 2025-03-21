import React from 'react';

import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { formatCurrency } from '@/lib/lottery/calculators';

interface AmountCalculatorProps {
  amount: number;
  onAmountChange: (amount: number) => void;
  calculationResult: any | null;
  selectedNumbers: string[];
  disabled?: boolean;
}

const PRESET_AMOUNTS = [5000, 10000, 20000, 50000, 100000];

const AmountCalculator: React.FC<AmountCalculatorProps> = ({
  amount,
  onAmountChange,
  calculationResult,
  selectedNumbers,
  disabled = false,
}) => {
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-numeric characters and parse to number
    const value = parseInt(e.target.value.replace(/\D/g, ''), 10);
    if (!isNaN(value)) {
      onAmountChange(value);
    } else {
      onAmountChange(0);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="bet-amount">Mệnh giá mỗi số (VNĐ)</Label>
        <div className="mt-1">
          <Input
            id="bet-amount"
            type="text"
            value={amount ? amount.toLocaleString('vi-VN') : ''}
            onChange={handleAmountChange}
            disabled={disabled}
            className="text-right"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESET_AMOUNTS.map((presetAmount) => (
          <Button
            key={presetAmount}
            type="button"
            variant={amount === presetAmount ? 'default' : 'outline'}
            onClick={() => onAmountChange(presetAmount)}
            disabled={disabled}
            className="text-sm"
          >
            {presetAmount.toLocaleString('vi-VN')}
          </Button>
        ))}
      </div>

      {calculationResult && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Số lượng số:</span>
                <span className="font-medium">{selectedNumbers.length}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Hệ số nhân:</span>
                <span className="font-medium">{calculationResult.multiplier}x</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Tỷ lệ thưởng:</span>
                <span className="font-medium">{calculationResult.rewardRate}x</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Tiền cược mỗi số:</span>
                <span className="font-medium">{formatCurrency(calculationResult.unitStake)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Tổng tiền cược:</span>
                <span className="font-semibold">
                  {formatCurrency(calculationResult.totalStake)}
                </span>
              </div>

              <div className="flex justify-between text-lottery-win">
                <span className="text-sm">Tiềm năng thắng tối đa:</span>
                <span className="font-bold">{formatCurrency(calculationResult.potentialWin)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AmountCalculator;
