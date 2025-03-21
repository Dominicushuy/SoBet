import { useState, useEffect } from 'react';

import { UseFormReturn } from 'react-hook-form';

import AmountCalculator from '@/app/bet/components/AmountCalculator';
import BetTypeSelector from '@/app/bet/components/BetTypeSelector';
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
import { BetFormData } from '@/types/bet';

interface BetFormProps {
  form: UseFormReturn<BetFormData>;
  onSubmit: (data: BetFormData) => void;
  isSubmitting: boolean;
}

const BetForm: React.FC<BetFormProps> = ({ form, onSubmit, isSubmitting }) => {
  const { supabase } = useSupabase();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableBetTypes, setAvailableBetTypes] = useState<any[]>([]);
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [selectedRule, setSelectedRule] = useState<any>(null);

  const { watch, setValue, reset, handleSubmit, formState } = form;

  // Watch for changes to these fields
  const selectedRegion = watch('region');
  const selectedProvince = watch('province');
  const selectedBetType = watch('bet_type');
  const selectedSubtype = watch('subtype');
  const selectedNumbers = watch('numbers');
  const betAmount = watch('amount');

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
      } catch (error) {
        console.error('Error fetching rule details:', error);
      }
    };

    fetchRuleDetails();
  }, [selectedBetType, selectedRegion, supabase]);

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

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="region" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="region">Khu vực</TabsTrigger>
            <TabsTrigger value="bet-type" disabled={!selectedRegion}>
              Loại cược
            </TabsTrigger>
            <TabsTrigger value="numbers" disabled={!selectedBetType}>
              Chọn số
            </TabsTrigger>
            <TabsTrigger
              value="confirm"
              disabled={!selectedNumbers || selectedNumbers.length === 0}
            >
              Xác nhận
            </TabsTrigger>
          </TabsList>

          {/* Step 1: Region Selection */}
          <TabsContent value="region" className="space-y-4 py-4">
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

            {selectedRegion && selectedProvince && (
              <div className="flex justify-end">
                <Button type="button" variant="lottery">
                  Tiếp tục
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Step 2: Bet Type Selection */}
          <TabsContent value="bet-type" className="space-y-4 py-4">
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
                          onClick={() => setValue('subtype', variant.code)}
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

            {selectedBetType && (
              <div className="flex justify-end">
                <Button type="button" variant="lottery">
                  Tiếp tục
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Step 3: Number Selection */}
          <TabsContent value="numbers" className="space-y-4 py-4">
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
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedNumbers && selectedNumbers.length > 0 && (
              <div className="flex justify-end">
                <Button type="button" variant="lottery">
                  Tiếp tục
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Step 4: Confirmation */}
          <TabsContent value="confirm" className="space-y-4 py-4">
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

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => reset()}
                disabled={isSubmitting}
              >
                Đặt lại
              </Button>
              <Button type="submit" variant="lottery" disabled={isSubmitting || !calculationResult}>
                {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt cược'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
};

export default BetForm;
