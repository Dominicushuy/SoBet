// app/bet/components/MultiBetForm.tsx
import { useState, useEffect, useCallback } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';
import { UseFormReturn } from 'react-hook-form';

import AmountCalculator from '@/app/bet/components/AmountCalculator';
import BetTypeSelector from '@/app/bet/components/BetTypeSelector';
import ConfirmationDialog from '@/app/bet/components/ConfirmationDialog';
import NumbersInput from '@/app/bet/components/NumbersInput';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import MultiProvinceSelector from '@/components/ui/lottery/MultiProvinceSelector';
import MultiRegionSelector from '@/components/ui/lottery/MultiRegionSelector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { calculateBetAmount, calculateMultiProvinceBetAmount } from '@/lib/lottery/calculators';
import { useSupabase } from '@/lib/supabase/client';
import { getAllActiveRules, getRuleByCode } from '@/lib/supabase/queries';
import { MultiBetFormValues } from '@/lib/validators/bet-form';
import { useAuth } from '@/providers/AuthProvider';

interface MultiBetFormProps {
  form: UseFormReturn<MultiBetFormValues>;
  onSubmit: (data: MultiBetFormValues) => void;
  isSubmitting: boolean;
}

// Map các tỉnh đến miền tương ứng (M1 hoặc M2)
const provinceRegionMap: Record<string, string> = {
  // Miền Nam & Miền Trung (M1)
  'TP. HCM': 'M1',
  'Đồng Nai': 'M1',
  'Cần Thơ': 'M1',
  'Đồng Tháp': 'M1',
  'Cà Mau': 'M1',
  'Bến Tre': 'M1',
  'Vũng Tàu': 'M1',
  'Bạc Liêu': 'M1',
  'Đà Nẵng': 'M1',
  'Khánh Hòa': 'M1',
  'Thừa T. Huế': 'M1',
  'Quảng Nam': 'M1',
  'Quảng Bình': 'M1',
  'Quảng Trị': 'M1',
  'Bình Định': 'M1',
  'Phú Yên': 'M1',
  'Gia Lai': 'M1',
  'Ninh Thuận': 'M1',

  // Miền Bắc (M2)
  'Hà Nội': 'M2',
  'Quảng Ninh': 'M2',
  'Bắc Ninh': 'M2',
  'Hải Phòng': 'M2',
  'Nam Định': 'M2',
  'Thái Bình': 'M2',
};

