import { useState, useEffect } from 'react';

import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import NumberGrid from '@/components/ui/lottery/NumberGrid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { isValidNumber } from '@/lib/lottery/calculators';
import {
  generateZodiacNumbers,
  generateHiLoNumbers,
  generateOddEvenNumbers,
  generatePermutations,
} from '@/lib/lottery/number-generators';

interface NumbersInputProps {
  selectedNumbers: string[];
  onNumbersChange: (numbers: string[]) => void;
  betType: string;
  subtype?: string;
  rule?: any;
  disabled?: boolean;
}

const NumbersInput: React.FC<NumbersInputProps> = ({
  selectedNumbers,
  onNumbersChange,
  betType,
  subtype,
  rule,
  disabled = false,
}) => {
  const [inputMethod, setInputMethod] = useState<
    'direct' | 'zodiac' | 'hiLo' | 'oddEven' | 'pattern'
  >('direct');
  const [inputValue, setInputValue] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [digitCount, setDigitCount] = useState<number>(2);

  // Set digit count based on bet type
  useEffect(() => {
    if (!betType) return;

    if (
      betType === 'dd' ||
      betType === 'nt' ||
      betType === 'b2' ||
      betType === 'x' ||
      betType === 'da'
    ) {
      setDigitCount(2);
    } else if (betType === 'xc' || betType === 'b3') {
      setDigitCount(3);
    } else if (betType === 'b4') {
      setDigitCount(4);
    } else if (betType === 'b7l' || betType === 'b8l') {
      // Based on variant, could be 2, 3, or 4
      if (subtype?.includes('2')) setDigitCount(2);
      else if (subtype?.includes('3')) setDigitCount(3);
      else if (subtype?.includes('4')) setDigitCount(4);
      else setDigitCount(2); // Default to 2
    }
  }, [betType, subtype]);

  const handleAddNumber = () => {
    if (!inputValue.trim()) {
      setErrorMessage('Vui lòng nhập số');
      return;
    }

    // Validate number format
    if (!isValidNumber(inputValue, betType)) {
      setErrorMessage(`Số không hợp lệ cho loại cược ${betType}. Cần ${digitCount} chữ số.`);
      return;
    }

    // Check if number already exists
    if (selectedNumbers.includes(inputValue)) {
      setErrorMessage('Số này đã được chọn');
      return;
    }

    // Add to selected numbers
    onNumbersChange([...selectedNumbers, inputValue]);
    setInputValue('');
    setErrorMessage('');
  };

  const handleRemoveNumber = (number: string) => {
    onNumbersChange(selectedNumbers.filter((n) => n !== number));
  };

  const handleSelectNumberFromGrid = (number: string) => {
    if (selectedNumbers.includes(number)) {
      handleRemoveNumber(number);
    } else {
      onNumbersChange([...selectedNumbers, number]);
    }
  };

  const handleClearAll = () => {
    onNumbersChange([]);
  };

  const handleGenerateZodiacNumbers = (zodiacCode: string) => {
    const newNumbers = generateZodiacNumbers(zodiacCode);

    // Filter out numbers that don't match the digit count
    const filteredNumbers = newNumbers.filter((num) => num.length === digitCount);

    // Add to existing numbers without duplicates
    const combinedNumbers = [...new Set([...selectedNumbers, ...filteredNumbers])];
    onNumbersChange(combinedNumbers);
  };

  const handleGenerateHiLoNumbers = (type: 'hi' | 'lo') => {
    const newNumbers = generateHiLoNumbers(type);

    // Filter out numbers that don't match the digit count
    const filteredNumbers = newNumbers.filter((num) => num.length === digitCount);

    // Add to existing numbers without duplicates
    const combinedNumbers = [...new Set([...selectedNumbers, ...filteredNumbers])];
    onNumbersChange(combinedNumbers);
  };

  const handleGenerateOddEvenNumbers = (type: 'odd' | 'even') => {
    const newNumbers = generateOddEvenNumbers(type);

    // Filter out numbers that don't match the digit count
    const filteredNumbers = newNumbers.filter((num) => num.length === digitCount);

    // Add to existing numbers without duplicates
    const combinedNumbers = [...new Set([...selectedNumbers, ...filteredNumbers])];
    onNumbersChange(combinedNumbers);
  };

  const handleGeneratePermutations = () => {
    if (!inputValue.trim()) {
      setErrorMessage('Vui lòng nhập số gốc');
      return;
    }

    // Generate permutations
    const permutations = generatePermutations(inputValue);

    // Filter out numbers that don't match the digit count
    const filteredPermutations = permutations.filter((num) => num.length === digitCount);

    // Add to existing numbers without duplicates
    const combinedNumbers = [...new Set([...selectedNumbers, ...filteredPermutations])];
    onNumbersChange(combinedNumbers);
    setInputValue('');
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="direct" onValueChange={(value) => setInputMethod(value as any)}>
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="direct">Nhập trực tiếp</TabsTrigger>
          <TabsTrigger value="zodiac">12 Con Giáp</TabsTrigger>
          <TabsTrigger value="hiLo">Tài/Xỉu</TabsTrigger>
          <TabsTrigger value="oddEven">Chẵn/Lẻ</TabsTrigger>
          <TabsTrigger value="pattern">Đảo số</TabsTrigger>
        </TabsList>

        {/* Direct input */}
        <TabsContent value="direct" className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Label htmlFor="number-input">Nhập số {digitCount} chữ số</Label>
              <Input
                id="number-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Nhập số ${digitCount} chữ số`}
                maxLength={digitCount}
                disabled={disabled}
              />
            </div>
            <div className="flex items-end">
              <Button type="button" onClick={handleAddNumber} disabled={disabled}>
                Thêm
              </Button>
            </div>
          </div>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <NumberGrid
            selectedNumbers={selectedNumbers}
            betType={betType}
            digitCount={digitCount}
            onSelectNumber={handleSelectNumberFromGrid}
            onUnselectNumber={handleRemoveNumber}
            disabled={disabled}
          />
        </TabsContent>

        {/* Zodiac selection */}
        <TabsContent value="zodiac" className="space-y-4">
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            <Button
              onClick={() => handleGenerateZodiacNumbers('ti')}
              variant="outline"
              disabled={disabled}
            >
              Tý (Chuột)
            </Button>
            <Button
              onClick={() => handleGenerateZodiacNumbers('suu')}
              variant="outline"
              disabled={disabled}
            >
              Sửu (Trâu)
            </Button>
            <Button
              onClick={() => handleGenerateZodiacNumbers('dan')}
              variant="outline"
              disabled={disabled}
            >
              Dần (Hổ)
            </Button>
            <Button
              onClick={() => handleGenerateZodiacNumbers('mao')}
              variant="outline"
              disabled={disabled}
            >
              Mão (Mèo)
            </Button>
            <Button
              onClick={() => handleGenerateZodiacNumbers('thin')}
              variant="outline"
              disabled={disabled}
            >
              Thìn (Rồng)
            </Button>
            <Button
              onClick={() => handleGenerateZodiacNumbers('ty')}
              variant="outline"
              disabled={disabled}
            >
              Tỵ (Rắn)
            </Button>
            <Button
              onClick={() => handleGenerateZodiacNumbers('ngo')}
              variant="outline"
              disabled={disabled}
            >
              Ngọ (Ngựa)
            </Button>
            <Button
              onClick={() => handleGenerateZodiacNumbers('mui')}
              variant="outline"
              disabled={disabled}
            >
              Mùi (Dê)
            </Button>
            <Button
              onClick={() => handleGenerateZodiacNumbers('than')}
              variant="outline"
              disabled={disabled}
            >
              Thân (Khỉ)
            </Button>
            <Button
              onClick={() => handleGenerateZodiacNumbers('dau')}
              variant="outline"
              disabled={disabled}
            >
              Dậu (Gà)
            </Button>
            <Button
              onClick={() => handleGenerateZodiacNumbers('tuat')}
              variant="outline"
              disabled={disabled}
            >
              Tuất (Chó)
            </Button>
            <Button
              onClick={() => handleGenerateZodiacNumbers('hoi')}
              variant="outline"
              disabled={disabled}
            >
              Hợi (Lợn)
            </Button>
          </div>

          <div className="border rounded-md p-4">
            <h3 className="text-sm font-medium mb-2">
              Số đã chọn theo con giáp: {selectedNumbers.length}
            </h3>
            <div className="flex flex-wrap gap-1">
              {selectedNumbers.map((number) => (
                <Button
                  key={number}
                  variant="secondary"
                  size="sm"
                  onClick={() => handleRemoveNumber(number)}
                  disabled={disabled}
                >
                  {number} <span className="ml-1 text-xs">×</span>
                </Button>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Hi/Lo (Tài/Xỉu) selection */}
        <TabsContent value="hiLo" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => handleGenerateHiLoNumbers('hi')}
              className="h-20 text-lg font-bold bg-lottery-m1 hover:bg-lottery-m1/90"
              disabled={disabled}
            >
              Tài (50-99)
            </Button>
            <Button
              onClick={() => handleGenerateHiLoNumbers('lo')}
              className="h-20 text-lg font-bold bg-lottery-m2 hover:bg-lottery-m2/90"
              disabled={disabled}
            >
              Xỉu (00-49)
            </Button>
          </div>

          <div className="border rounded-md p-4">
            <h3 className="text-sm font-medium mb-2">Đã chọn: {selectedNumbers.length} số</h3>
            <div className="text-sm text-gray-500">Sử dụng Tài/Xỉu sẽ chọn 50 số cùng một lúc.</div>
          </div>
        </TabsContent>

        {/* Odd/Even (Chẵn/Lẻ) selection */}
        <TabsContent value="oddEven" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => handleGenerateOddEvenNumbers('even')}
              className="h-20 text-lg font-bold bg-lottery-primary hover:bg-lottery-primary/90"
              disabled={disabled}
            >
              Chẵn (00, 02, 04...)
            </Button>
            <Button
              onClick={() => handleGenerateOddEvenNumbers('odd')}
              className="h-20 text-lg font-bold bg-lottery-secondary hover:bg-lottery-secondary/90"
              disabled={disabled}
            >
              Lẻ (01, 03, 05...)
            </Button>
          </div>

          <div className="border rounded-md p-4">
            <h3 className="text-sm font-medium mb-2">Đã chọn: {selectedNumbers.length} số</h3>
            <div className="text-sm text-gray-500">Sử dụng Chẵn/Lẻ sẽ chọn 50 số cùng một lúc.</div>
          </div>
        </TabsContent>

        {/* Pattern (Đảo số) */}
        <TabsContent value="pattern" className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Label htmlFor="pattern-input">Nhập số gốc cần đảo</Label>
              <Input
                id="pattern-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Nhập số ${digitCount} chữ số cần đảo`}
                maxLength={digitCount}
                disabled={disabled}
              />
            </div>
            <div className="flex items-end">
              <Button type="button" onClick={handleGeneratePermutations} disabled={disabled}>
                Tạo đảo
              </Button>
            </div>
          </div>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="border rounded-md p-4">
            <h3 className="text-sm font-medium mb-2">
              Số đã chọn qua phương pháp đảo: {selectedNumbers.length}
            </h3>
            <div className="flex flex-wrap gap-1">
              {selectedNumbers.map((number) => (
                <Button
                  key={number}
                  variant="secondary"
                  size="sm"
                  onClick={() => handleRemoveNumber(number)}
                  disabled={disabled}
                >
                  {number} <span className="ml-1 text-xs">×</span>
                </Button>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {selectedNumbers.length > 0 && (
        <div className="flex justify-between">
          <div className="text-sm">
            Đã chọn <span className="font-bold">{selectedNumbers.length}</span> số
          </div>
          <Button variant="outline" size="sm" onClick={handleClearAll} disabled={disabled}>
            Xóa tất cả
          </Button>
        </div>
      )}
    </div>
  );
};

export default NumbersInput;
