import React, { useState, useMemo } from 'react';

import { Search } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

interface BetTypeProps {
  betTypes: any[];
  selectedBetType: string;
  onBetTypeChange: (type: string) => void;
  region: string;
  disabled?: boolean;
}

const BetTypeSelector: React.FC<BetTypeProps> = ({
  betTypes,
  selectedBetType,
  onBetTypeChange,
  region,
  disabled = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Transform betTypes to add displayName and category
  const enhancedBetTypes = useMemo(() => {
    return betTypes.map((betType) => ({
      ...betType,
      displayName: `${betType.name} (${betType.rule_code})`,
      category: getCategoryFromBetType(betType.bet_type, betType.rule_code),
    }));
  }, [betTypes]);

  // Available categories
  const categories = useMemo(() => {
    const categoriesSet = new Set(enhancedBetTypes.map((bt) => bt.category));
    return ['all', ...Array.from(categoriesSet)];
  }, [enhancedBetTypes]);

  // Filter bet types based on search term and active tab
  const filteredBetTypes = useMemo(() => {
    return enhancedBetTypes.filter((betType) => {
      const matchesSearch =
        betType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        betType.rule_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        betType.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = activeTab === 'all' || betType.category === activeTab;

      return matchesSearch && matchesCategory;
    });
  }, [enhancedBetTypes, searchTerm, activeTab]);

  // Group bet types by category
  const groupedBetTypes = useMemo(() => {
    const groups: Record<string, any[]> = {};

    filteredBetTypes.forEach((betType) => {
      const category = betType.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(betType);
    });

    return groups;
  }, [filteredBetTypes]);

  // Helper function to determine category from bet type
  function getCategoryFromBetType(betType: string, ruleCode: string): string {
    if (betType.includes('ĐẦU ĐUÔI')) return 'dau-duoi';
    if (betType.includes('XIU') || ruleCode === 'xc') return 'xiu-chu';
    if (betType.includes('BAO LÔ') || ruleCode.startsWith('b')) return 'bao-lo';
    if (betType.includes('XIÊN') || ruleCode === 'x') return 'xien';
    if (betType.includes('ĐÁ') || ruleCode === 'da') return 'da';
    if (betType.includes('NHẤT TO') || ruleCode === 'nt') return 'nhat-to';
    return 'khac';
  }

  // Map categories to display names
  const categoryNames: Record<string, string> = {
    all: 'Tất cả',
    'dau-duoi': 'Đầu Đuôi',
    'xiu-chu': 'Xỉu Chủ',
    'bao-lo': 'Bao Lô',
    xien: 'Xiên',
    da: 'Đá',
    'nhat-to': 'Nhất To',
    khac: 'Khác',
  };

  // Get selected bet type details
  const selectedBetTypeDetails = enhancedBetTypes.find((bt) => bt.rule_code === selectedBetType);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm loại cược..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={disabled}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full flex overflow-x-auto no-scrollbar">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="flex-shrink-0">
              {categoryNames[category] || category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="space-y-4">
            {Object.entries(groupedBetTypes).map(([category, types]) => (
              <div key={category} className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  {categoryNames[category] || category}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {types.map((betType) => (
                    <Button
                      key={betType.rule_code}
                      variant={selectedBetType === betType.rule_code ? 'default' : 'outline'}
                      className="justify-start px-3 py-2 h-auto"
                      onClick={() => onBetTypeChange(betType.rule_code)}
                      disabled={disabled}
                    >
                      <div className="text-left">
                        <div className="font-medium">{betType.name}</div>
                        <div className="text-xs text-muted-foreground">{betType.rule_code}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            ))}

            {filteredBetTypes.length === 0 && (
              <div className="text-center p-6 bg-gray-50 rounded-md">
                <p className="text-gray-500">Không tìm thấy loại cược phù hợp</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {selectedBetTypeDetails && (
        <div className="rounded-md bg-muted/50 p-3">
          <h3 className="font-medium mb-1">
            {selectedBetTypeDetails.name} ({selectedBetTypeDetails.rule_code})
          </h3>
          <p className="text-sm text-muted-foreground">
            {selectedBetTypeDetails.description || 'Không có mô tả chi tiết.'}
          </p>
          {selectedBetTypeDetails.rate && (
            <p className="text-sm mt-1">
              <span className="text-gray-500">Tỷ lệ thưởng cơ bản:</span>{' '}
              <span className="font-medium">{selectedBetTypeDetails.rate}x</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default BetTypeSelector;