const MultiBetForm: React.FC<MultiBetFormProps> = ({ form, onSubmit, isSubmitting }) => {
  const { supabase } = useSupabase();
  const router = useRouter();
  const { user, balance, refreshUserData } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableBetTypes, setAvailableBetTypes] = useState<any[]>([]);
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [selectedRule, setSelectedRule] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [formSubmitData, setFormSubmitData] = useState<MultiBetFormValues | null>(null);
  const [activeTab, setActiveTab] = useState('region');
  const [maxNumberSelections, setMaxNumberSelections] = useState(0);

  const { watch, setValue, reset, handleSubmit, formState } = form;

  // Watch for changes to form fields
  const selectedRegions = watch('regions');
  const selectedProvinces = watch('provinces');
  const selectedBetType = watch('bet_type');
  const selectedSubtype = watch('subtype');
  const selectedNumbers = watch('numbers');
  const betAmount = watch('amount');

  // Get query parameters
  const searchParams = useSearchParams();
  const preSelectedRegion = searchParams.get('region') || '';
  const preSelectedType = searchParams.get('type') || '';

  // Set pre-selected values from URL
  useEffect(() => {
    if (preSelectedRegion && (preSelectedRegion === 'M1' || preSelectedRegion === 'M2')) {
      setValue('regions', [preSelectedRegion as 'M1' | 'M2']);
    }

    if (preSelectedType) {
      setValue('bet_type', preSelectedType);
    }
  }, [preSelectedRegion, preSelectedType, setValue]);

  // Fetch available bet types when region changes
  useEffect(() => {
    const fetchBetTypes = async () => {
      if (!selectedRegions || selectedRegions.length === 0) return;

      try {
        // Nếu chọn cả hai miền, lấy các quy tắc cho cả hai
        if (selectedRegions.includes('M1') && selectedRegions.includes('M2')) {
          const rules = await getAllActiveRules(supabase, 'BOTH' as any);
          setAvailableBetTypes(rules);
        }
        // Nếu chỉ chọn một miền, lấy quy tắc cho miền đó
        else if (selectedRegions.length === 1) {
          const rules = await getAllActiveRules(supabase, selectedRegions[0] as any);
          setAvailableBetTypes(rules);
        }
      } catch (error) {
        console.error('Error fetching bet types:', error);
      }
    };

    fetchBetTypes();
  }, [selectedRegions, supabase]);

  // Fetch rule details when bet type changes
  useEffect(() => {
    const fetchRuleDetails = async () => {
      if (!selectedBetType || !selectedRegions || selectedRegions.length === 0) return;

      try {
        // Nếu chọn một miền cụ thể, lấy rule cho miền đó
        if (selectedRegions.length === 1) {
          const rule = await getRuleByCode(supabase, selectedBetType, selectedRegions[0] as any);
          setSelectedRule(rule);
        }
        // Nếu chọn cả hai miền, ưu tiên lấy rule cho BOTH
        else {
          const rule = await getRuleByCode(supabase, selectedBetType);
          setSelectedRule(rule);
        }

        // Set default subtype if available and not already set
        if (selectedRule?.variants && selectedRule.variants.length > 0 && !selectedSubtype) {
          setValue('subtype', selectedRule.variants[0].code);
        }

        // Determine max number selection based on bet type
        if (selectedBetType === 'x') {
          // For Xiên, limit based on subtype (x2, x3, x4)
          if (selectedSubtype === 'x2') setMaxNumberSelections(2);
          else if (selectedSubtype === 'x3') setMaxNumberSelections(3);
          else if (selectedSubtype === 'x4') setMaxNumberSelections(4);
          else setMaxNumberSelections(2); // Default
        } else if (selectedBetType === 'da') {
          // For Đá, limit based on subtype (da2, da3, da4, da5)
          if (selectedSubtype === 'da2') setMaxNumberSelections(2);
          else if (selectedSubtype === 'da3') setMaxNumberSelections(3);
          else if (selectedSubtype === 'da4') setMaxNumberSelections(4);
          else if (selectedSubtype === 'da5') setMaxNumberSelections(5);
          else setMaxNumberSelections(2); // Default
        } else {
          // No limit for other bet types
          setMaxNumberSelections(0);
        }
      } catch (error) {
        console.error('Error fetching rule details:', error);
      }
    };

    fetchRuleDetails();
  }, [
    selectedBetType,
    selectedSubtype,
    selectedRegions,
    supabase,
    setValue,
    selectedRule?.variants,
  ]);

  // Update calculation when relevant fields change
  useEffect(() => {
    const calculateAmount = async () => {
      if (
        !selectedRule ||
        !selectedNumbers ||
        selectedNumbers.length === 0 ||
        !betAmount ||
        !selectedProvinces ||
        selectedProvinces.length === 0
      )
        return;

      try {
        if (selectedProvinces.length === 1) {
          // Tính toán cho một tỉnh
          const region =
            provinceRegionMap[selectedProvinces[0]] ||
            (selectedProvinces[0].includes('M1') ? 'M1' : 'M2');

          const result = calculateBetAmount(
            selectedRule,
            selectedNumbers,
            betAmount,
            selectedSubtype,
            region
          );

          setCalculationResult(result);
        } else {
          // Tính toán cho nhiều tỉnh
          const result = calculateMultiProvinceBetAmount(
            selectedRule,
            selectedNumbers,
            betAmount,
            selectedSubtype,
            selectedProvinces,
            provinceRegionMap
          );

          setCalculationResult(result);
        }
      } catch (error) {
        console.error('Error calculating bet amount:', error);
      }
    };

    calculateAmount();
  }, [selectedRule, selectedNumbers, betAmount, selectedSubtype, selectedProvinces]);

  // Handle date change
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setValue('draw_date', date.toISOString().split('T')[0]);
  };

  // Handle regions change
  const handleRegionsChange = (regions: string[]) => {
    setValue('regions', regions as ['M1' | 'M2']);
    // Reset provinces and bet type when region changes
    setValue('provinces', []);
    setValue('bet_type', '');
    setValue('subtype', '');
    setValue('numbers', []);
  };

  // Handle provinces change
  const handleProvincesChange = (provinces: string[]) => {
    setValue('provinces', provinces);
  };

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Handle form submission with confirmation
  const handleFormSubmit = (data: MultiBetFormValues) => {
    setFormSubmitData(data);
    setShowConfirmDialog(true);
  };

  // Cancel confirmation dialog
  const handleCancelConfirmation = () => {
    setShowConfirmDialog(false);
    setFormSubmitData(null);
  };

  // Confirm bet placement
  const handleConfirmBet = async () => {
    if (!formSubmitData) return;

    setShowConfirmDialog(false);
    onSubmit(formSubmitData);
    setFormSubmitData(null);

    // After successful bet placement, refresh user data to update balance
    await refreshUserData();
  };

  // Function to advance to next tab
  const handleNextTab = () => {
    if (activeTab === 'region') {
      setActiveTab('bet-type');
    } else if (activeTab === 'bet-type') {
      setActiveTab('numbers');
    } else if (activeTab === 'numbers') {
      setActiveTab('confirm');
    }
  };

  // Function to go back to previous tab
  const handlePrevTab = () => {
    if (activeTab === 'confirm') {
      setActiveTab('numbers');
    } else if (activeTab === 'numbers') {
      setActiveTab('bet-type');
    } else if (activeTab === 'bet-type') {
      setActiveTab('region');
    }
  };

  // Check if there's missing data to block form tabs
  const canAccessBetTypeTab = selectedRegions.length > 0 && selectedProvinces.length > 0;
  const canAccessNumbersTab = canAccessBetTypeTab && !!selectedBetType;
  const canAccessConfirmTab = canAccessNumbersTab && selectedNumbers.length > 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="region">Khu vực</TabsTrigger>
            <TabsTrigger value="bet-type" disabled={!canAccessBetTypeTab}>
              Loại cược
            </TabsTrigger>
            <TabsTrigger value="numbers" disabled={!canAccessNumbersTab}>
              Chọn số
            </TabsTrigger>
            <TabsTrigger value="confirm" disabled={!canAccessConfirmTab}>
              Xác nhận
            </TabsTrigger>
          </TabsList>

          {/* Step 1: Region Selection */}
          <TabsContent value="region" className="space-y-6 py-4">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="regions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chọn khu vực</FormLabel>
                    <MultiRegionSelector
                      selectedRegions={field.value}
                      onRegionsChange={handleRegionsChange}
                      disabled={isSubmitting}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedRegions.length > 0 && (
                <FormField
                  control={form.control}
                  name="provinces"
                  render={({ field }) => (
                    <FormItem>
                      <MultiProvinceSelector
                        selectedRegions={selectedRegions}
                        selectedDate={selectedDate}
                        selectedProvinces={field.value}
                        onProvincesChange={handleProvincesChange}
                        disabled={isSubmitting}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {selectedRegions.length > 0 && selectedProvinces.length > 0 && (
              <div className="flex justify-end">
                <Button type="button" variant="lottery" onClick={handleNextTab}>
                  Tiếp tục
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Step 2: Bet Type Selection */}
          <TabsContent value="bet-type" className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="bet_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chọn loại cược</FormLabel>
                  <BetTypeSelector
                    betTypes={availableBetTypes}
                    selectedBetType={field.value}
                    onBetTypeChange={(type) => {
                      setValue('bet_type', type);
                      setValue('subtype', ''); // Reset subtype
                      setValue('numbers', []); // Reset numbers
                    }}
                    region={selectedRegions.length === 1 ? selectedRegions[0] : 'BOTH'}
                    disabled={isSubmitting}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedBetType && selectedRule?.variants && (
              <FormField
                control={form.control}
                name="subtype"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chọn kiểu phụ</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {selectedRule.variants.map((variant: any) => (
                        <Button
                          key={variant.code}
                          type="button"
                          variant={field.value === variant.code ? 'default' : 'outline'}
                          onClick={() => {
                            setValue('subtype', variant.code);
                            setValue('numbers', []); // Reset numbers when subtype changes

                            // Update max selections based on subtype
                            if (selectedBetType === 'x') {
                              if (variant.code === 'x2') setMaxNumberSelections(2);
                              else if (variant.code === 'x3') setMaxNumberSelections(3);
                              else if (variant.code === 'x4') setMaxNumberSelections(4);
                            } else if (selectedBetType === 'da') {
                              if (variant.code === 'da2') setMaxNumberSelections(2);
                              else if (variant.code === 'da3') setMaxNumberSelections(3);
                              else if (variant.code === 'da4') setMaxNumberSelections(4);
                              else if (variant.code === 'da5') setMaxNumberSelections(5);
                            }
                          }}
                          disabled={isSubmitting}
                          className="capitalize"
                        >
                          {variant.name}
                        </Button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={handlePrevTab}>
                Quay lại
              </Button>
              <Button
                type="button"
                variant="lottery"
                onClick={handleNextTab}
                disabled={!selectedBetType}
              >
                Tiếp tục
              </Button>
            </div>
          </TabsContent>

          {/* Step 3: Number Selection */}
          <TabsContent value="numbers" className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="numbers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chọn số cược</FormLabel>
                  <NumbersInput
                    selectedNumbers={field.value || []}
                    onNumbersChange={(numbers) => setValue('numbers', numbers)}
                    betType={selectedBetType}
                    subtype={selectedSubtype}
                    rule={selectedRule}
                    disabled={isSubmitting}
                    maxSelectionCount={maxNumberSelections}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={handlePrevTab}>
                Quay lại
              </Button>
              <Button
                type="button"
                variant="lottery"
                onClick={handleNextTab}
                disabled={!selectedNumbers || selectedNumbers.length === 0}
              >
                Tiếp tục
              </Button>
            </div>
          </TabsContent>

          {/* Step 4: Confirmation */}
          <TabsContent value="confirm" className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chọn mệnh giá cược</FormLabel>
                  <AmountCalculator
                    amount={field.value}
                    onAmountChange={(amount) => setValue('amount', amount)}
                    calculationResult={calculationResult}
                    selectedNumbers={selectedNumbers}
                    disabled={isSubmitting}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <Divider />

            <div className="rounded-md bg-muted p-4">
              <h3 className="mb-2 font-semibold">Thông tin đặt cược</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">Khu vực:</div>
                <div>
                  {selectedRegions
                    .map((r) => (r === 'M1' ? 'Miền Nam/Trung' : 'Miền Bắc'))
                    .join(', ')}
                </div>

                <div className="text-gray-500">Tỉnh/Thành phố:</div>
                <div>{selectedProvinces.join(', ')}</div>

                <div className="text-gray-500">Ngày xổ:</div>
                <div>
                  {new Date(selectedDate).toLocaleDateString('vi-VN', { dateStyle: 'full' })}
                </div>

                <div className="text-gray-500">Loại cược:</div>
                <div>
                  {selectedRule?.name} ({selectedBetType})
                </div>

                {selectedSubtype && (
                  <>
                    <div className="text-gray-500">Kiểu phụ:</div>
                    <div>
                      {selectedRule?.variants?.find((v: any) => v.code === selectedSubtype)?.name ||
                        selectedSubtype}
                    </div>
                  </>
                )}

                <div className="text-gray-500">Số lượng số:</div>
                <div>{selectedNumbers?.length || 0}</div>

                <div className="text-gray-500">Mệnh giá mỗi số:</div>
                <div>{betAmount?.toLocaleString('vi-VN')} VND</div>

                {calculationResult && (
                  <>
                    <div className="text-gray-500">Tổng tiền đóng:</div>
                    <div className="font-semibold">
                      {calculationResult.totalStake?.toLocaleString('vi-VN')} VND
                    </div>

                    <div className="text-gray-500">Tiềm năng thắng:</div>
                    <div className="font-semibold text-lottery-win">
                      {calculationResult.potentialWin?.toLocaleString('vi-VN')} VND
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevTab}
                disabled={isSubmitting}
              >
                Quay lại
              </Button>
              <Button type="submit" variant="lottery" disabled={isSubmitting || !calculationResult}>
                {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt cược'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </form>

      {/* Confirmation Dialog */}
      {showConfirmDialog && calculationResult && (
        <ConfirmationDialog
          open={showConfirmDialog}
          onClose={handleCancelConfirmation}
          onConfirm={handleConfirmBet}
          data={{
            region: selectedRegions.join(', '),
            province: selectedProvinces.join(', '),
            betType: selectedRule?.name || selectedBetType,
            subtype:
              selectedRule?.variants?.find((v: any) => v.code === selectedSubtype)?.name ||
              selectedSubtype,
            numbers: selectedNumbers,
            amount: betAmount,
            totalStake: calculationResult.totalStake,
            potentialWin: calculationResult.potentialWin,
            drawDate: selectedDate,
          }}
          isSubmitting={isSubmitting}
        />
      )}
    </Form>
  );
};

export default MultiBetForm;
