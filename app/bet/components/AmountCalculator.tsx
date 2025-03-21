import React, { useState, useEffect } from 'react';

import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { formatCurrency } from '@/lib/lottery/calculators';
import { validateBetAmount } from '@/lib/validators/bet-form';
import { useAuth } from '@/providers/AuthProvider';

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
  const { balance = 0 } = useAuth();
  const [validationError, setValidationError] = useState<string | null>(null);
  const [formattedAmount, setFormattedAmount] = useState<string>('');

  // Update formatted amount when amount changes
  useEffect(() => {
    setFormattedAmount(amount ? amount.toLocaleString('vi-VN') : '');
  }, [amount]);

  // Validate amount when calculation result changes
  useEffect(() => {
    if (calculationResult && calculationResult.totalStake) {
      const validation = validateBetAmount(amount, calculationResult.totalStake, balance);
      if (!validation.isValid) {
        setValidationError(validation.message || 'Số tiền cược không hợp lệ');
      } else {
        setValidationError(null);
      }
    }
  }, [calculationResult, amount, balance]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-numeric characters and parse to number
    const value = parseInt(e.target.value.replace(/\D/g, ''), 10);
    if (!isNaN(value)) {
      onAmountChange(value);
    } else {
      onAmountChange(0);
    }
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="bet-amount">Mệnh giá mỗi số (VNĐ)</Label>
        <div className="mt-1">
          <Input
            id="bet-amount"
            type="text"
            value={formattedAmount}
            onChange={handleAmountChange}
            onFocus={handleInputFocus}
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

      {validationError && (
        <Alert variant="destructive">
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      {calculationResult && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Số dư ví:</span>
                <span className="font-medium">{formatCurrency(balance)}</span>
              </div>

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

              {calculationResult.totalStake > 0 && (
                <div className="flex justify-between text-xs text-gray-500 border-t pt-2">
                  <span>Sau khi cược, số dư còn lại:</span>
                  <span className={balance < calculationResult.totalStake ? 'text-red-500' : ''}>
                    {formatCurrency(balance - calculationResult.totalStake)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AmountCalculator;
