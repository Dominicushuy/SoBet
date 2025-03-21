import { useState, useEffect, useCallback } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';
import { UseFormReturn, useForm } from 'react-hook-form';

import AmountCalculator from '@/app/bet/components/AmountCalculator';
import BetTypeSelector from '@/app/bet/components/BetTypeSelector';
import ConfirmationDialog from '@/app/bet/components/ConfirmationDialog';
import NumbersInput from '@/app/bet/components/NumbersInput';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import ProvinceSelector from '@/components/ui/lottery/ProvinceSelector';
import RegionSelector from '@/components/ui/lottery/RegionSelector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { calculateBetAmount } from '@/lib/lottery/calculators';
import { useSupabase } from '@/lib/supabase/client';
import { getAllActiveRules, getRuleByCode } from '@/lib/supabase/queries';
import { useAuth } from '@/providers/AuthProvider';
import { BetFormData } from '@/types/bet';

interface BetFormProps {
  form: UseFormReturn<BetFormData>;
  onSubmit: (data: BetFormData) => void;
  isSubmitting: boolean;
}

const BetForm: React.FC<BetFormProps> = ({ form, onSubmit, isSubmitting }) => {
  const { supabase } = useSupabase();
  const router = useRouter();
  const { user, balance, refreshUserData } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableBetTypes, setAvailableBetTypes] = useState<any[]>([]);
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [selectedRule, setSelectedRule] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [formSubmitData, setFormSubmitData] = useState<BetFormData | null>(null);
  const [activeTab, setActiveTab] = useState('region');
  const [maxNumberSelections, setMaxNumberSelections] = useState(0);

  const { watch, setValue, reset, handleSubmit, formState } = form;

  // Watch for changes to these fields
  const selectedRegion = watch('region');
  const selectedProvince = watch('province');
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
      setValue('region', preSelectedRegion as 'M1' | 'M2');
    }

    if (preSelectedType) {
      setValue('bet_type', preSelectedType);
    }
  }, [preSelectedRegion, preSelectedType, setValue]);

  // Fetch available bet types when region changes
  useEffect(() => {
    const fetchBetTypes = async () => {
      if (!selectedRegion) return;

      try {
        const rules = await getAllActiveRules(supabase, selectedRegion as any);
        setAvailableBetTypes(rules);
      } catch (error) {
        console.error('Error fetching bet types:', error);
      }
    };

    fetchBetTypes();
  }, [selectedRegion, supabase]);

  // Fetch rule details when bet type changes
  useEffect(() => {
    const fetchRuleDetails = async () => {
      if (!selectedBetType || !selectedRegion) return;

      try {
        const rule = await getRuleByCode(supabase, selectedBetType, selectedRegion as any);
        setSelectedRule(rule);

        // Set default subtype if available and not already set
        if (rule?.variants && rule.variants.length > 0 && !selectedSubtype) {
          setValue('subtype', rule.variants[0].code);
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
  }, [selectedBetType, selectedSubtype, selectedRegion, supabase, setValue]);

  // Update calculation when relevant fields change
  useEffect(() => {
    const calculateAmount = async () => {
      if (!selectedRule || !selectedNumbers || selectedNumbers.length === 0 || !betAmount) return;

      try {
        const result = calculateBetAmount(
          selectedRule,
          selectedNumbers,
          betAmount,
          selectedSubtype,
          selectedRegion
        );

        setCalculationResult(result);
      } catch (error) {
        console.error('Error calculating bet amount:', error);
      }
    };

    calculateAmount();
  }, [selectedRule, selectedNumbers, betAmount, selectedSubtype, selectedRegion]);

  // Handle date change
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setValue('draw_date', date.toISOString().split('T')[0]);
  };

  // Handle province change
  const handleProvinceChange = (province: string) => {
    setValue('province', province);
  };

  // Handle region change
  const handleRegionChange = (region: string) => {
    setValue('region', region);
    // Reset province and bet type when region changes
    setValue('province', '');
    setValue('bet_type', '');
    setValue('subtype', '');
    setValue('numbers', []);
  };

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Handle form submission with confirmation
  const handleFormSubmit = (data: BetFormData) => {
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
  const canAccessBetTypeTab = !!selectedRegion && !!selectedProvince;
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
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chọn khu vực</FormLabel>
                    <RegionSelector
                      selectedRegion={field.value}
                      onRegionChange={(region) => handleRegionChange(region)}
                      disabled={isSubmitting}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedRegion && (
                <FormField
                  control={form.control}
                  name="province"
                  render={({ field }) => (
                    <FormItem>
                      <ProvinceSelector
                        selectedRegion={selectedRegion}
                        selectedDate={selectedDate}
                        selectedProvince={field.value || ''}
                        onProvinceChange={handleProvinceChange}
                        disabled={isSubmitting}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {selectedRegion && selectedProvince && (
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
                    region={selectedRegion}
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
                <div>{selectedRegion === 'M1' ? 'Miền Nam/Trung' : 'Miền Bắc'}</div>

                <div className="text-gray-500">Tỉnh/Thành phố:</div>
                <div>{selectedProvince}</div>

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
                      {calculationResult.totalStake.toLocaleString('vi-VN')} VND
                    </div>

                    <div className="text-gray-500">Tiềm năng thắng:</div>
                    <div className="font-semibold text-lottery-win">
                      {calculationResult.potentialWin.toLocaleString('vi-VN')} VND
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
            region: selectedRegion,
            province: selectedProvince,
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

export default BetForm;
