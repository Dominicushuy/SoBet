import { useState, useEffect, useMemo } from 'react';

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
  generateTensNumbers,
  generateUnitsNumbers,
  generateDoubleNumbers,
  generateTripleNumbers,
  generateProgressiveNumbers,
} from '@/lib/lottery/number-generators';

interface NumbersInputProps {
  selectedNumbers: string[];
  onNumbersChange: (numbers: string[]) => void;
  betType: string;
  subtype?: string;
  rule?: any;
  disabled?: boolean;
  maxSelectionCount?: number;
}

const NumbersInput: React.FC<NumbersInputProps> = ({
  selectedNumbers,
  onNumbersChange,
  betType,
  subtype,
  rule,
  disabled = false,
  maxSelectionCount = 0,
}) => {
  const [inputMethod, setInputMethod] = useState<
    'direct' | 'zodiac' | 'hiLo' | 'oddEven' | 'pattern' | 'tens' | 'special'
  >('direct');
  const [page, setPage] = useState(1);
  const [inputValue, setInputValue] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [digitCount, setDigitCount] = useState<number>(2);
  const [selectedZodiac, setSelectedZodiac] = useState<string>('');
  const [selectionsAtLimit, setSelectionsAtLimit] = useState<boolean>(false);

  // Lưu ý về giới hạn số lượng số
  const limitMessage = useMemo(() => {
    if (maxSelectionCount > 0) {
      return `Bạn có thể chọn tối đa ${maxSelectionCount} số cược.`;
    }
    return '';
  }, [maxSelectionCount]);

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

  // Kiểm tra trạng thái giới hạn số lượng
  useEffect(() => {
    if (maxSelectionCount > 0) {
      setSelectionsAtLimit(selectedNumbers.length >= maxSelectionCount);
    } else {
      setSelectionsAtLimit(false);
    }
  }, [selectedNumbers, maxSelectionCount]);

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

    // Check if at max capacity
    if (maxSelectionCount > 0 && selectedNumbers.length >= maxSelectionCount) {
      setErrorMessage(`Bạn chỉ có thể chọn tối đa ${maxSelectionCount} số.`);
      return;
    }

    // Add to selected numbers
    onNumbersChange([...selectedNumbers, inputValue]);
    setInputValue('');
    setErrorMessage('');
  };

  const handleRemoveNumber = (number: string) => {
    onNumbersChange(selectedNumbers.filter((n) => n !== number));
    setErrorMessage('');
  };

  const handleSelectNumberFromGrid = (number: string) => {
    if (selectedNumbers.includes(number)) {
      handleRemoveNumber(number);
    } else {
      // Check if at max capacity
      if (maxSelectionCount > 0 && selectedNumbers.length >= maxSelectionCount) {
        setErrorMessage(`Bạn chỉ có thể chọn tối đa ${maxSelectionCount} số.`);
        return;
      }

      onNumbersChange([...selectedNumbers, number]);
      setErrorMessage('');
    }
  };

  const handleClearAll = () => {
    onNumbersChange([]);
    setErrorMessage('');
  };

  const handleGenerateZodiacNumbers = (zodiacCode: string) => {
    setSelectedZodiac(zodiacCode);
    const newNumbers = generateZodiacNumbers(zodiacCode);

    // Filter out numbers that don't match the digit count
    const filteredNumbers = newNumbers.filter((num) => num.length === digitCount);

    // Add to existing numbers without duplicates, respecting max limit
    let combinedNumbers = [...new Set([...selectedNumbers, ...filteredNumbers])];

    // Trim to max if needed
    if (maxSelectionCount > 0 && combinedNumbers.length > maxSelectionCount) {
      setErrorMessage(`Chỉ có thể chọn ${maxSelectionCount} số. Đã chọn những số đầu tiên.`);
      combinedNumbers = combinedNumbers.slice(0, maxSelectionCount);
    } else {
      setErrorMessage('');
    }

    onNumbersChange(combinedNumbers);
  };

  const handleGenerateHiLoNumbers = (type: 'hi' | 'lo') => {
    const newNumbers = generateHiLoNumbers(type);

    // Filter out numbers that don't match the digit count
    const filteredNumbers = newNumbers.filter((num) => num.length === digitCount);

    // Add to existing numbers without duplicates, respecting max limit
    let combinedNumbers = [...new Set([...selectedNumbers, ...filteredNumbers])];

    // Trim to max if needed
    if (maxSelectionCount > 0 && combinedNumbers.length > maxSelectionCount) {
      setErrorMessage(`Chỉ có thể chọn ${maxSelectionCount} số. Đã chọn những số đầu tiên.`);
      combinedNumbers = combinedNumbers.slice(0, maxSelectionCount);
    } else {
      setErrorMessage('');
    }

    onNumbersChange(combinedNumbers);
  };

  const handleGenerateOddEvenNumbers = (type: 'odd' | 'even') => {
    const newNumbers = generateOddEvenNumbers(type);

    // Filter out numbers that don't match the digit count
    const filteredNumbers = newNumbers.filter((num) => num.length === digitCount);

    // Add to existing numbers without duplicates, respecting max limit
    let combinedNumbers = [...new Set([...selectedNumbers, ...filteredNumbers])];

    // Trim to max if needed
    if (maxSelectionCount > 0 && combinedNumbers.length > maxSelectionCount) {
      setErrorMessage(`Chỉ có thể chọn ${maxSelectionCount} số. Đã chọn những số đầu tiên.`);
      combinedNumbers = combinedNumbers.slice(0, maxSelectionCount);
    } else {
      setErrorMessage('');
    }

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

    // Add to existing numbers without duplicates, respecting max limit
    let combinedNumbers = [...new Set([...selectedNumbers, ...filteredPermutations])];

    // Trim to max if needed
    if (maxSelectionCount > 0 && combinedNumbers.length > maxSelectionCount) {
      setErrorMessage(`Chỉ có thể chọn ${maxSelectionCount} số. Đã chọn những số đầu tiên.`);
      combinedNumbers = combinedNumbers.slice(0, maxSelectionCount);
    } else {
      setErrorMessage('');
    }

    onNumbersChange(combinedNumbers);
    setInputValue('');
  };

  const handleGenerateTensNumbers = () => {
    if (!inputValue.trim()) {
      setErrorMessage('Vui lòng nhập chữ số hàng chục (0-9)');
      return;
    }

    const tensDigit = parseInt(inputValue);
    if (isNaN(tensDigit) || tensDigit < 0 || tensDigit > 9) {
      setErrorMessage('Chữ số hàng chục phải từ 0-9');
      return;
    }

    const numbers = generateTensNumbers(tensDigit);

    // Add to existing numbers without duplicates, respecting max limit
    let combinedNumbers = [...new Set([...selectedNumbers, ...numbers])];

    // Trim to max if needed
    if (maxSelectionCount > 0 && combinedNumbers.length > maxSelectionCount) {
      setErrorMessage(`Chỉ có thể chọn ${maxSelectionCount} số. Đã chọn những số đầu tiên.`);
      combinedNumbers = combinedNumbers.slice(0, maxSelectionCount);
    } else {
      setErrorMessage('');
    }

    onNumbersChange(combinedNumbers);
    setInputValue('');
  };

  const handleGenerateUnitsNumbers = () => {
    if (!inputValue.trim()) {
      setErrorMessage('Vui lòng nhập chữ số hàng đơn vị (0-9)');
      return;
    }

    const unitsDigit = parseInt(inputValue);
    if (isNaN(unitsDigit) || unitsDigit < 0 || unitsDigit > 9) {
      setErrorMessage('Chữ số hàng đơn vị phải từ 0-9');
      return;
    }

    const numbers = generateUnitsNumbers(unitsDigit);

    // Add to existing numbers without duplicates, respecting max limit
    let combinedNumbers = [...new Set([...selectedNumbers, ...numbers])];

    // Trim to max if needed
    if (maxSelectionCount > 0 && combinedNumbers.length > maxSelectionCount) {
      setErrorMessage(`Chỉ có thể chọn ${maxSelectionCount} số. Đã chọn những số đầu tiên.`);
      combinedNumbers = combinedNumbers.slice(0, maxSelectionCount);
    } else {
      setErrorMessage('');
    }

    onNumbersChange(combinedNumbers);
    setInputValue('');
  };

  const handleGenerateSpecialNumbers = (type: 'double' | 'triple' | 'progressive') => {
    let numbers: string[] = [];

    switch (type) {
      case 'double':
        numbers = generateDoubleNumbers();
        break;
      case 'triple':
        numbers = generateTripleNumbers();
        break;
      case 'progressive':
        numbers = generateProgressiveNumbers();
        break;
    }

    // Filter by digit count if needed
    const filteredNumbers = numbers.filter((num) => num.length === digitCount);

    // Add to existing numbers without duplicates, respecting max limit
    let combinedNumbers = [...new Set([...selectedNumbers, ...filteredNumbers])];

    // Trim to max if needed
    if (maxSelectionCount > 0 && combinedNumbers.length > maxSelectionCount) {
      setErrorMessage(`Chỉ có thể chọn ${maxSelectionCount} số. Đã chọn những số đầu tiên.`);
      combinedNumbers = combinedNumbers.slice(0, maxSelectionCount);
    } else {
      setErrorMessage('');
    }

    onNumbersChange(combinedNumbers);
  };

  // Kiểm tra xem tab nào nên được disable do giới hạn số
  const shouldDisableAutoSelectionTabs = maxSelectionCount > 0 && maxSelectionCount < 10;

  // Virtual list for selected numbers when there are many
  const renderSelectedNumbers = () => {
    if (selectedNumbers.length === 0) {
      return <div className="text-sm text-gray-500">Chưa có số nào được chọn</div>;
    }

    // Chỉ render tất cả nếu số lượng ít, nếu không thì phân trang
    if (selectedNumbers.length <= 100) {
      return (
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
      );
    } else {
      // Phân trang đơn giản khi có nhiều số

      const itemsPerPage = 50;
      const totalPages = Math.ceil(selectedNumbers.length / itemsPerPage);

      const currentPageNumbers = selectedNumbers.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
      );

      return (
        <div>
          <div className="flex flex-wrap gap-1 mb-2">
            {currentPageNumbers.map((number) => (
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

          <div className="flex justify-between items-center mt-2">
            <div className="text-sm text-gray-500">
              Trang {page} / {totalPages} (tổng {selectedNumbers.length} số)
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Trước
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Sau
              </Button>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="space-y-4">
      {limitMessage && (
        <Alert className="bg-blue-50 text-blue-800 border-blue-200">
          <AlertDescription>{limitMessage}</AlertDescription>
        </Alert>
      )}

      <Tabs value={inputMethod} onValueChange={(value) => setInputMethod(value as any)}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="direct">Nhập trực tiếp</TabsTrigger>
          <TabsTrigger
            value="zodiac"
            disabled={shouldDisableAutoSelectionTabs && !selectedNumbers.length}
          >
            12 Con Giáp
          </TabsTrigger>
          <TabsTrigger
            value="hiLo"
            disabled={shouldDisableAutoSelectionTabs && !selectedNumbers.length}
          >
            Tài/Xỉu
          </TabsTrigger>
          <TabsTrigger
            value="oddEven"
            disabled={shouldDisableAutoSelectionTabs && !selectedNumbers.length}
          >
            Chẵn/Lẻ
          </TabsTrigger>
          <TabsTrigger value="pattern">Đảo số</TabsTrigger>
          <TabsTrigger value="tens">Kéo số</TabsTrigger>
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
                disabled={disabled || selectionsAtLimit}
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                onClick={handleAddNumber}
                disabled={disabled || selectionsAtLimit}
              >
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
            maxSelectCount={maxSelectionCount}
          />
        </TabsContent>

        {/* Zodiac selection */}
        <TabsContent value="zodiac" className="space-y-4">
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            <Button
              onClick={() => handleGenerateZodiacNumbers('ty')}
              variant={selectedZodiac === 'ty' ? 'default' : 'outline'}
              disabled={disabled || selectionsAtLimit}
            >
              Tý (Chuột)
            </Button>
            <Button
              onClick={() => handleGenerateZodiacNumbers('suu')}
              variant={selectedZodiac === 'suu' ? 'default' : 'outline'}
              disabled={disabled || selectionsAtLimit}
            >
              Sửu (Trâu)
            </Button>
            <Button
              onClick={() => handleGenerateZodiacNumbers('dan')}
              variant={selectedZodiac === 'dan' ? 'default' : 'outline'}
              disabled={disabled || selectionsAtLimit}
            >
              Dần (Hổ)
            </Button>
            <Button
              onClick={() => handleGenerateZodiacNumbers('mao')}
              variant={selectedZodiac === 'mao' ? 'default' : 'outline'}
              disabled={disabled || selectionsAtLimit}
            >
              Mão (Mèo)
            </Button>
            <Button
              onClick={() => handleGenerateZodiacNumbers('thin')}
              variant={selectedZodiac === 'thin' ? 'default' : 'outline'}
              disabled={disabled || selectionsAtLimit}
            >
              Thìn (Rồng)
            </Button>
            <Button
              onClick={() => handleGenerateZodiacNumbers('ty')}
              variant={selectedZodiac === 'ty' ? 'default' : 'outline'}
              disabled={disabled || selectionsAtLimit}
            >
              Tỵ (Rắn)
            </Button>
            <Button
              onClick={() => handleGenerateZodiacNumbers('ngo')}
              variant={selectedZodiac === 'ngo' ? 'default' : 'outline'}
              disabled={disabled || selectionsAtLimit}
            >
              Ngọ (Ngựa)
            </Button>
            <Button
              onClick={() => handleGenerateZodiacNumbers('mui')}
              variant={selectedZodiac === 'mui' ? 'default' : 'outline'}
              disabled={disabled || selectionsAtLimit}
            >
              Mùi (Dê)
            </Button>
            <Button
              onClick={() => handleGenerateZodiacNumbers('than')}
              variant={selectedZodiac === 'than' ? 'default' : 'outline'}
              disabled={disabled || selectionsAtLimit}
            >
              Thân (Khỉ)
            </Button>
            <Button
              onClick={() => handleGenerateZodiacNumbers('dau')}
              variant={selectedZodiac === 'dau' ? 'default' : 'outline'}
              disabled={disabled || selectionsAtLimit}
            >
              Dậu (Gà)
            </Button>
            <Button
              onClick={() => handleGenerateZodiacNumbers('tuat')}
              variant={selectedZodiac === 'tuat' ? 'default' : 'outline'}
              disabled={disabled || selectionsAtLimit}
            >
              Tuất (Chó)
            </Button>
            <Button
              onClick={() => handleGenerateZodiacNumbers('hoi')}
              variant={selectedZodiac === 'hoi' ? 'default' : 'outline'}
              disabled={disabled || selectionsAtLimit}
            >
              Hợi (Lợn)
            </Button>
          </div>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="border rounded-md p-4">
            <h3 className="text-sm font-medium mb-2">
              Số đã chọn theo con giáp: {selectedNumbers.length}
            </h3>
            {renderSelectedNumbers()}
          </div>
        </TabsContent>

        {/* Hi/Lo (Tài/Xỉu) selection */}
        <TabsContent value="hiLo" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => handleGenerateHiLoNumbers('hi')}
              className="h-20 text-lg font-bold bg-lottery-m1 hover:bg-lottery-m1/90"
              disabled={disabled || selectionsAtLimit}
            >
              Tài (50-99)
            </Button>
            <Button
              onClick={() => handleGenerateHiLoNumbers('lo')}
              className="h-20 text-lg font-bold bg-lottery-m2 hover:bg-lottery-m2/90"
              disabled={disabled || selectionsAtLimit}
            >
              Xỉu (00-49)
            </Button>
          </div>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="border rounded-md p-4">
            <h3 className="text-sm font-medium mb-2">Đã chọn: {selectedNumbers.length} số</h3>
            <div className="text-sm text-gray-500 mb-2">
              Sử dụng Tài/Xỉu sẽ chọn 50 số cùng một lúc.
            </div>
            {renderSelectedNumbers()}
          </div>
        </TabsContent>

        {/* Odd/Even (Chẵn/Lẻ) selection */}
        <TabsContent value="oddEven" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => handleGenerateOddEvenNumbers('even')}
              className="h-20 text-lg font-bold bg-lottery-primary hover:bg-lottery-primary/90"
              disabled={disabled || selectionsAtLimit}
            >
              Chẵn (00, 02, 04...)
            </Button>
            <Button
              onClick={() => handleGenerateOddEvenNumbers('odd')}
              className="h-20 text-lg font-bold bg-lottery-secondary hover:bg-lottery-secondary/90"
              disabled={disabled || selectionsAtLimit}
            >
              Lẻ (01, 03, 05...)
            </Button>
          </div>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="border rounded-md p-4">
            <h3 className="text-sm font-medium mb-2">Đã chọn: {selectedNumbers.length} số</h3>
            <div className="text-sm text-gray-500 mb-2">
              Sử dụng Chẵn/Lẻ sẽ chọn 50 số cùng một lúc.
            </div>
            {renderSelectedNumbers()}
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
                disabled={disabled || selectionsAtLimit}
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                onClick={handleGeneratePermutations}
                disabled={disabled || selectionsAtLimit}
              >
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
            {renderSelectedNumbers()}
          </div>
        </TabsContent>

        {/* Tens (Kéo số) */}
        <TabsContent value="tens" className="space-y-4">
          <Tabs defaultValue="tens">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="tens">Kéo chục</TabsTrigger>
              <TabsTrigger value="units">Kéo đơn vị</TabsTrigger>
              <TabsTrigger value="special">Số đặc biệt</TabsTrigger>
            </TabsList>

            <TabsContent value="tens" className="space-y-4 py-2">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Label htmlFor="tens-input">Chữ số hàng chục</Label>
                  <Input
                    id="tens-input"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Nhập số từ 0-9"
                    maxLength={1}
                    disabled={disabled || selectionsAtLimit}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={handleGenerateTensNumbers}
                    disabled={disabled || selectionsAtLimit}
                  >
                    Tạo số
                  </Button>
                </div>
              </div>

              <div className="text-sm text-gray-500">
                Tạo ra 10 số có cùng chữ số hàng chục. Ví dụ: kéo chục 2 sẽ tạo ra 20, 21, 22, ...
                29
              </div>
            </TabsContent>

            <TabsContent value="units" className="space-y-4 py-2">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Label htmlFor="units-input">Chữ số hàng đơn vị</Label>
                  <Input
                    id="units-input"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Nhập số từ 0-9"
                    maxLength={1}
                    disabled={disabled || selectionsAtLimit}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={handleGenerateUnitsNumbers}
                    disabled={disabled || selectionsAtLimit}
                  >
                    Tạo số
                  </Button>
                </div>
              </div>

              <div className="text-sm text-gray-500">
                Tạo ra 10 số có cùng chữ số hàng đơn vị. Ví dụ: kéo đơn vị 3 sẽ tạo ra 03, 13, 23,
                ... 93
              </div>
            </TabsContent>

            <TabsContent value="special" className="space-y-4 py-2">
              <div className="grid grid-cols-3 gap-2">
                <Button
                  onClick={() => handleGenerateSpecialNumbers('double')}
                  disabled={disabled || selectionsAtLimit}
                  variant="outline"
                >
                  Số đôi (00, 11, 22...)
                </Button>
                <Button
                  onClick={() => handleGenerateSpecialNumbers('triple')}
                  disabled={disabled || selectionsAtLimit || digitCount < 3}
                  variant="outline"
                >
                  Số ba (111, 222, 333...)
                </Button>
                <Button
                  onClick={() => handleGenerateSpecialNumbers('progressive')}
                  disabled={disabled || selectionsAtLimit || digitCount < 3}
                  variant="outline"
                >
                  Số tiến (123, 234, 345...)
                </Button>
              </div>

              <div className="text-sm text-gray-500">Tạo các số đặc biệt theo quy luật cố định</div>
            </TabsContent>
          </Tabs>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="border rounded-md p-4">
            <h3 className="text-sm font-medium mb-2">Số đã chọn: {selectedNumbers.length}</h3>
            {renderSelectedNumbers()}
          </div>
        </TabsContent>
      </Tabs>

      {selectedNumbers.length > 0 && (
        <div className="flex justify-between">
          <div className="text-sm">
            Đã chọn <span className="font-bold">{selectedNumbers.length}</span> số
            {maxSelectionCount > 0 && <span> / {maxSelectionCount}</span>}
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
